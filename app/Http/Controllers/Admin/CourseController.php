<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Room;
use App\Models\User;
use App\Services\TimetableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CourseController extends Controller
{
    protected $timetableService;

    public function __construct(TimetableService $timetableService)
    {
        $this->timetableService = $timetableService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::query()
            ->with('teacher:id,name')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'approved');
            }]);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }
        
        // Sort
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $courses = $query->paginate(10)
            ->withQueryString();

        $teachers = User::role('teacher')->select('id', 'name')->get();

        $filters = [
            'search' => $request->search,
            'teacher_id' => $request->teacher_id,
            'sort_field' => $sortField,
            'sort_direction' => $sortDirection,
        ];

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'teachers' => $teachers,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $teachers = User::role('teacher')->select('id', 'name')->get();
        
        $statuses = [
            'upcoming' => 'Upcoming',
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];
        
        $rooms = Room::where('is_active', true)->get();
        
        return Inertia::render('Admin/Courses/Create', [
            'teachers' => $teachers,
            'statuses' => $statuses,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'feature_1' => 'required|string|max:255',
            'feature_2' => 'required|string|max:255',
            'feature_3' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'schedule' => 'required|array',
            'teacher_id' => 'required|exists:users,id',
            'max_enrollment' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|string|in:upcoming,active,completed,cancelled',
            'scheduling_mode' => 'nullable|string|in:automatic,manual',
            'room_schedules' => 'nullable|array',
        ]);

        // Set default status to active if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }
        
        // Default scheduling mode
        if (!isset($validated['scheduling_mode'])) {
            $validated['scheduling_mode'] = 'automatic';
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('courses', 'public');
            $validated['image'] = $imagePath;
        }

        try {
            // Create the course
            $course = Course::create($validated);
            
            \Illuminate\Support\Facades\Log::debug('Course created', [
                'course_id' => $course->id,
                'title' => $course->title,
                'status' => $course->status,
                'scheduling_mode' => $validated['scheduling_mode']
            ]);
            
            // Handle manual scheduling if provided
            if ($validated['scheduling_mode'] === 'manual' && !empty($request->room_schedules)) {
                foreach ($request->room_schedules as $scheduleData) {
                    $conflicts = $this->timetableService->checkForConflicts($scheduleData);
                    
                    if (empty($conflicts)) {
                        $this->timetableService->scheduleRoom($course, $scheduleData);
                    }
                }
                
                // Go directly to the timetable view
                return redirect()->route('admin.courses.timetable', $course->id)
                    ->with('success', 'Course created with manual scheduling.');
            }
            
            // For automatic scheduling, get the selected days
            $scheduleDays = [];
            foreach ($request->schedule as $day => $selected) {
                if ($selected === true || $selected === 'true' || $selected === 1 || $selected === '1') {
                    $scheduleDays[] = $day;
                }
            }
            
            // Generate timetable options automatically for selected days
            $timetableOptions = $this->timetableService->generateMultipleOptions($course, 5, $scheduleDays);
            
            \Illuminate\Support\Facades\Log::debug('Generated timetable options for days', [
                'course_id' => $course->id,
                'days' => $scheduleDays,
                'options_count' => is_array($timetableOptions) ? count($timetableOptions) : 0
            ]);

            if (is_array($timetableOptions) && !empty($timetableOptions) && isset($timetableOptions[0]) && isset($timetableOptions[0]['error'])) {
                // No valid options were generated - pass the detailed error information
                $errorMessage = $timetableOptions[0]['error'];
                $detailedErrors = $timetableOptions[0]['detailed_errors'] ?? null; 
                $roomConflicts = $timetableOptions[0]['room_conflicts'] ?? null;
                
                return redirect()->route('admin.courses.timetable-options', $course->id)
                    ->with('warning', $errorMessage)
                    ->with('detailed_errors', $detailedErrors)
                    ->with('room_conflicts', $roomConflicts);
            }

            // Redirect to timetable options screen
            return redirect()->route('admin.courses.timetable-options', $course->id)
                ->with('success', 'Course created successfully. Please select a timetable option.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating course', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create course: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load(['teacher:id,name', 'enrollments.user', 'materials', 'homeworks']);
        $course->approved_enrollments_count = $course->enrollments()->where('status', 'approved')->count();
        $course->pending_enrollments_count = $course->enrollments()->where('status', 'pending')->count();
        $course->waitlisted_enrollments_count = $course->enrollments()->where('status', 'waitlisted')->count();
        
        // Get course timetable
        $timetable = $this->timetableService->getCourseTimetable($course);
        
        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'timetable' => $timetable,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        $teachers = User::role('teacher')->select('id', 'name')->get();
        $rooms = Room::where('is_active', true)->get();
        $roomSchedules = $this->timetableService->getCourseTimetable($course);
        
        // Format roomSchedules for frontend consumption
        $formattedRoomSchedules = $roomSchedules->map(function($schedule) {
            return [
                'id' => $schedule->id,
                'day' => $schedule->day_of_week,
                'room_id' => (string) $schedule->room_id,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
            ];
        });
        
        $statuses = [
            'upcoming' => 'Upcoming',
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];
        
        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'teachers' => $teachers,
            'rooms' => $rooms,
            'roomSchedules' => $formattedRoomSchedules,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'feature_1' => 'required|string|max:255',
            'feature_2' => 'required|string|max:255',
            'feature_3' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'schedule' => 'required|array',
            'room_schedules' => 'nullable|array',
            'room_schedules.*.day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'room_schedules.*.start_time' => 'required|string|date_format:H:i',
            'room_schedules.*.end_time' => 'required|string|date_format:H:i|after:room_schedules.*.start_time',
            'teacher_id' => 'required|exists:users,id',
            'max_enrollment' => 'required|integer|min:1|max:20',
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|max:1024',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            
            $path = $request->file('image')->store('courses', 'public');
            $validated['image'] = $path;
        }

        $course->update($validated);

        // Process room schedules if provided
        if ($request->has('room_schedules')) {
            // Remove existing schedules first
            $course->roomSchedules()->delete();
            
            // Add new schedules
            foreach ($request->room_schedules as $scheduleData) {
                // Skip if room_id is empty (to be assigned)
                if (empty($scheduleData['room_id'])) {
                    continue;
                }
                
                $scheduleInfo = [
                    'day' => $scheduleData['day'],
                    'room_id' => $scheduleData['room_id'],
                    'start_time' => $scheduleData['start_time'],
                    'end_time' => $scheduleData['end_time'],
                ];
                
                $conflicts = $this->timetableService->checkForConflicts($scheduleInfo);
                
                if (empty($conflicts)) {
                    $this->timetableService->scheduleRoom($course, $scheduleInfo);
                }
            }
        }

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        // Delete course image if exists
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }
        
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted successfully.');
    }

    /**
     * Generate a timetable for the course.
     */
    public function generateTimetable(Course $course, Request $request)
    {
        $validated = $request->validate([
            'days' => 'required|array',
            'days.*' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
        ]);

        $timetable = $this->timetableService->generateTimetable($course, $validated['days']);

        return response()->json([
            'timetable' => $timetable,
        ]);
    }

    /**
     * View the course timetable.
     */
    public function viewTimetable(Course $course)
    {
        // Ensure the teacher is loaded
        $course->load(['teacher:id,name']);
        
        // Get the timetable
        $timetable = $this->timetableService->getCourseTimetable($course);
        
        // Debug logging to diagnose issue
        \Illuminate\Support\Facades\Log::debug('Viewing timetable', [
            'course_id' => $course->id, 
            'timetable_count' => $timetable->count(),
            'timetable' => $timetable->toArray(),
            'teacher' => $course->teacher ? $course->teacher->toArray() : null,
            'schedules_in_db' => $course->roomSchedules()->count()
        ]);
        
        return Inertia::render('Admin/Courses/Timetable', [
            'course' => $course,
            'timetable' => $timetable,
        ]);
    }

    /**
     * Show available timetable options for a course.
     */
    public function showTimetableOptions(Course $course)
    {
        // Load the teacher for display
        $course->load('teacher:id,name');
        
        // Get all the generated timetable options
        $options = $course->timetableOptions()
            ->orderBy('option_number')
            ->get();
        
        // If no options exist, generate them now
        if ($options->isEmpty()) {
            $generatedOptions = $this->timetableService->generateMultipleOptions($course);
            
            // If we failed to generate options
            if (is_array($generatedOptions) && !empty($generatedOptions) && isset($generatedOptions[0]['error'])) {
                return Inertia::render('Admin/Courses/TimetableOptions', [
                    'course' => $course,
                    'options' => [],
                    'noOptionsAvailable' => true,
                    'error' => $generatedOptions[0]['error'],
                    'detailedErrors' => $generatedOptions[0]['detailed_errors'] ?? [],
                    'roomConflicts' => $generatedOptions[0]['room_conflicts'] ?? []
                ]);
            }
            
            $options = $course->timetableOptions()
                ->orderBy('option_number')
                ->get();
        }
        
        // Get all available rooms for manual scheduling
        $rooms = Room::where('is_active', true)->get();
        
        // Get weekday options
        $days = [
            'monday' => 'Monday',
            'tuesday' => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday' => 'Thursday',
            'friday' => 'Friday',
            'saturday' => 'Saturday',
            'sunday' => 'Sunday',
        ];
        
        // Get time slot options
        $timeSlots = [];
        $allTimeSlots = $this->timetableService->getAllTimeSlots();
        foreach ($allTimeSlots as $i => $slot) {
            $timeSlots[$i] = [
                'start_time' => $slot[0],
                'end_time' => $slot[1],
                'label' => "{$slot[0]} - {$slot[1]}"
            ];
        }
        
        // Get detailed errors from session if they exist
        $detailedErrors = session('detailed_errors', []);
        $roomConflicts = session('room_conflicts', []);
        
        return Inertia::render('Admin/Courses/TimetableOptions', [
            'course' => $course,
            'options' => $options,
            'rooms' => $rooms,
            'days' => $days,
            'timeSlots' => $timeSlots,
            'noOptionsAvailable' => false,
            'detailedErrors' => $detailedErrors,
            'roomConflicts' => $roomConflicts
        ]);
    }

    /**
     * Apply a timetable option to a course.
     */
    public function applyTimetableOption(Course $course, Request $request)
    {
        $validated = $request->validate([
            'option_id' => 'required|exists:timetable_options,id',
        ]);
        
        try {
            $option = $course->timetableOptions()->findOrFail($validated['option_id']);
            
            // Log what we're applying
            \Illuminate\Support\Facades\Log::debug('Applying timetable option', [
                'course_id' => $course->id,
                'option_id' => $option->id,
                'schedule_data' => $option->schedule_data
            ]);
            
            // Ensure course status is active, not draft
            if ($course->status === 'draft') {
                $course->update(['status' => 'active']);
            }
            
            $results = $this->timetableService->applyTimetableOption($course, $option);
            
            // Check for conflicts or errors in results
            if (isset($results['success']) && $results['success'] === false) {
                \Illuminate\Support\Facades\Log::error('Failed to apply timetable option due to conflicts', [
                    'error' => $results['error'] ?? 'Unknown error',
                    'conflicts' => $results['conflicts'] ?? []
                ]);
                
                $errorMessage = $results['error'] ?? 'Timetable could not be applied due to conflicts';
                
                return redirect()->route('admin.courses.timetable-options', $course->id)
                    ->with('error', $errorMessage)
                    ->with('conflicts', $results['conflicts'] ?? []);
            }
            
            // Look at the summary to determine if all schedules were created successfully
            if (isset($results['summary'])) {
                $summary = $results['summary'];
                if ($summary['success'] === false || $summary['error_count'] > 0) {
                    \Illuminate\Support\Facades\Log::warning('Some timetable schedules could not be created', [
                        'success_count' => $summary['success_count'],
                        'error_count' => $summary['error_count'],
                        'total' => $summary['total']
                    ]);
                    
                    if ($summary['success_count'] === 0) {
                        return redirect()->route('admin.courses.timetable-options', $course->id)
                            ->with('error', 'No timetable schedules could be created. Please try another option.');
                    }
                    
                    // Some schedules were created but not all
                    return redirect()->route('admin.courses.timetable', $course->id)
                        ->with('warning', "Only {$summary['success_count']} out of {$summary['total']} schedules were created successfully. Some slots may need manual scheduling.");
                }
            }
            
            // Check if any schedules were created
            $newSchedulesCount = $course->roomSchedules()->count();
            \Illuminate\Support\Facades\Log::debug('Applied timetable results', [
                'results' => $results,
                'new_schedules_count' => $newSchedulesCount
            ]);
            
            if ($newSchedulesCount === 0) {
                return redirect()->route('admin.courses.timetable-options', $course->id)
                    ->with('error', 'No schedules could be created. Please try another option or schedule manually.');
            }
            
            return redirect()->route('admin.courses.timetable', $course->id)
                ->with('success', 'Timetable applied successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error applying timetable option', [
                'error' => $e->getMessage(),
                'course_id' => $course->id
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to apply timetable option: ' . $e->getMessage());
        }
    }

    /**
     * Manually schedule a timeslot for a course.
     */
    public function manualSchedule(Course $course, Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);
        
        try {
            // Ensure course status is active, not draft
            if ($course->status === 'draft') {
                $course->update(['status' => 'active']);
            }
            
            // Format for the service
            $scheduleData = [
                'room_id' => $validated['room_id'],
                'day' => $validated['day_of_week'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
            ];
            
            // Log the manual scheduling attempt
            \Illuminate\Support\Facades\Log::debug('Manual scheduling attempt', [
                'course_id' => $course->id,
                'data' => $scheduleData
            ]);
            
            // Check for conflicts
            $conflicts = $this->timetableService->checkForConflicts($scheduleData);
            
            if (!empty($conflicts)) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'The selected timeslot is not available.')
                    ->with('conflicts', $conflicts);
            }
            
            // Schedule the room
            $roomSchedule = $this->timetableService->scheduleRoom($course, $scheduleData);
            
            // Log the successful scheduling
            \Illuminate\Support\Facades\Log::debug('Manual scheduling successful', [
                'course_id' => $course->id,
                'schedule_id' => $roomSchedule->id
            ]);
            
            return redirect()->route('admin.courses.timetable', $course->id)
                ->with('success', 'Timeslot scheduled successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in manual scheduling', [
                'error' => $e->getMessage(),
                'course_id' => $course->id
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to schedule timeslot: ' . $e->getMessage());
        }
    }

    /**
     * Regenerate timetable options for a course.
     */
    public function regenerateTimetableOptions(Course $course)
    {
        try {
            // Delete existing options
            $deleteCount = $course->timetableOptions()->delete();
            \Illuminate\Support\Facades\Log::debug("Deleted {$deleteCount} existing timetable options");
            
            // Generate new options
            $options = $this->timetableService->generateMultipleOptions($course);
            
            if (is_array($options) && !empty($options) && isset($options[0]['error'])) {
                \Illuminate\Support\Facades\Log::error('Failed to generate new timetable options', [
                    'error' => $options[0]['error'],
                    'course_id' => $course->id,
                    'detailed_errors' => $options[0]['detailed_errors'] ?? [],
                    'room_conflicts' => $options[0]['room_conflicts'] ?? []
                ]);
                
                return redirect()->route('admin.courses.timetable-options', $course->id)
                    ->with('error', $options[0]['error'])
                    ->with('detailed_errors', $options[0]['detailed_errors'] ?? [])
                    ->with('room_conflicts', $options[0]['room_conflicts'] ?? []);
            }
            
            $optionsCount = count($options);
            \Illuminate\Support\Facades\Log::debug("Generated {$optionsCount} new timetable options");
            
            return redirect()->route('admin.courses.timetable-options', $course->id)
                ->with('success', 'Timetable options regenerated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error regenerating timetable options', [
                'error' => $e->getMessage(),
                'course_id' => $course->id
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to regenerate timetable options: ' . $e->getMessage());
        }
    }
}

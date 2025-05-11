<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the enrollments.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'course_id', 'sort_field', 'sort_direction']);
        
        $query = Enrollment::query()
            ->with(['user', 'course'])
            ->when($filters['search'] ?? null, function($query, $search) {
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('course', function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, function($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['course_id'] ?? null, function($query, $courseId) {
                $query->where('course_id', $courseId);
            });
            
        // Apply sorting
        $sortField = $filters['sort_field'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        
        $enrollments = $query->orderBy($sortField, $sortDirection)
            ->paginate(10)
            ->withQueryString();
            
        $courses = Course::select('id', 'title')->get();
        
        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'denied' => 'Denied',
            'waitlisted' => 'Waitlisted',
        ];
            
        return Inertia::render('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'filters' => $filters,
            'statuses' => $statuses,
            'courses' => $courses,
        ]);
    }

    /**
     * Display the specified enrollment.
     */
    public function show(Enrollment $enrollment)
    {
        $enrollment->load(['user', 'course']);
        
        $waitlistCount = Enrollment::where('course_id', $enrollment->course_id)
            ->where('status', 'waitlisted')
            ->count();
        
        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'denied' => 'Denied',
            'waitlisted' => 'Waitlisted',
        ];
        
        return Inertia::render('Admin/Enrollments/Show', [
            'enrollment' => $enrollment,
            'statuses' => $statuses,
            'waitlistCount' => $waitlistCount,
        ]);
    }

    /**
     * Approve an enrollment.
     */
    public function approve(Request $request, Enrollment $enrollment)
    {
        // Check if the course has capacity
        $course = $enrollment->course;
        
        // Check for room capacity restrictions
        $roomCapacityExceeded = false;
        $roomSchedules = $course->roomSchedules()->with('room')->get();
        
        if ($roomSchedules->isNotEmpty()) {
            // Get the smallest room capacity
            $smallestRoomCapacity = $roomSchedules->min(function($schedule) {
                return $schedule->room->capacity;
            });
            
            // Check if approving this enrollment would exceed room capacity
            if ($course->getEnrollmentCount() >= $smallestRoomCapacity && $enrollment->status !== 'approved') {
                $roomCapacityExceeded = true;
                $roomName = $roomSchedules->where('room.capacity', $smallestRoomCapacity)->first()->room->name;
            }
        }
        
        if ($roomCapacityExceeded) {
            // Put the enrollment on waitlist if room capacity is exceeded
            $lastWaitlist = Enrollment::where('course_id', $course->id)
                ->where('status', 'waitlisted')
                ->max('waitlist_position');
                
            $enrollment->status = 'waitlisted';
            $enrollment->waitlist_position = $lastWaitlist ? $lastWaitlist + 1 : 1;
            $enrollment->notes = ($request->input('notes') ?? '') . " (Waitlisted due to room capacity limit in $roomName)";
            $enrollment->save();
            
            return redirect()->back()->with('warning', "Room capacity limit reached. Enrollment added to waitlist.");
        }
        
        if ($course->isFull() && $enrollment->status !== 'approved') {
            // Put the enrollment on waitlist if the course is full
            $lastWaitlist = Enrollment::where('course_id', $course->id)
                ->where('status', 'waitlisted')
                ->max('waitlist_position');
                
            $enrollment->status = 'waitlisted';
            $enrollment->waitlist_position = $lastWaitlist ? $lastWaitlist + 1 : 1;
            $enrollment->notes = $request->input('notes');
            $enrollment->save();
            
            return redirect()->back()->with('warning', 'Course is full. Enrollment added to waitlist.');
        }
        
        // Otherwise approve the enrollment
        $enrollment->status = 'approved';
        $enrollment->waitlist_position = null;
        $enrollment->notes = $request->input('notes');
        $enrollment->save();
        
        // Record this action in history
        // Note: In a real implementation, you would use a separate model for history
        // This is a simplified example
        
        return redirect()->back()->with('success', 'Enrollment approved successfully.');
    }

    /**
     * Deny an enrollment.
     */
    public function deny(Request $request, Enrollment $enrollment)
    {
        $course = $enrollment->course;
        $enrollment->status = 'denied';
        $enrollment->waitlist_position = null;
        $enrollment->notes = $request->input('notes');
        $enrollment->save();
        
        // If this was an approved enrollment, check if waitlisted enrollments can be moved up
        if ($enrollment->getOriginal('status') === 'approved') {
            $this->processWaitlist($enrollment->course);
        }
        
        // Record this action in history
        
        return redirect()->back()->with('success', 'Enrollment denied successfully.');
    }

    /**
     * Update the waitlist position.
     */
    public function updateWaitlist(Request $request, Enrollment $enrollment)
    {
        $request->validate([
            'position' => 'required|integer|min:1',
        ]);
        
        // Only update if the enrollment is waitlisted
        if ($enrollment->status !== 'waitlisted') {
            return redirect()->back()->with('error', 'Only waitlisted enrollments can have their position updated.');
        }
        
        $newPosition = $request->input('position');
        $oldPosition = $enrollment->waitlist_position;
        
        // Update all affected waitlisted enrollments
        if ($newPosition < $oldPosition) {
            // Moving up in the waitlist - increment positions for those in between
            Enrollment::where('course_id', $enrollment->course_id)
                ->where('status', 'waitlisted')
                ->whereBetween('waitlist_position', [$newPosition, $oldPosition - 1])
                ->increment('waitlist_position');
        } else if ($newPosition > $oldPosition) {
            // Moving down in the waitlist - decrement positions for those in between
            Enrollment::where('course_id', $enrollment->course_id)
                ->where('status', 'waitlisted')
                ->whereBetween('waitlist_position', [$oldPosition + 1, $newPosition])
                ->decrement('waitlist_position');
        } else {
            // Position didn't change
            return redirect()->back();
        }
        
        // Update the enrollment's position
        $enrollment->waitlist_position = $newPosition;
        $enrollment->save();
        
        return redirect()->back()->with('success', 'Waitlist position updated successfully.');
    }

    /**
     * Display enrollment history.
     */
    public function history(Request $request)
    {
        $filters = $request->only(['search', 'status', 'action', 'date_from', 'date_to', 'sort_field', 'sort_direction']);
        
        // In a real application, you would have a separate EnrollmentHistory model
        // This is simplified to use the same Enrollment model
        $query = Enrollment::query()
            ->with(['user', 'course'])
            ->select('enrollments.*')
            ->selectRaw("'View Action History' as action")
            ->selectRaw("enrollments.updated_at as action_date")
            ->join('users', 'users.id', '=', 'enrollments.user_id')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id');
            
        // Apply filters
        if ($filters['search'] ?? null) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($subq) use ($search) {
                    $subq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('course', function($subq) use ($search) {
                    $subq->where('title', 'like', "%{$search}%");
                });
            });
        }
        
        if ($filters['status'] ?? null) {
            $query->where('enrollments.status', $filters['status']);
        }
        
        if ($filters['date_from'] ?? null) {
            $query->whereDate('enrollments.updated_at', '>=', $filters['date_from']);
        }
        
        if ($filters['date_to'] ?? null) {
            $query->whereDate('enrollments.updated_at', '<=', $filters['date_to']);
        }
            
        // Apply sorting
        $sortField = $filters['sort_field'] ?? 'action_date';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        
        if ($sortField === 'action_date') {
            $query->orderBy('enrollments.updated_at', $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }
        
        $history = $query->paginate(15)
            ->withQueryString();
            
        // For demonstration purposes, fake the action_by field
        // In a real app, this would come from your enrollment history table
        foreach ($history->items() as $item) {
            $item->action_by = Auth::user();
            $item->course_title = $item->course->title;
            
            // Determine action based on status (simplified)
            if ($item->status === 'approved') {
                $item->action = 'approved';
            } elseif ($item->status === 'denied') {
                $item->action = 'denied';
            } elseif ($item->status === 'waitlisted') {
                $item->action = 'waitlisted';
            } else {
                $item->action = 'created';
            }
        }
        
        $statuses = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'denied' => 'Denied',
            'waitlisted' => 'Waitlisted',
        ];
        
        $actions = [
            'created' => 'Enrollment Created',
            'approved' => 'Enrollment Approved',
            'denied' => 'Enrollment Denied',
            'waitlisted' => 'Added to Waitlist',
            'position_changed' => 'Waitlist Position Changed',
        ];
        
        return Inertia::render('Admin/Enrollments/History', [
            'history' => $history,
            'filters' => $filters,
            'statuses' => $statuses,
            'actions' => $actions,
        ]);
    }

    /**
     * Process waitlist after space becomes available in a course.
     */
    private function processWaitlist(Course $course)
    {
        // Check if course has available spots
        if (!$course->isFull()) {
            // Get the first waitlisted enrollment
            $waitlisted = Enrollment::where('course_id', $course->id)
                ->where('status', 'waitlisted')
                ->orderBy('waitlist_position')
                ->first();
                
            if ($waitlisted) {
                // Approve the enrollment
                $waitlisted->status = 'approved';
                $waitlisted->waitlist_position = null;
                $waitlisted->save();
                
                // Shift up the waitlist
                Enrollment::where('course_id', $course->id)
                    ->where('status', 'waitlisted')
                    ->where('waitlist_position', '>', $waitlisted->getOriginal('waitlist_position'))
                    ->decrement('waitlist_position');
                    
                // Continue processing if more spots available
                $this->processWaitlist($course);
            }
        }
    }
} 
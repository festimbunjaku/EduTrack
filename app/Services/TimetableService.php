<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Room;
use App\Models\RoomSchedule;
use App\Models\TimetableOption;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimetableService
{
    /**
     * Generate an optimal timetable for a course
     */
    public function generateTimetable(Course $course, array $scheduleDays): array
    {
        $results = [];
        $scheduleDuration = 90; // 1 hour and 30 minutes in minutes

        foreach ($scheduleDays as $day) {
            // Find available timeslots for this day
            $availableSlot = $this->findAvailableSlot($day, $scheduleDuration);
            
            if ($availableSlot) {
                $results[] = [
                    'day' => $day,
                    'room_id' => $availableSlot['room_id'],
                    'start_time' => $availableSlot['start_time'],
                    'end_time' => $availableSlot['end_time'],
                ];
            } else {
                // No slot available for this day
                $results[] = [
                    'day' => $day,
                    'error' => 'No available rooms for this day',
                ];
            }
        }

        return $results;
    }

    /**
     * Generate multiple timetable options for a course
     * 
     * @param Course $course
     * @param int $optionsCount The number of options to generate
     * @param array|null $specificDays Optional array of specific days to use
     * @return array
     */
    public function generateMultipleOptions(Course $course, int $optionsCount = 5, ?array $specificDays = null): array
    {
        // First, delete any existing options for this course
        TimetableOption::where('course_id', $course->id)->delete();
        
        // Generate days needed for the course (based on course schedule or specific days provided)
        $scheduleDays = $specificDays ?? $this->getScheduleDaysForCourse($course);
        
        // If we still don't have days specified, use default weekdays
        if (empty($scheduleDays)) {
            $scheduleDays = ['monday', 'wednesday', 'friday'];
        }
        
        // Debug info
        Log::info('Generating timetable options', [
            'course_id' => $course->id,
            'schedule_days' => $scheduleDays,
            'specific_days_provided' => $specificDays !== null
        ]);
        
        // Core structure to hold the possible options
        $allOptions = [];
        $generatedOptions = 0;
        $validationErrors = [];
        $roomConflictErrors = [];
        
        // Get all potential time slots
        $allTimeSlots = $this->getAllTimeSlots();
        
        // Get all available rooms
        $rooms = Room::where('is_active', true)->get();
        
        Log::info('Available rooms', [
            'count' => $rooms->count(),
            'rooms' => $rooms->pluck('name')->toArray()
        ]);
        
        if ($rooms->isEmpty()) {
            return [['error' => 'No active rooms available. Please create rooms first.']];
        }
        
        // Check for teacher conflicts
        $teacherConflicts = [];
        if ($course->teacher_id) {
            // Get existing schedules for the teacher
            $teacherSchedules = RoomSchedule::whereHas('course', function($query) use ($course) {
                $query->where('teacher_id', $course->teacher_id);
            })->get();
            
            // Group by day and time for easier conflict checking
            $teacherTimeSlots = [];
            foreach ($teacherSchedules as $schedule) {
                $key = $schedule->day_of_week . '_' . $schedule->start_time . '_' . $schedule->end_time;
                $teacherTimeSlots[$key] = true;
                
                // Add to conflicts for logging
                $teacherConflicts[] = [
                    'day' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'course_title' => $schedule->course->title ?? 'Unknown course'
                ];
            }
        }
        
        // Generate combinations of days, times, and rooms
        foreach ($scheduleDays as $day) {
            $dayOptions = [];
            
            foreach ($allTimeSlots as $timeSlot) {
                [$startTime, $endTime] = $timeSlot;
                
                // Check for teacher conflicts first
                $teacherTimeKey = $day . '_' . $startTime . '_' . $endTime;
                if (isset($teacherTimeSlots[$teacherTimeKey])) {
                    $validationErrors[] = [
                        'type' => 'teacher_conflict',
                        'day' => $day,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'message' => "The teacher is already scheduled during this time slot"
                    ];
                    continue; // Skip this time slot
                }
                
                $availableRooms = [];
                foreach ($rooms as $room) {
                    if ($room->isAvailable($day, $startTime, $endTime)) {
                        // This is a valid slot
                        $availableRooms[] = $room;
                    } else {
                        // Track room conflicts for better error reporting
                        $conflicts = $this->checkForConflicts([
                            'room_id' => $room->id,
                            'day' => $day,
                            'start_time' => $startTime,
                            'end_time' => $endTime
                        ]);
                        
                        if (!empty($conflicts)) {
                            foreach ($conflicts as $conflict) {
                                $roomConflictErrors[] = array_merge($conflict, [
                                    'room_name' => $room->name,
                                    'day' => $day,
                                    'time' => "$startTime - $endTime"
                                ]);
                            }
                        }
                    }
                }
                
                if (!empty($availableRooms)) {
                    // Add options with all available rooms for this time slot
                    foreach ($availableRooms as $room) {
                        $option = [
                            'day' => $day,
                            'room_id' => $room->id,
                            'room_name' => $room->name,
                            'start_time' => $startTime,
                            'end_time' => $endTime,
                        ];
                        
                        $dayOptions[] = $option;
                    }
                }
            }
            
            // Check if we found any options for this day
            if (empty($dayOptions)) {
                $validationErrors[] = [
                    'type' => 'no_slots_for_day',
                    'day' => $day,
                    'message' => "No available time slots found for " . ucfirst($day)
                ];
            }
            
            // Add all options for this day
            $allOptions = array_merge($allOptions, $dayOptions);
        }
        
        Log::info('Generated slot options', [
            'count' => count($allOptions),
            'validation_errors' => $validationErrors,
            'room_conflicts' => $roomConflictErrors
        ]);
        
        // If we don't have enough options, return detailed error information
        if (empty($allOptions)) {
            $errorMessage = 'No available slots found for the requested schedule.';
            
            // Add more specific details if we have them
            if (!empty($validationErrors)) {
                if (count(array_filter($validationErrors, function($e) { return $e['type'] === 'teacher_conflict'; })) > 0) {
                    $errorMessage .= ' The teacher has scheduling conflicts.';
                }
                
                if (count(array_filter($validationErrors, function($e) { return $e['type'] === 'no_slots_for_day'; })) > 0) {
                    $errorMessage .= ' Some days have no available time slots.';
                }
            }
            
            if (!empty($roomConflictErrors)) {
                $errorMessage .= ' All rooms are booked during the requested times.';
            }
            
            return [
                [
                    'error' => $errorMessage,
                    'detailed_errors' => $validationErrors,
                    'room_conflicts' => $roomConflictErrors
                ]
            ];
        }
        
        // Generate different combinations
        $optionSets = [];
        
        // Sort by room utilization potential
        usort($allOptions, function ($a, $b) {
            $roomA = Room::find($a['room_id']);
            $roomB = Room::find($b['room_id']);
            
            // Compare rooms by utilization (how many existing schedules they have)
            $roomAScheduleCount = $roomA->schedules()->count();
            $roomBScheduleCount = $roomB->schedules()->count();
            
            // Return rooms with more schedules first (better utilization)
            return $roomBScheduleCount <=> $roomAScheduleCount;
        });
        
        // Now build different scheduling options
        $maxOptions = min($optionsCount, 5); // Cap at 5 options
        $days = count($scheduleDays);
        
        // Create combinations to generate different options
        for ($i = 0; $i < $maxOptions; $i++) {
            $optionSet = [];
            $usedRoomDayTime = [];
            
            // Try to get different options for each day
            foreach ($scheduleDays as $day) {
                $foundSlotForDay = false;
                
                // Start from a different position each time to get diversity
                $offset = ($i * 10) % max(1, count($allOptions));
                $sortedOptions = array_merge(
                    array_slice($allOptions, $offset),
                    array_slice($allOptions, 0, $offset)
                );
                
                // Find an available option for this day
                foreach ($sortedOptions as $option) {
                    if ($option['day'] === $day) {
                        $key = $option['room_id'] . '_' . $day . '_' . $option['start_time'];
                        
                        if (!isset($usedRoomDayTime[$key])) {
                            $optionSet[] = $option;
                            $usedRoomDayTime[$key] = true;
                            $foundSlotForDay = true;
                            break;
                        }
                    }
                }
                
                // If we couldn't find a slot for this day, grab any available one
                if (!$foundSlotForDay) {
                    foreach ($sortedOptions as $option) {
                        if ($option['day'] === $day) {
                            $optionSet[] = $option;
                            break;
                        }
                    }
                }
            }
            
            // Only add valid option sets that have slots for all required days
            if (count($optionSet) === count($scheduleDays)) {
                // Calculate utilization score
                $utilizationScore = $this->evaluateRoomUtilization($optionSet);
                $optionSets[] = [
                    'schedule' => $optionSet,
                    'utilization_score' => $utilizationScore
                ];
                $generatedOptions++;
            }
        }
        
        // Sort by utilization score (highest first)
        usort($optionSets, function ($a, $b) {
            return $b['utilization_score'] <=> $a['utilization_score'];
        });
        
        // Store in database and prepare return values
        $storedOptions = [];
        foreach ($optionSets as $index => $optionSet) {
            $option = TimetableOption::create([
                'course_id' => $course->id,
                'schedule_data' => $optionSet['schedule'],
                'utilization_score' => $optionSet['utilization_score'],
                'option_number' => $index + 1
            ]);
            
            $storedOptions[] = $option;
        }
        
        return $storedOptions;
    }
    
    /**
     * Fallback when no options are available
     */
    private function createNoOptionsAvailableResponse(): array
    {
        Log::error('No available timetable options could be generated');
        return [
            ['error' => 'No available slots found for the requested schedule. Please ensure there are active rooms in the system.']
        ];
    }
    
    /**
     * Get all possible time slots from 9:00 to 20:00
     */
    public function getAllTimeSlots(): array
    {
        return [
            ['09:00', '10:30'],
            ['10:45', '12:15'],
            ['12:30', '14:00'],
            ['14:15', '15:45'],
            ['16:00', '17:30'],
            ['17:45', '19:15'],
            ['18:30', '20:00'],
        ];
    }
    
    /**
     * Determine which days are needed for a course
     */
    private function getScheduleDaysForCourse(Course $course): array
    {
        // If the course already has a schedule defined
        if (isset($course->schedule) && is_array($course->schedule)) {
            $days = [];
            foreach ($course->schedule as $day => $value) {
                if ($value) {
                    $days[] = strtolower($day);
                }
            }
            return $days;
        }
        
        // Default to 3 days per week if schedule not specified
        return ['monday', 'wednesday', 'friday'];
    }
    
    /**
     * Evaluate the room utilization score for a schedule
     * Higher score means better utilization
     * 
     * @param array $schedule
     * @return float
     */
    public function evaluateRoomUtilization(array $schedule): float
    {
        // Start with base score
        $score = 10.0;
        $roomIds = [];
        $dayTimeSlots = [];
        
        foreach ($schedule as $slot) {
            // Factor 1: Fewer unique rooms is better (reusing rooms)
            $roomIds[$slot['room_id']] = true;
            
            // Factor 2: Check if we're maximizing usage across days for each room
            $key = $slot['room_id'] . '_' . $slot['day'];
            if (!isset($dayTimeSlots[$key])) {
                $dayTimeSlots[$key] = 0;
            }
            $dayTimeSlots[$key]++;
            
            // Check how many other schedules this room has (more is better for utilization)
            $roomSchedulesCount = RoomSchedule::where('room_id', $slot['room_id'])->count();
            $score += min(5, $roomSchedulesCount * 0.5); // Cap the bonus
        }
        
        // More unique rooms reduces score (we want to reuse rooms)
        $score -= count($roomIds) * 0.5;
        
        // Check if we're using the same rooms across multiple days (better utilization)
        foreach ($roomIds as $roomId => $value) {
            $daysUsed = 0;
            foreach ($schedule as $slot) {
                if ($slot['room_id'] == $roomId) {
                    $daysUsed++;
                }
            }
            
            // Bonus for reusing the same room
            $score += $daysUsed * 0.5;
        }
        
        // Normalize between 0-100
        $score = min(100, max(0, $score * 5));
        
        return $score;
    }

    /**
     * Find an available room and time slot for a specific day
     */
    private function findAvailableSlot(string $day, int $duration): ?array
    {
        // We'll use fixed time slots from 9:00 to 20:00 with class durations of 1.5 hours
        $timeSlots = $this->getAllTimeSlots();
        
        // Get all available rooms
        $rooms = Room::where('is_active', true)->get();
        
        // For each time slot, check each room until we find an available one
        foreach ($timeSlots as $slot) {
            [$startTime, $endTime] = $slot;
            
            foreach ($rooms as $room) {
                if ($room->isAvailable($day, $startTime, $endTime)) {
                    return [
                        'room_id' => $room->id,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                    ];
                }
            }
        }
        
        return null; // No available slots found
    }

    /**
     * Schedule a course in a room
     */
    public function scheduleRoom(Course $course, array $scheduleData): RoomSchedule
    {
        Log::debug('Creating room schedule with data', [
            'course_id' => $course->id,
            'data' => $scheduleData
        ]);
        
        // Ensure the times are properly formatted for database storage
        $startTime = $scheduleData['start_time'];
        $endTime = $scheduleData['end_time'];
        
        // Check if we have day_of_week or day in the data
        $dayOfWeek = $scheduleData['day_of_week'] ?? ($scheduleData['day'] ?? null);
        if (!$dayOfWeek) {
            throw new \InvalidArgumentException('No day specified in schedule data');
        }
        
        // Make sure day field uses 'day_of_week' as required by the model
        $data = [
            'course_id' => $course->id,
            'room_id' => $scheduleData['room_id'],
            'day_of_week' => $dayOfWeek,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'is_recurring' => true,
        ];
        
        Log::debug('Final room schedule data before creation', $data);
        
        return RoomSchedule::create($data);
    }

    /**
     * Check if there are conflicts in the proposed schedule
     */
    public function checkForConflicts(array $scheduleData): array
    {
        $conflicts = [];
        $room = Room::findOrFail($scheduleData['room_id']);

        // Get day from either 'day_of_week' or 'day' field
        $dayOfWeek = $scheduleData['day_of_week'] ?? ($scheduleData['day'] ?? null);
        if (!$dayOfWeek) {
            throw new \InvalidArgumentException('No day specified in schedule data');
        }

        if (!$room->isAvailable(
            $dayOfWeek,
            $scheduleData['start_time'],
            $scheduleData['end_time']
        )) {
            // Find the conflicting schedules for detailed information
            $conflictingSchedules = $room->schedules()
                ->where('day_of_week', $dayOfWeek)
                ->where(function ($query) use ($scheduleData) {
                    $query->where('start_time', '<', $scheduleData['end_time'])
                        ->where('end_time', '>', $scheduleData['start_time']);
                })
                ->with(['course:id,title', 'course.teacher:id,name'])
                ->get();
                
            foreach ($conflictingSchedules as $conflict) {
                $conflicts[] = [
                    'message' => "Room {$room->name} is already scheduled",
                    'details' => [
                        'course' => $conflict->course->title,
                        'teacher' => $conflict->course->teacher->name ?? 'Unknown',
                        'time' => "{$conflict->start_time} - {$conflict->end_time}"
                    ]
                ];
            }
        }

        return $conflicts;
    }

    /**
     * Get available rooms for a specific day and time
     */
    public function getAvailableRooms(string $day, string $startTime, string $endTime): Collection
    {
        $rooms = Room::where('is_active', true)->get();
        
        return $rooms->filter(function ($room) use ($day, $startTime, $endTime) {
            return $room->isAvailable($day, $startTime, $endTime);
        });
    }

    /**
     * Get a formatted timetable for a course
     */
    public function getCourseTimetable(Course $course): Collection
    {
        return $course->roomSchedules()
            ->with('room')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get a timetable for a teacher
     */
    public function getTeacherTimetable(int $teacherId): Collection
    {
        return RoomSchedule::whereHas('course', function ($query) use ($teacherId) {
                $query->where('teacher_id', $teacherId);
            })
            ->with(['course', 'room'])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get a timetable for a room
     */
    public function getRoomTimetable(int $roomId): Collection
    {
        return RoomSchedule::where('room_id', $roomId)
            ->with(['course.teacher'])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get all room timetables
     */
    public function getAllRoomTimetables(): array
    {
        $timetables = [];
        $rooms = Room::where('is_active', true)->get();

        foreach ($rooms as $room) {
            $timetables[$room->id] = [
                'room' => $room,
                'schedules' => $this->getRoomTimetable($room->id),
            ];
        }

        return $timetables;
    }
    
    /**
     * Apply a timetable option to a course
     */
    public function applyTimetableOption(Course $course, TimetableOption $option): array
    {
        $results = [];
        $schedule = $option->schedule_data;
        $allConflicts = [];
        
        // Log what we're processing
        Log::debug('Processing schedule data for application', [
            'schedule_data' => $schedule,
            'count' => count($schedule)
        ]);
        
        // Validate teacher availability first
        $teacherConflicts = [];
        if ($course->teacher_id) {
            foreach ($schedule as $slot) {
                // Check teacher's existing schedules for conflicts (excluding this course)
                $teacherSchedules = RoomSchedule::whereHas('course', function($query) use ($course) {
                    $query->where('teacher_id', $course->teacher_id)
                        ->where('id', '!=', $course->id);
                })
                ->where('day_of_week', $slot['day'])
                ->where(function ($query) use ($slot) {
                    $query->where('start_time', '<', $slot['end_time'])
                        ->where('end_time', '>', $slot['start_time']);
                })
                ->with(['course:id,title'])
                ->get();
                
                foreach ($teacherSchedules as $conflict) {
                    $teacherConflicts[] = [
                        'day' => $slot['day'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                        'conflict_course' => $conflict->course->title,
                        'conflict_time' => "{$conflict->start_time} - {$conflict->end_time}",
                        'message' => "Teacher already scheduled for {$conflict->course->title} at {$conflict->start_time} - {$conflict->end_time}"
                    ];
                }
            }
        }
        
        // If teacher conflicts exist, don't proceed with scheduling
        if (!empty($teacherConflicts)) {
            Log::warning('Teacher scheduling conflicts detected', [
                'course_id' => $course->id, 
                'teacher_id' => $course->teacher_id,
                'conflicts' => $teacherConflicts
            ]);
            
            return [
                'success' => false,
                'error' => 'Teacher scheduling conflicts detected',
                'conflicts' => $teacherConflicts
            ];
        }
        
        // Check room conflicts for all slots before making any changes
        foreach ($schedule as $slot) {
            $conflicts = $this->checkForConflicts($slot);
            if (!empty($conflicts)) {
                $allConflicts = array_merge($allConflicts, $conflicts);
            }
        }
        
        // If any conflicts exist, don't proceed with scheduling
        if (!empty($allConflicts)) {
            Log::warning('Room scheduling conflicts detected', [
                'course_id' => $course->id, 
                'conflicts' => $allConflicts
            ]);
            
            return [
                'success' => false,
                'error' => 'Room scheduling conflicts detected',
                'conflicts' => $allConflicts
            ];
        }
        
        // Clear any existing schedules for this course
        $deleteCount = $course->roomSchedules()->delete();
        Log::debug("Deleted {$deleteCount} existing schedules");
        
        // Apply the new schedule
        $successCount = 0;
        $errorCount = 0;
        
        foreach ($schedule as $slot) {
            Log::debug('Processing slot', $slot);
            
            // Ensure we have all required fields
            if (!isset($slot['day']) || !isset($slot['room_id']) || 
                !isset($slot['start_time']) || !isset($slot['end_time'])) {
                Log::error('Missing required fields in slot', $slot);
                $results[] = [
                    'success' => false,
                    'error' => 'Invalid slot data: missing required fields'
                ];
                $errorCount++;
                continue;
            }
            
            try {
                $roomSchedule = $this->scheduleRoom($course, $slot);
                Log::debug('Created room schedule', [
                    'id' => $roomSchedule->id,
                    'day' => $roomSchedule->day_of_week,
                    'room_id' => $roomSchedule->room_id
                ]);
                $results[] = [
                    'success' => true,
                    'message' => "Scheduled for {$slot['day']} at {$slot['start_time']}-{$slot['end_time']} in Room #{$slot['room_id']}"
                ];
                $successCount++;
            } catch (\Exception $e) {
                Log::error('Failed to create schedule', [
                    'error' => $e->getMessage(),
                    'slot' => $slot
                ]);
                $results[] = [
                    'success' => false,
                    'error' => 'Failed to create schedule: ' . $e->getMessage()
                ];
                $errorCount++;
            }
        }
        
        $results['summary'] = [
            'success' => $errorCount === 0,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'total' => count($schedule)
        ];
        
        return $results;
    }
} 
<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Room;
use App\Models\RoomSchedule;
use Carbon\Carbon;
use Illuminate\Support\Collection;

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
     * Find an available room and time slot for a specific day
     */
    private function findAvailableSlot(string $day, int $duration): ?array
    {
        // We'll use fixed time slots from 9:00 to 18:00 with class durations of 1.5 hours
        $timeSlots = [
            ['09:00', '10:30'],
            ['10:45', '12:15'],
            ['13:00', '14:30'],
            ['14:45', '16:15'],
            ['16:30', '18:00'],
        ];
        
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
        return RoomSchedule::create([
            'course_id' => $course->id,
            'room_id' => $scheduleData['room_id'],
            'day_of_week' => $scheduleData['day'],
            'start_time' => $scheduleData['start_time'],
            'end_time' => $scheduleData['end_time'],
            'is_recurring' => true,
        ]);
    }

    /**
     * Check if there are conflicts in the proposed schedule
     */
    public function checkForConflicts(array $scheduleData): array
    {
        $conflicts = [];
        $room = Room::findOrFail($scheduleData['room_id']);

        if (!$room->isAvailable(
            $scheduleData['day'],
            $scheduleData['start_time'],
            $scheduleData['end_time']
        )) {
            $conflicts[] = "Room {$room->name} is not available at the requested time";
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
} 
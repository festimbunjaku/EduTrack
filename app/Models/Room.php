<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the schedules for the room
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(RoomSchedule::class);
    }

    /**
     * Check if the room is available at the specified time
     */
    public function isAvailable(string $dayOfWeek, string $startTime, string $endTime): bool
    {
        // Log inputs for debugging
        \Illuminate\Support\Facades\Log::debug("Checking availability for room {$this->name}", [
            'room_id' => $this->id,
            'day' => $dayOfWeek,
            'start_time' => $startTime,
            'end_time' => $endTime
        ]);
        
        // Check if there are any overlapping schedules
        $overlappingSchedules = $this->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($query) use ($startTime, $endTime) {
                // Check if the new time overlaps with existing schedules
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                });
            })
            ->count();
        
        \Illuminate\Support\Facades\Log::debug("Room {$this->name} availability result", [
            'overlapping_schedules' => $overlappingSchedules,
            'is_available' => $overlappingSchedules === 0
        ]);
        
        return $overlappingSchedules === 0;
    }
} 
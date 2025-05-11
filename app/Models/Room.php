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
        // Check if there are any overlapping schedules
        return !$this->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($query) use ($startTime, $endTime) {
                // Check if the new time overlaps with existing schedules
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                });
            })
            ->exists();
    }
} 
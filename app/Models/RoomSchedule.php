<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'room_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_recurring',
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    /**
     * Get the course that owns the schedule
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the room that owns the schedule
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
} 
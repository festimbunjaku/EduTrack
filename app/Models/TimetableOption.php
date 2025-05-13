<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableOption extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'course_id',
        'schedule_data',
        'utilization_score',
        'option_number',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'schedule_data' => 'array',
        'utilization_score' => 'float',
    ];

    /**
     * Get the course that owns the timetable option
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}

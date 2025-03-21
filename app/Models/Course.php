<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'feature_1',
        'feature_2',
        'feature_3',
        'price',
        'start_date',
        'end_date',
        'schedule',
        'teacher_id',
        'max_enrollment',
        'status',
        'location',
        'image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'schedule' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
    ];

    /**
     * Course status constants
     */
    const STATUS_UPCOMING = 'upcoming';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the teacher associated with the course.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the enrollments for the course.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Get the materials for the course.
     */
    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Get the homework assignments for the course.
     */
    public function homeworks(): HasMany
    {
        return $this->hasMany(Homework::class);
    }

    /**
     * Get the certificates for the course.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Check if course is full
     */
    public function isFull(): bool
    {
        return $this->enrollments()->where('status', 'approved')->count() >= $this->max_enrollment;
    }

    /**
     * Get approved enrollments count
     */
    public function getEnrollmentCount(): int
    {
        return $this->enrollments()->where('status', 'approved')->count();
    }

    /**
     * Get available spots count
     */
    public function getAvailableSpots(): int
    {
        return $this->max_enrollment - $this->getEnrollmentCount();
    }

    /**
     * Get students who are eligible for certificates
     * (approved enrollments for completed courses)
     */
    public function getEligibleStudentsForCertificate()
    {
        // Only completed courses can issue certificates
        if ($this->status !== self::STATUS_COMPLETED) {
            return collect();
        }
        
        $enrolledStudents = $this->enrollments()
            ->where('status', 'approved')
            ->with('user')
            ->get()
            ->pluck('user');
            
        // Get existing certificates for this course
        $existingCertificates = $this->certificates()
            ->pluck('user_id')
            ->toArray();
            
        // Filter out students who already have certificates
        return $enrolledStudents->filter(function ($student) use ($existingCertificates) {
            return !in_array($student->id, $existingCertificates);
        })->values();
    }
}

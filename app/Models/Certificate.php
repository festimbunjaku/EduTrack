<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id',
        'user_id',
        'template_id',
        'certificate_number',
        'achievement',
        'issued_at',
        'completion_date',
        'issuer_id',
        'description',
        'pdf_path',
        'signature',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issued_at' => 'datetime',
        'completion_date' => 'date',
    ];

    /**
     * Get the course associated with the certificate.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the user associated with the certificate.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the template associated with the certificate.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class);
    }

    /**
     * Get the issuer (teacher) who issued this certificate.
     */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuer_id');
    }
}

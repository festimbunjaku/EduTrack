<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * The certificate service instance.
     */
    protected $certificateService;

    /**
     * Create a new controller instance.
     *
     * @param CertificateService $certificateService
     * @return void
     */
    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Display a listing of certificates for a course.
     */
    public function index(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to manage certificates for this course.');
        }

        $certificates = Certificate::where('course_id', $course->id)
            ->with('user')
            ->orderBy('issued_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Certificates/Index', [
            'course' => $course,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Display all certificates issued by this teacher across all their courses
     */
    public function teacherCertificates()
    {
        $teacherId = Auth::id();
        
        // Get courses taught by the teacher
        $courses = Course::where('teacher_id', $teacherId)->get();
        
        $certificates = Certificate::whereHas('course', function ($query) use ($teacherId) {
            $query->where('teacher_id', $teacherId);
        })->with(['course', 'user'])->orderBy('issued_at', 'desc')->get();

        return Inertia::render('Teacher/Certificates/AllCertificates', [
            'courses' => $courses,
            'certificates' => $certificates,
            'courseCount' => $courses->count(),
            'certificateCount' => $certificates->count(),
            'studentCount' => $certificates->pluck('user_id')->unique()->count()
        ]);
    }

    /**
     * Show form to issue a new certificate.
     */
    public function create(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to issue certificates for this course.');
        }

        // Get enrolled students who have completed the course
        $enrolledStudents = Enrollment::where('course_id', $course->id)
            ->where('status', 'approved')
            ->with('user')
            ->get()
            ->pluck('user')
            ->filter(function ($user) {
                return $user->hasRole('student');
            });

        // Get students who already have certificates for this course
        $certificateUserIds = Certificate::where('course_id', $course->id)
            ->pluck('user_id')
            ->toArray();

        // Filter out students who already have certificates
        $eligibleStudents = $enrolledStudents->filter(function ($student) use ($certificateUserIds) {
            return !in_array($student->id, $certificateUserIds);
        });

        return Inertia::render('Teacher/Certificates/Create', [
            'course' => $course,
            'students' => $eligibleStudents,
        ]);
    }

    /**
     * Store a newly created certificate.
     */
    public function store(Request $request, Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to issue certificates for this course.');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'completion_date' => 'required|date',
            'achievement' => 'required|string|max:255',
        ]);

        // Check if the user already has a certificate for this course
        $existingCertificate = Certificate::where('course_id', $course->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingCertificate) {
            return redirect()->back()->with('error', 'This student already has a certificate for this course.');
        }

        // Check if the user is enrolled in this course
        $enrollment = Enrollment::where('course_id', $course->id)
            ->where('user_id', $request->user_id)
            ->where('status', 'approved')
            ->first();

        if (!$enrollment) {
            return redirect()->back()->with('error', 'This student is not enrolled in this course.');
        }

        // Get the default certificate template
        $defaultTemplate = \App\Models\CertificateTemplate::where('is_active', true)->first();
        
        if (!$defaultTemplate) {
            // Create a default template if none exists
            $defaultTemplate = \App\Models\CertificateTemplate::create([
                'name' => 'Default Certificate Template',
                'description' => 'The default certificate template used for all certificates',
                'html_template' => view('templates.default_certificate')->render(),
                'css_styles' => '',
                'is_active' => true,
            ]);
        }

        // Create the certificate
        $certificate = new Certificate();
        $certificate->course_id = $course->id;
        $certificate->user_id = $request->user_id;
        $certificate->template_id = $defaultTemplate->id;
        $certificate->certificate_number = $this->generateCertificateNumber();
        $certificate->achievement = $request->achievement;
        $certificate->issued_at = now();
        $certificate->completion_date = $request->completion_date;
        $certificate->issuer_id = Auth::id();
        $certificate->save();
        
        // Generate the certificate PDF
        $pdfPath = $this->certificateService->generatePDF($certificate);
        
        // Update the certificate with the PDF path
        $certificate->pdf_path = $pdfPath;
        $certificate->save();

        return redirect()->route('teacher.courses.certificates.index', $course->id)
            ->with('success', 'Certificate issued successfully.');
    }

    /**
     * Display the specified certificate.
     */
    public function show(Request $request, Course $course = null, Certificate $certificate = null)
    {
        // If certificate is directly accessed via the standalone route
        if (!$course && $certificate) {
            $certificate = $certificate ?? request()->route('certificate');
            $course = $certificate->course;
        } else if ($course && !$certificate) {
            // If certificate is accessed via the nested route
            $certificate = request()->route('certificate');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to view certificates for this course.');
        }

        // Ensure the certificate belongs to the specified course
        if ($certificate->course_id !== $course->id) {
            abort(404, 'Certificate not found for this course.');
        }

        $certificate->load(['user', 'course', 'issuer']);

        return Inertia::render('Teacher/Certificates/Show', [
            'course' => $course,
            'certificate' => $certificate,
        ]);
    }

    /**
     * Remove the specified certificate.
     */
    public function destroy(Request $request, Course $course = null, Certificate $certificate = null)
    {
        // If certificate is directly accessed via the standalone route
        if (!$course && $certificate) {
            $certificate = $certificate ?? request()->route('certificate');
            $course = $certificate->course;
        } else if ($course && !$certificate) {
            // If certificate is accessed via the nested route
            $certificate = request()->route('certificate');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to revoke certificates for this course.');
        }

        // Ensure the certificate belongs to the specified course
        if ($certificate->course_id !== $course->id) {
            abort(404, 'Certificate not found for this course.');
        }

        $certificate->delete();

        if ($request->route('course')) {
            return redirect()->route('teacher.courses.certificates.index', $course->id)
                ->with('success', 'Certificate revoked successfully.');
        } else {
            return redirect()->route('teacher.certificates.index')
                ->with('success', 'Certificate revoked successfully.');
        }
    }

    /**
     * Generate a unique certificate number.
     */
    private function generateCertificateNumber()
    {
        $prefix = 'CERT-';
        $unique = false;
        $certificateNumber = '';

        while (!$unique) {
            $certificateNumber = $prefix . strtoupper(Str::random(8));
            $existing = Certificate::where('certificate_number', $certificateNumber)->first();
            if (!$existing) {
                $unique = true;
            }
        }

        return $certificateNumber;
    }
}

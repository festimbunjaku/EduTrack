<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateController extends Controller
{
    /**
     * Display a listing of certificates for a specific course.
     */
    public function index(Course $course)
    {
        $course->load(['certificates.user']);
        
        return Inertia::render('Admin/Courses/Certificates/Index', [
            'course' => $course,
            'certificates' => $course->certificates,
        ]);
    }

    /**
     * Show the form for creating a new certificate.
     */
    public function create(Course $course)
    {
        // Get students who successfully completed the course
        $eligibleStudents = $course->getEligibleStudentsForCertificate();
        
        return Inertia::render('Admin/Courses/Certificates/Create', [
            'course' => $course,
            'eligibleStudents' => $eligibleStudents,
        ]);
    }

    /**
     * Store a newly created certificate in storage.
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'signature' => 'nullable|image|max:2048',
        ]);
        
        // Check if the certificate already exists
        $existingCertificate = Certificate::where('course_id', $course->id)
            ->where('user_id', $validated['user_id'])
            ->first();
            
        if ($existingCertificate) {
            return redirect()->back()->with('error', 'Certificate for this student already exists.');
        }
        
        // Generate a unique certificate number
        $certificateNumber = 'CERT-' . strtoupper(Str::random(8));
        
        $certificate = new Certificate([
            'course_id' => $course->id,
            'user_id' => $validated['user_id'],
            'certificate_number' => $certificateNumber,
            'issued_at' => now(),
        ]);
        
        // Handle signature upload if present
        if ($request->hasFile('signature')) {
            $file = $request->file('signature');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'certificate_signatures',
                $fileName,
                'public'
            );
            
            $certificate->signature = $path;
        }
        
        $certificate->save();
        
        // Generate PDF certificate
        $pdfPath = $this->generateCertificatePDF($certificate);
        $certificate->pdf_path = $pdfPath;
        $certificate->save();
        
        return redirect()->route('admin.courses.certificates.show', [
            'course' => $course->id,
            'certificate' => $certificate->id,
        ])->with('success', 'Certificate created successfully.');
    }

    /**
     * Display the specified certificate.
     */
    public function show(Course $course, Certificate $certificate)
    {
        $certificate->load(['user', 'course']);
        
        return Inertia::render('Admin/Courses/Certificates/Show', [
            'course' => $course,
            'certificate' => $certificate,
        ]);
    }

    /**
     * Generate and download a PDF certificate.
     */
    public function download(Course $course, Certificate $certificate)
    {
        // Check if the PDF already exists
        if ($certificate->pdf_path && Storage::disk('public')->exists($certificate->pdf_path)) {
            return response()->download(
                storage_path('app/public/' . $certificate->pdf_path),
                "certificate_{$certificate->certificate_number}.pdf"
            );
        }
        
        // Generate the PDF if it doesn't exist
        $pdfPath = $this->generateCertificatePDF($certificate);
        
        // Update the certificate with the PDF path
        $certificate->pdf_path = $pdfPath;
        $certificate->save();
        
        return response()->download(
            storage_path('app/public/' . $pdfPath),
            "certificate_{$certificate->certificate_number}.pdf"
        );
    }
    
    /**
     * Generate a PDF certificate.
     */
    public function generateCertificatePDF(Certificate $certificate)
    {
        // Load dependencies
        $certificate->load(['user', 'course']);
        
        // Create a directory for certificates if it doesn't exist
        if (!Storage::disk('public')->exists('certificates')) {
            Storage::disk('public')->makeDirectory('certificates');
        }
        
        // Define the PDF path
        $pdfPath = "certificates/{$certificate->certificate_number}.pdf";
        
        // Generate PDF using Laravel-DomPDF
        $pdf = Pdf::loadView('pdfs.certificate', [
            'certificate' => $certificate,
            'course' => $certificate->course,
            'user' => $certificate->user,
            'issueDate' => $certificate->issued_at->format('F d, Y'),
        ]);
        
        // Set PDF options
        $pdf->setPaper('a4', 'landscape');
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);
        
        // Save the PDF file
        Storage::disk('public')->put($pdfPath, $pdf->output());
        
        return $pdfPath;
    }

    /**
     * Remove the specified certificate from storage.
     */
    public function destroy(Course $course, Certificate $certificate)
    {
        // Delete PDF if it exists
        if ($certificate->pdf_path) {
            Storage::disk('public')->delete($certificate->pdf_path);
        }
        
        // Delete signature if it exists
        if ($certificate->signature) {
            Storage::disk('public')->delete($certificate->signature);
        }
        
        // Delete the certificate
        $certificate->delete();
        
        return redirect()->route('admin.courses.certificates.index', $course)
                         ->with('success', 'Certificate deleted successfully.');
    }
}

<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    /**
     * Display a listing of the student's certificates.
     */
    public function index()
    {
        $certificates = Certificate::with(['course'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Student/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }

    /**
     * Display the specified certificate.
     */
    public function show(Certificate $certificate)
    {
        // Check if the certificate belongs to the authenticated user
        if ($certificate->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $certificate->load(['course']);
        
        return Inertia::render('Student/Certificates/Show', [
            'certificate' => $certificate,
        ]);
    }

    /**
     * Download the certificate.
     */
    public function download(Certificate $certificate)
    {
        // Check if the certificate belongs to the authenticated user
        if ($certificate->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // If certificate has a signature but no PDF, redirect to show
        if (!$certificate->pdf_path && $certificate->signature) {
            return redirect()->route('student.certificates.show', $certificate);
        }

        // If there's no PDF yet, redirect back with an error
        if (!$certificate->pdf_path) {
            return redirect()->back()->with('error', 'Certificate is not available for download yet.');
        }
        
        // Check if the file exists in the storage
        if (!Storage::disk('public')->exists($certificate->pdf_path)) {
            // Request PDF generation from admin controller
            $adminController = new \App\Http\Controllers\Admin\CertificateController();
            $certificate->load('course');
            $pdfPath = $adminController->generateCertificatePDF($certificate);
            $certificate->pdf_path = $pdfPath;
            $certificate->save();
        }

        // Return the file download response
        return response()->download(
            storage_path('app/public/' . $certificate->pdf_path),
            "certificate_{$certificate->certificate_number}.pdf"
        );
    }
}

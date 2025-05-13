<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\MimeTypes;
use App\Models\Certificate;
use App\Http\Controllers\Admin\CertificateController as AdminCertificateController;

class FileController extends Controller
{
    /**
     * Serve a file from storage
     */
    public function serveFile($path)
    {
        $fullPath = 'courses/' . $path;
        
        // Check if file exists
        if (!Storage::disk('public')->exists($fullPath)) {
            // If not found in courses, try without the prefix
            if (!Storage::disk('public')->exists($path)) {
                abort(404, 'File not found.');
            }
            
            // Use path without prefix
            $fullPath = $path;
        }
        
        // Get the file from storage
        $file = Storage::disk('public')->path($fullPath);
        
        // Get mime type based on file extension
        $mimeTypes = new MimeTypes();
        $mimeType = $mimeTypes->guessMimeType($file) ?: 'application/octet-stream';
        
        // Return the file with appropriate headers - use download instead of file for forced download
        return response()->download($file, basename($file), [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'attachment; filename="' . basename($file) . '"',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
    
    /**
     * Serve a course material file
     */
    public function serveCourseMaterial($courseId, $fileName)
    {
        $path = "course_materials/{$courseId}/{$fileName}";
        
        // Check if file exists
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found.');
        }
        
        // Get the file from storage
        $file = Storage::disk('public')->path($path);
        
        // Get mime type based on file extension
        $mimeTypes = new MimeTypes();
        $mimeType = $mimeTypes->guessMimeType($file) ?: 'application/octet-stream';
        
        // Return the file with appropriate headers - use download instead of file for forced download
        return response()->download($file, $fileName, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
    
    /**
     * Serve a certificate file
     */
    public function serveCertificate($fileName)
    {
        $path = "certificates/{$fileName}";
        
        // Check if file exists
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'Certificate file not found.');
        }
        
        // Get the file from storage
        $file = Storage::disk('public')->path($path);
        
        // For PDFs, always use the PDF mime type
        if (pathinfo($file, PATHINFO_EXTENSION) === 'pdf') {
            $mimeType = 'application/pdf';
        } else {
            // For other files, determine mime type
            $mimeTypes = new MimeTypes();
            $mimeType = $mimeTypes->guessMimeType($file) ?: 'application/octet-stream';
        }
        
        // Return the file with appropriate headers - use download instead of file
        return response()->download($file, $fileName, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'attachment; filename="' . basename($file) . '"',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Handle direct certificate download by ID
     */
    public function downloadCertificateById($certificateId)
    {
        // Find the certificate
        $certificate = Certificate::findOrFail($certificateId);
        
        // Ensure user is authorized to download (either admin, certificate owner, or teacher of the course)
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Authentication required.');
        }
        
        if (!$user->hasRole('admin') && 
            $certificate->user_id !== $user->id && 
            ($certificate->course && $certificate->course->teacher_id !== $user->id)) {
            abort(403, 'You are not authorized to download this certificate.');
        }
        
        // Check if the certificate has a PDF
        if (!$certificate->pdf_path || !Storage::disk('public')->exists($certificate->pdf_path)) {
            // Generate the PDF
            $adminController = new AdminCertificateController();
            $certificate->load('course', 'user');
            $pdfPath = $adminController->generateCertificatePDF($certificate);
            
            // Update the certificate with the PDF path
            $certificate->pdf_path = $pdfPath;
            $certificate->save();
        }
        
        // Get the file path
        $filePath = Storage::disk('public')->path($certificate->pdf_path);
        
        // Ensure the file exists
        if (!file_exists($filePath)) {
            abort(404, 'Certificate file could not be found or generated.');
        }
        
        // Return the file for download
        return response()->download(
            $filePath,
            "certificate_{$certificate->certificate_number}.pdf",
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment'
            ]
        );
    }
}

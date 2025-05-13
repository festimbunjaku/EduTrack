<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;

class CertificateService
{
    /**
     * Render a certificate by replacing placeholders in the template
     *
     * @param Certificate $certificate The certificate to render
     * @return string The HTML content of the certificate
     */
    public function renderCertificate(Certificate $certificate): string
    {
        // Load the certificate with its relationships
        $certificate->load(['user', 'course', 'template', 'issuer']);
        
        // Get the template HTML
        $template = $certificate->template;
        $html = $template->html_template;
        
        // Get the replacement values
        $replacements = [
            '{{student_name}}' => $certificate->user->name,
            '{{course_title}}' => $certificate->course->title,
            '{{achievement}}' => $certificate->achievement,
            '{{completion_date}}' => $certificate->completion_date->format('F d, Y'),
            '{{certificate_number}}' => $certificate->certificate_number,
            '{{issuer_name}}' => $certificate->issuer->name,
            '{{signature_image}}' => '/path/to/signature.png', // You'd need to implement this properly
        ];
        
        // Replace placeholders
        foreach ($replacements as $placeholder => $value) {
            $html = str_replace($placeholder, $value, $html);
        }
        
        return $html;
    }
    
    /**
     * Generate a PDF of the certificate
     *
     * @param Certificate $certificate The certificate to generate as PDF
     * @return string The path to the saved PDF file
     */
    public function generatePDF(Certificate $certificate): string
    {
        // Implement PDF generation (you can use a library like DomPDF, MPDF, or Snappy PDF)
        // For now, let's just save the HTML
        $html = $this->renderCertificate($certificate);
        
        $directory = 'certificates';
        $filename = $certificate->certificate_number . '.html';
        
        // Make sure the directory exists
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }
        
        // Save the file
        $path = $directory . '/' . $filename;
        Storage::disk('public')->put($path, $html);
        
        return $path;
    }
} 
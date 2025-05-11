<?php

namespace App\Console\Commands;

use App\Http\Controllers\Admin\CertificateController;
use App\Models\Certificate;
use Illuminate\Console\Command;

class RegenerateCertificates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:regenerate {--id= : Regenerate specific certificate by ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate all PDF certificates or a specific one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $certificateId = $this->option('id');
        
        if ($certificateId) {
            // Regenerate a specific certificate
            $certificate = Certificate::find($certificateId);
            
            if (!$certificate) {
                $this->error("Certificate with ID {$certificateId} not found.");
                return 1;
            }
            
            $this->regenerateCertificate($certificate);
            $this->info("Certificate {$certificate->certificate_number} has been regenerated.");
            return 0;
        }
        
        // Regenerate all certificates
        $certificates = Certificate::all();
        $total = $certificates->count();
        
        if ($total === 0) {
            $this->info('No certificates found to regenerate.');
            return 0;
        }
        
        $bar = $this->output->createProgressBar($total);
        $bar->start();
        
        $success = 0;
        $failed = 0;
        
        foreach ($certificates as $certificate) {
            try {
                $this->regenerateCertificate($certificate);
                $success++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Failed to regenerate certificate {$certificate->certificate_number}: {$e->getMessage()}");
                $failed++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Certificate regeneration completed: {$success} successful, {$failed} failed.");
        
        return 0;
    }
    
    /**
     * Regenerate a single certificate.
     */
    private function regenerateCertificate(Certificate $certificate)
    {
        $certificateController = new CertificateController();
        $certificate->load(['course', 'user']);
        
        $pdfPath = $certificateController->generateCertificatePDF($certificate);
        $certificate->pdf_path = $pdfPath;
        $certificate->save();
        
        return $pdfPath;
    }
} 
<?php

namespace App\Console\Commands;

use App\Models\CertificateTemplate;
use Illuminate\Console\Command;

class EnsureDefaultCertificateTemplate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:ensure-default-template';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensures that a default certificate template exists in the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for default certificate template...');

        $defaultTemplate = CertificateTemplate::where('is_active', true)->first();
        
        if (!$defaultTemplate) {
            $this->info('No default template found. Creating one...');
            
            CertificateTemplate::create([
                'name' => 'Default Certificate Template',
                'description' => 'The default certificate template used for all certificates',
                'html_template' => view('templates.default_certificate')->render(),
                'css_styles' => '',
                'is_active' => true,
            ]);
            
            $this->info('Default certificate template created successfully!');
        } else {
            $this->info('Default certificate template already exists.');
        }
        
        return Command::SUCCESS;
    }
}

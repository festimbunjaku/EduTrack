<?php

namespace App\Providers;

use App\Models\CertificateTemplate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\App;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure a default certificate template exists in production
        if (App::environment('production')) {
            $this->ensureDefaultCertificateTemplate();
        }
    }

    /**
     * Ensure a default certificate template exists
     */
    private function ensureDefaultCertificateTemplate(): void
    {
        if (CertificateTemplate::count() === 0) {
            CertificateTemplate::create([
                'name' => 'Default Certificate Template',
                'description' => 'The default certificate template used for all certificates',
                'html_template' => view('templates.default_certificate')->render(),
                'css_styles' => '',
                'is_active' => true,
            ]);
        }
    }
}

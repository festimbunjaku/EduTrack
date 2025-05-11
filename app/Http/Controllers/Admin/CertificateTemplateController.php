<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateTemplateController extends Controller
{
    /**
     * Display a listing of the certificate templates.
     */
    public function index()
    {
        $templates = CertificateTemplate::orderBy('name')->get();
        
        return Inertia::render('Admin/CertificateTemplates/Index', [
            'templates' => $templates
        ]);
    }

    /**
     * Show the form for creating a new certificate template.
     */
    public function create()
    {
        return Inertia::render('Admin/CertificateTemplates/Create');
    }

    /**
     * Store a newly created certificate template in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'background_image' => 'nullable|image|max:2048',
            'html_template' => 'required|string',
            'css_styles' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        // Handle background image upload if present
        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'certificate_backgrounds',
                $fileName,
                'public'
            );
            
            $validated['background_image'] = $path;
        }
        
        CertificateTemplate::create($validated);
        
        return redirect()->route('admin.certificate-templates.index')
                         ->with('success', 'Certificate template created successfully.');
    }

    /**
     * Display the specified certificate template.
     */
    public function show(CertificateTemplate $certificateTemplate)
    {
        return Inertia::render('Admin/CertificateTemplates/Show', [
            'template' => $certificateTemplate
        ]);
    }

    /**
     * Show the form for editing the specified certificate template.
     */
    public function edit(CertificateTemplate $certificateTemplate)
    {
        return Inertia::render('Admin/CertificateTemplates/Edit', [
            'template' => $certificateTemplate
        ]);
    }

    /**
     * Update the specified certificate template in storage.
     */
    public function update(Request $request, CertificateTemplate $certificateTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'background_image' => 'nullable|image|max:2048',
            'html_template' => 'required|string',
            'css_styles' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        // Handle background image upload if present
        if ($request->hasFile('background_image')) {
            // Delete old image if it exists
            if ($certificateTemplate->background_image) {
                Storage::disk('public')->delete($certificateTemplate->background_image);
            }
            
            $file = $request->file('background_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'certificate_backgrounds',
                $fileName,
                'public'
            );
            
            $validated['background_image'] = $path;
        }
        
        $certificateTemplate->update($validated);
        
        return redirect()->route('admin.certificate-templates.index')
                         ->with('success', 'Certificate template updated successfully.');
    }

    /**
     * Remove the specified certificate template from storage.
     */
    public function destroy(CertificateTemplate $certificateTemplate)
    {
        // Check if template is being used by any certificates
        if ($certificateTemplate->certificates()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete template because it is being used by certificates.');
        }
        
        // Delete background image if it exists
        if ($certificateTemplate->background_image) {
            Storage::disk('public')->delete($certificateTemplate->background_image);
        }
        
        $certificateTemplate->delete();
        
        return redirect()->route('admin.certificate-templates.index')
                         ->with('success', 'Certificate template deleted successfully.');
    }
} 
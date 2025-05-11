<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class FileAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only process if this is a request to the storage path
        if (!str_starts_with($request->path(), 'storage/')) {
            return $next($request);
        }

        // Get the relative path within storage
        $path = str_replace('storage/', '', $request->path());
        
        // Check if the file exists
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found.');
        }
        
        // For security, you might want to check if the user has permission to access this file
        // For example, if the file is a certificate, check if it belongs to the user
        
        // Serve the file directly
        return response()->file(storage_path('app/public/' . $path));
    }
}

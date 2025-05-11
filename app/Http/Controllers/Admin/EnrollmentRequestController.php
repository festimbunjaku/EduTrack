<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnrollmentRequestController extends Controller
{
    /**
     * Display a listing of pending enrollment requests.
     */
    public function index(Request $request)
    {
        $query = EnrollmentRequest::query()
            ->with(['user', 'course.teacher'])
            ->where('status', 'pending');

        // Apply filters
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $requests = $query->latest()->get();

        return Inertia::render('Admin/EnrollmentRequests/Index', [
            'requests' => $requests,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Display enrollment request history.
     */
    public function history(Request $request)
    {
        $query = EnrollmentRequest::query()
            ->with(['user', 'course.teacher', 'processor'])
            ->where('status', '!=', 'pending');

        // Apply filters
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->get();

        return Inertia::render('Admin/EnrollmentRequests/History', [
            'requests' => $requests,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
            'statuses' => [
                'approved' => 'Approved',
                'denied' => 'Denied',
            ],
        ]);
    }

    /**
     * Approve an enrollment request.
     */
    public function approve(EnrollmentRequest $request)
    {
        // Check if already processed
        if ($request->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $request->user_id,
            'course_id' => $request->course_id,
            'status' => 'approved',
        ]);

        // Update request status
        $request->update([
            'status' => 'approved',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Enrollment request approved successfully.');
    }

    /**
     * Deny an enrollment request.
     */
    public function deny(EnrollmentRequest $request)
    {
        // Check if already processed
        if ($request->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        // Update request status
        $request->update([
            'status' => 'denied',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Enrollment request denied successfully.');
    }
}

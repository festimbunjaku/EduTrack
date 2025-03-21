<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CourseMaterialController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\CertificateController as StudentCertificateController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\HomeworkController as StudentHomeworkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');
        
        // User management routes
        Route::get('users', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('users/search', [UserController::class, 'search'])->name('admin.users.search');
        Route::get('users/create', [UserController::class, 'create'])->name('admin.users.create');
        Route::post('users', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('admin.users.show');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        
        // Course management routes
        Route::resource('courses', CourseController::class, ['as' => 'admin']);
        
        // Course materials routes
        Route::get('courses/{course}/materials', [CourseMaterialController::class, 'index'])->name('admin.courses.materials.index');
        Route::get('courses/{course}/materials/create', [CourseMaterialController::class, 'create'])->name('admin.courses.materials.create');
        Route::post('courses/{course}/materials', [CourseMaterialController::class, 'store'])->name('admin.courses.materials.store');
        Route::get('courses/{course}/materials/{material}', [CourseMaterialController::class, 'show'])->name('admin.courses.materials.show');
        Route::get('courses/{course}/materials/{material}/edit', [CourseMaterialController::class, 'edit'])->name('admin.courses.materials.edit');
        Route::put('courses/{course}/materials/{material}', [CourseMaterialController::class, 'update'])->name('admin.courses.materials.update');
        Route::delete('courses/{course}/materials/{material}', [CourseMaterialController::class, 'destroy'])->name('admin.courses.materials.destroy');
        Route::get('courses/{course}/materials/{material}/download', [CourseMaterialController::class, 'download'])->name('admin.courses.materials.download');
        
        // Homework management routes
        Route::get('courses/{course}/homework', [HomeworkController::class, 'index'])->name('admin.courses.homework.index');
        Route::get('courses/{course}/homework/create', [HomeworkController::class, 'create'])->name('admin.courses.homework.create');
        Route::post('courses/{course}/homework', [HomeworkController::class, 'store'])->name('admin.courses.homework.store');
        Route::get('courses/{course}/homework/{homework}', [HomeworkController::class, 'show'])->name('admin.courses.homework.show');
        Route::get('courses/{course}/homework/{homework}/edit', [HomeworkController::class, 'edit'])->name('admin.courses.homework.edit');
        Route::put('courses/{course}/homework/{homework}', [HomeworkController::class, 'update'])->name('admin.courses.homework.update');
        Route::delete('courses/{course}/homework/{homework}', [HomeworkController::class, 'destroy'])->name('admin.courses.homework.destroy');
        Route::get('courses/{course}/homework/{homework}/download', [HomeworkController::class, 'downloadAttachment'])->name('admin.courses.homework.download');
        Route::post('courses/{course}/homework/{homework}/submissions/{submission}/review', [HomeworkController::class, 'reviewSubmission'])->name('admin.courses.homework.submissions.review');
        
        // Certificate management routes
        Route::get('courses/{course}/certificates', [CertificateController::class, 'index'])->name('admin.courses.certificates.index');
        Route::get('courses/{course}/certificates/create', [CertificateController::class, 'create'])->name('admin.courses.certificates.create');
        Route::post('courses/{course}/certificates', [CertificateController::class, 'store'])->name('admin.courses.certificates.store');
        Route::get('courses/{course}/certificates/{certificate}', [CertificateController::class, 'show'])->name('admin.courses.certificates.show');
        Route::get('courses/{course}/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('admin.courses.certificates.download');
        Route::delete('courses/{course}/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('admin.courses.certificates.destroy');
        
        // Enrollment management routes
        Route::get('enrollments', [EnrollmentController::class, 'index'])->name('admin.enrollments.index');
        Route::get('enrollments/history', [EnrollmentController::class, 'history'])->name('admin.enrollments.history');
        Route::get('enrollments/{enrollment}', [EnrollmentController::class, 'show'])->name('admin.enrollments.show');
        Route::post('enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve'])->name('admin.enrollments.approve');
        Route::post('enrollments/{enrollment}/deny', [EnrollmentController::class, 'deny'])->name('admin.enrollments.deny');
        Route::post('enrollments/{enrollment}/waitlist', [EnrollmentController::class, 'updateWaitlist'])->name('admin.enrollments.updateWaitlist');
    });

    // Teacher routes
    Route::middleware(['role:teacher'])->prefix('teacher')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('Teacher/Dashboard');
        })->name('teacher.dashboard');
    });

    // Student routes
    Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Student/Dashboard');
        })->name('student.dashboard');
        
        // Student certificates
        Route::get('/certificates', [StudentCertificateController::class, 'index'])->name('student.certificates.index');
        Route::get('/certificates/{certificate}', [StudentCertificateController::class, 'show'])->name('student.certificates.show');
        Route::get('/certificates/{certificate}/download', [StudentCertificateController::class, 'download'])->name('student.certificates.download');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

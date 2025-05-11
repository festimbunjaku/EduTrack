<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CourseMaterialController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Student\CertificateController as StudentCertificateController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\HomeworkController as StudentHomeworkController;
use App\Http\Controllers\Teacher\CourseController as TeacherCourseController;
use App\Http\Controllers\Teacher\HomeworkController as TeacherHomeworkController;
use App\Http\Controllers\Teacher\MaterialController as MaterialController;
use App\Http\Controllers\Teacher\CertificateController as TeacherCertificateController;
use App\Http\Controllers\Student\MaterialController as StudentMaterialController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\Student\CourseDiscoveryController as StudentCourseDiscoveryController;
use App\Http\Controllers\Admin\EnrollmentRequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Todo routes
    Route::resource('todos', TodoController::class);
    Route::post('todos/{todo}/toggle', [TodoController::class, 'toggle'])->name('todos.toggle');

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware(['role:admin'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
        Route::resource('users', UserController::class);
        
        // User management routes
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users/search', [UserController::class, 'search'])->name('users.search');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        
        // Course management routes
        Route::resource('courses', CourseController::class);
        
        // Course materials routes
        Route::get('courses/{course}/materials', [CourseMaterialController::class, 'index'])->name('courses.materials.index');
        Route::get('courses/{course}/materials/create', [CourseMaterialController::class, 'create'])->name('courses.materials.create');
        Route::post('courses/{course}/materials', [CourseMaterialController::class, 'store'])->name('courses.materials.store');
        Route::get('courses/{course}/materials/{material}', [CourseMaterialController::class, 'show'])->name('courses.materials.show');
        Route::get('courses/{course}/materials/{material}/edit', [CourseMaterialController::class, 'edit'])->name('courses.materials.edit');
        Route::put('courses/{course}/materials/{material}', [CourseMaterialController::class, 'update'])->name('courses.materials.update');
        Route::delete('courses/{course}/materials/{material}', [CourseMaterialController::class, 'destroy'])->name('courses.materials.destroy');
        Route::get('courses/{course}/materials/{material}/download', [CourseMaterialController::class, 'download'])->name('courses.materials.download');
        
        // Homework management routes
        Route::get('courses/{course}/homework', [HomeworkController::class, 'index'])->name('courses.homework.index');
        Route::get('courses/{course}/homework/create', [HomeworkController::class, 'create'])->name('courses.homework.create');
        Route::post('courses/{course}/homework', [HomeworkController::class, 'store'])->name('courses.homework.store');
        Route::get('courses/{course}/homework/{homework}', [HomeworkController::class, 'show'])->name('courses.homework.show');
        Route::get('courses/{course}/homework/{homework}/edit', [HomeworkController::class, 'edit'])->name('courses.homework.edit');
        Route::put('courses/{course}/homework/{homework}', [HomeworkController::class, 'update'])->name('courses.homework.update');
        Route::delete('courses/{course}/homework/{homework}', [HomeworkController::class, 'destroy'])->name('courses.homework.destroy');
        Route::get('courses/{course}/homework/{homework}/download', [HomeworkController::class, 'downloadAttachment'])->name('courses.homework.download');
        Route::post('courses/{course}/homework/{homework}/submissions/{submission}/review', [HomeworkController::class, 'reviewSubmission'])->name('courses.homework.submissions.review');
        
        // Certificate management routes
        Route::get('courses/{course}/certificates', [CertificateController::class, 'index'])->name('courses.certificates.index');
        Route::get('courses/{course}/certificates/create', [CertificateController::class, 'create'])->name('courses.certificates.create');
        Route::post('courses/{course}/certificates', [CertificateController::class, 'store'])->name('courses.certificates.store');
        Route::get('courses/{course}/certificates/{certificate}', [CertificateController::class, 'show'])->name('courses.certificates.show');
        Route::get('courses/{course}/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('courses.certificates.download');
        Route::delete('courses/{course}/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('courses.certificates.destroy');
        
        // Enrollment management routes
        Route::get('enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('enrollments/history', [EnrollmentController::class, 'history'])->name('enrollments.history');
        Route::get('enrollments/{enrollment}', [EnrollmentController::class, 'show'])->name('enrollments.show');
        Route::post('enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve'])->name('enrollments.approve');
        Route::post('enrollments/{enrollment}/deny', [EnrollmentController::class, 'deny'])->name('enrollments.deny');
        Route::post('enrollments/{enrollment}/waitlist', [EnrollmentController::class, 'updateWaitlist'])->name('enrollments.updateWaitlist');
        
        // Enrollment request management routes
        Route::get('enrollment-requests', [EnrollmentRequestController::class, 'index'])->name('enrollment-requests.index');
        Route::get('enrollment-requests/history', [EnrollmentRequestController::class, 'history'])->name('enrollment-requests.history');
        Route::post('enrollment-requests/{request}/approve', [EnrollmentRequestController::class, 'approve'])->name('enrollment-requests.approve');
        Route::post('enrollment-requests/{request}/deny', [EnrollmentRequestController::class, 'deny'])->name('enrollment-requests.deny');
        
        // Additional routes
        Route::get('/roles', function() { 
            return redirect()->route('admin.users.index', ['view' => 'roles']);
        })->name('roles.index');
    });

    // Teacher routes
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        // Teacher Dashboard
        Route::get('/dashboard', [DashboardController::class, 'teacherDashboard'])->name('dashboard');
        
        // Teacher Courses
        Route::resource('courses', TeacherCourseController::class);
        Route::delete('courses/{course}/unenroll/{user}', [TeacherCourseController::class, 'unenrollStudent'])->name('courses.unenroll');
        
        // Teacher Course Homework
        Route::resource('courses.homework', TeacherHomeworkController::class);
        
        // Teacher Course Materials
        Route::resource('courses.materials', MaterialController::class);
        
        // Teacher Course Certificates
        Route::resource('courses.certificates', TeacherCertificateController::class);
        
        // Teacher Students Overview
        Route::get('/students', [TeacherCourseController::class, 'allStudents'])->name('students.index');
        
        // Teacher Pending Homework Review
        Route::get('/homework/pending', [TeacherHomeworkController::class, 'pendingReviews'])->name('homework.pending');
        
        // Teacher Certificates Overview
        Route::get('/certificates', [TeacherCertificateController::class, 'index'])->name('certificates.create');
    });

    // Student routes
    Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
        // Student Dashboard
        Route::get('/dashboard', [DashboardController::class, 'studentDashboard'])->name('dashboard');
        
        // Student Courses
        Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses.index');
        Route::get('/courses/discover', [StudentCourseDiscoveryController::class, 'index'])->name('courses.discover');
        Route::get('/courses/discover/{course}', [StudentCourseDiscoveryController::class, 'show'])->name('courses.discover.show');
        Route::post('/courses/{course}/request-enrollment', [StudentCourseDiscoveryController::class, 'requestEnrollment'])->name('courses.request-enrollment');
        Route::get('/courses/{course}', [StudentCourseController::class, 'show'])->name('courses.show');
        
        // Student Homework
        Route::get('/homework', [StudentHomeworkController::class, 'index'])->name('homework.index');
        Route::get('/homework/{course}/{homework}', [StudentHomeworkController::class, 'show'])->name('homework.show');
        Route::post('/homework/{course}/{homework}/submit', [StudentHomeworkController::class, 'submit'])->name('homework.submit');
        
        // Student Materials
        Route::get('/materials', [StudentMaterialController::class, 'index'])->name('materials.index');
        Route::get('/materials/{material}', [StudentMaterialController::class, 'show'])->name('materials.show');
        Route::get('/materials/{material}/download', [StudentMaterialController::class, 'download'])->name('materials.download');
        
        // Student Certificates
        Route::get('/certificates', [StudentCertificateController::class, 'index'])->name('certificates.index');
        Route::get('/certificates/{certificate}', [StudentCertificateController::class, 'show'])->name('certificates.show');
        Route::get('/certificates/{certificate}/download', [StudentCertificateController::class, 'download'])->name('certificates.download');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

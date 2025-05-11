<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CourseMaterialController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\CertificateTemplateController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Student\CertificateController as StudentCertificateController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\HomeworkController as StudentHomeworkController;
use App\Http\Controllers\Teacher\CourseController as TeacherCourseController;
use App\Http\Controllers\Teacher\HomeworkController as TeacherHomeworkController;
use App\Http\Controllers\Teacher\MaterialController as TeacherMaterialController;
use App\Http\Controllers\Teacher\CertificateController as TeacherCertificateController;
use App\Http\Controllers\Student\MaterialController as StudentMaterialController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\Student\CourseDiscoveryController as StudentCourseDiscoveryController;
use App\Http\Controllers\Admin\EnrollmentRequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use App\Http\Controllers\FileController;

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
        
        // User management routes
        Route::resource('users', UserController::class);
        Route::post('users/search', [UserController::class, 'search'])->name('users.search');
        
        // Course management routes
        Route::resource('courses', CourseController::class);
        Route::get('courses/{course}/timetable', [CourseController::class, 'viewTimetable'])->name('courses.timetable');
        Route::post('courses/{course}/generate-timetable', [CourseController::class, 'generateTimetable'])->name('courses.generate-timetable');
        
        // Global resource management (admin-only access to everything)
        Route::prefix('all')->name('all.')->group(function() {
            // Access to all materials across all courses
            Route::get('/materials', [CourseMaterialController::class, 'allMaterials'])->name('materials.index');
            Route::get('/materials/create', [CourseMaterialController::class, 'createAny'])->name('materials.create');
            Route::post('/materials', [CourseMaterialController::class, 'storeAny'])->name('materials.store');
            Route::get('/materials/{material}', [CourseMaterialController::class, 'showAny'])->name('materials.show');
            Route::get('/materials/{material}/edit', [CourseMaterialController::class, 'editAny'])->name('materials.edit');
            Route::put('/materials/{material}', [CourseMaterialController::class, 'updateAny'])->name('materials.update');
            Route::delete('/materials/{material}', [CourseMaterialController::class, 'destroyAny'])->name('materials.destroy');
            Route::get('/materials/{material}/download', [CourseMaterialController::class, 'downloadAny'])->name('materials.download');
            
            // Access to all homework across all courses
            Route::get('/homework', [HomeworkController::class, 'allHomework'])->name('homework.index');
            Route::get('/homework/create', [HomeworkController::class, 'createAny'])->name('homework.create');
            Route::post('/homework', [HomeworkController::class, 'storeAny'])->name('homework.store');
            Route::get('/homework/{homework}', [HomeworkController::class, 'showAny'])->name('homework.show');
            Route::get('/homework/{homework}/edit', [HomeworkController::class, 'editAny'])->name('homework.edit');
            Route::put('/homework/{homework}', [HomeworkController::class, 'updateAny'])->name('homework.update');
            Route::delete('/homework/{homework}', [HomeworkController::class, 'destroyAny'])->name('homework.destroy');
            Route::get('/homework/{homework}/download', [HomeworkController::class, 'downloadAttachmentAny'])->name('homework.download');
            Route::post('/homework/{homework}/submissions/{submission}/review', [HomeworkController::class, 'reviewSubmissionAny'])->name('homework.submissions.review');
            
            // Access to all certificates across all courses
            Route::get('/certificates', [CertificateController::class, 'allCertificates'])->name('certificates.index');
            Route::get('/certificates/create', [CertificateController::class, 'createAny'])->name('certificates.create');
            Route::post('/certificates', [CertificateController::class, 'storeAny'])->name('certificates.store');
            Route::get('/certificates/{certificate}', [CertificateController::class, 'showAny'])->name('certificates.show');
            Route::delete('/certificates/{certificate}', [CertificateController::class, 'destroyAny'])->name('certificates.destroy');
            Route::get('/certificates/{certificate}/download', [CertificateController::class, 'downloadAny'])->name('certificates.download');
        });
        
        // Course-specific resource management (nested under courses)
        // Course materials routes
        Route::prefix('courses/{course}')->name('courses.')->group(function() {
            // Materials
            Route::get('/materials', [CourseMaterialController::class, 'index'])->name('materials.index');
            Route::get('/materials/create', [CourseMaterialController::class, 'create'])->name('materials.create');
            Route::post('/materials', [CourseMaterialController::class, 'store'])->name('materials.store');
            Route::get('/materials/{material}', [CourseMaterialController::class, 'show'])->name('materials.show');
            Route::get('/materials/{material}/edit', [CourseMaterialController::class, 'edit'])->name('materials.edit');
            Route::put('/materials/{material}', [CourseMaterialController::class, 'update'])->name('materials.update');
            Route::delete('/materials/{material}', [CourseMaterialController::class, 'destroy'])->name('materials.destroy');
            Route::get('/materials/{material}/download', [CourseMaterialController::class, 'download'])->name('materials.download');
            
            // Homework
            Route::get('/homework', [HomeworkController::class, 'index'])->name('homework.index');
            Route::get('/homework/create', [HomeworkController::class, 'create'])->name('homework.create');
            Route::post('/homework', [HomeworkController::class, 'store'])->name('homework.store');
            Route::get('/homework/{homework}', [HomeworkController::class, 'show'])->name('homework.show');
            Route::get('/homework/{homework}/edit', [HomeworkController::class, 'edit'])->name('homework.edit');
            Route::put('/homework/{homework}', [HomeworkController::class, 'update'])->name('homework.update');
            Route::delete('/homework/{homework}', [HomeworkController::class, 'destroy'])->name('homework.destroy');
            Route::get('/homework/{homework}/download', [HomeworkController::class, 'downloadAttachment'])->name('homework.download');
            Route::post('/homework/{homework}/submissions/{submission}/review', [HomeworkController::class, 'reviewSubmission'])->name('homework.submissions.review');
            
            // Certificates
            Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
            Route::get('/certificates/create', [CertificateController::class, 'create'])->name('certificates.create');
            Route::post('/certificates', [CertificateController::class, 'store'])->name('certificates.store');
            Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
            Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
            Route::delete('/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('certificates.destroy');
        });
        
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
        
        // Room management routes
        Route::resource('rooms', RoomController::class);
        Route::get('rooms/timetable', [RoomController::class, 'timetable'])->name('rooms.timetable');
        Route::post('rooms/check-availability', [RoomController::class, 'checkAvailability'])->name('rooms.check-availability');
        
        // Additional routes
        Route::get('/roles', function() { 
            return redirect()->route('admin.users.index', ['view' => 'roles']);
        })->name('roles.index');
    });

    // Teacher routes
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        // Teacher Dashboard
        Route::get('/dashboard', [DashboardController::class, 'teacherDashboard'])->name('dashboard');
        
        // Teacher Courses - only show/access courses they teach
        Route::resource('courses', TeacherCourseController::class)->only(['index', 'show']);
        Route::get('courses/{course}/edit', [TeacherCourseController::class, 'edit'])->name('courses.edit');
        Route::put('courses/{course}', [TeacherCourseController::class, 'update'])->name('courses.update');
        Route::delete('courses/{course}', [TeacherCourseController::class, 'destroy'])->name('courses.destroy');
        Route::delete('courses/{course}/unenroll/{enrollment}', [TeacherCourseController::class, 'unenrollStudent'])->name('courses.unenroll');
        
        // Aggregated teacher content views (scoped to their courses only)
        Route::get('/materials', [TeacherMaterialController::class, 'teacherMaterials'])->name('materials.index');
        Route::get('/homework', [TeacherHomeworkController::class, 'teacherHomework'])->name('homework.index');
        Route::get('/certificates', [TeacherCertificateController::class, 'teacherCertificates'])->name('certificates.index');
        Route::get('/homework/pending', [TeacherHomeworkController::class, 'pendingReviews'])->name('homework.pending');
        
        // Teacher Students Overview - only for students in their courses
        Route::get('/students', [TeacherCourseController::class, 'allStudents'])->name('students.index');
        
        // Course-specific teacher routes
        Route::prefix('courses/{course}')->name('courses.')->group(function() {
            // Teacher Course Homework - only for courses they teach
            Route::get('/homework', [TeacherHomeworkController::class, 'index'])->name('homework.index');
            Route::get('/homework/create', [TeacherHomeworkController::class, 'create'])->name('homework.create');
            Route::post('/homework', [TeacherHomeworkController::class, 'store'])->name('homework.store');
            Route::get('/homework/{homework}', [TeacherHomeworkController::class, 'show'])->name('homework.show');
            Route::get('/homework/{homework}/edit', [TeacherHomeworkController::class, 'edit'])->name('homework.edit');
            Route::put('/homework/{homework}', [TeacherHomeworkController::class, 'update'])->name('homework.update');
            Route::delete('/homework/{homework}', [TeacherHomeworkController::class, 'destroy'])->name('homework.destroy');
            Route::post('/homework/{homework}/submissions/{submission}/review', [TeacherHomeworkController::class, 'reviewSubmission'])->name('homework.submissions.review');
            
            // Teacher Course Materials - only for courses they teach
            Route::get('/materials', [TeacherMaterialController::class, 'index'])->name('materials.index');
            Route::get('/materials/create', [TeacherMaterialController::class, 'create'])->name('materials.create');
            Route::post('/materials', [TeacherMaterialController::class, 'store'])->name('materials.store');
            Route::get('/materials/{material}', [TeacherMaterialController::class, 'show'])->name('materials.show');
            Route::get('/materials/{material}/edit', [TeacherMaterialController::class, 'edit'])->name('materials.edit');
            Route::put('/materials/{material}', [TeacherMaterialController::class, 'update'])->name('materials.update');
            Route::delete('/materials/{material}', [TeacherMaterialController::class, 'destroy'])->name('materials.destroy');
            
            // Teacher Course Certificates - only for courses they teach
            Route::get('/certificates', [TeacherCertificateController::class, 'index'])->name('certificates.index');
            Route::get('/certificates/create', [TeacherCertificateController::class, 'create'])->name('certificates.create');
            Route::post('/certificates', [TeacherCertificateController::class, 'store'])->name('certificates.store');
            Route::get('/certificates/{certificate}', [TeacherCertificateController::class, 'show'])->name('certificates.show');
            Route::delete('/certificates/{certificate}', [TeacherCertificateController::class, 'destroy'])->name('certificates.destroy');
        });
    });

    // Student routes - keep focus on deadlines for homework
    Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
        // Student Dashboard
        Route::get('/dashboard', [DashboardController::class, 'studentDashboard'])->name('dashboard');
        
        // Student Courses
        Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses.index');
        Route::get('/courses/discover', [StudentCourseDiscoveryController::class, 'index'])->name('courses.discover');
        Route::get('/courses/discover/{course}', [StudentCourseDiscoveryController::class, 'show'])->name('courses.discover.show');
        Route::post('/courses/{course}/request-enrollment', [StudentCourseDiscoveryController::class, 'requestEnrollment'])->name('courses.request-enrollment');
        Route::get('/courses/{course}', [StudentCourseController::class, 'show'])->name('courses.show');
        
        // Student learning resources
        Route::prefix('courses/{course}')->name('courses.')->group(function() {
            // Student Homework - with deadline enforcement for specific course
            Route::get('/homework', [StudentHomeworkController::class, 'courseHomework'])->name('homework.index');
            Route::get('/homework/{homework}', [StudentHomeworkController::class, 'showHomework'])->name('homework.show');
            Route::post('/homework/{homework}/submit', [StudentHomeworkController::class, 'submitHomework'])->name('homework.submit');
            
            // Student Materials for specific course
            Route::get('/materials', [StudentMaterialController::class, 'courseMaterials'])->name('materials.index');
            Route::get('/materials/{material}', [StudentMaterialController::class, 'showMaterial'])->name('materials.show');
            Route::get('/materials/{material}/download', [StudentMaterialController::class, 'downloadMaterial'])->name('materials.download');
            
            // Student Certificates for specific course
            Route::get('/certificates', [StudentCertificateController::class, 'courseCertificates'])->name('certificates.index');
            Route::get('/certificates/{certificate}', [StudentCertificateController::class, 'showCertificate'])->name('certificates.show');
            Route::get('/certificates/{certificate}/download', [StudentCertificateController::class, 'downloadCertificate'])->name('certificates.download');
        });
        
        // Aggregated student resources (all courses)
        Route::get('/homework', [StudentHomeworkController::class, 'index'])->name('homework.index');
        Route::get('/homework/{homework}', [StudentHomeworkController::class, 'show'])->name('homework.show');
        Route::post('/homework/{homework}/submit', [StudentHomeworkController::class, 'submit'])->name('homework.submit');
        
        Route::get('/materials', [StudentMaterialController::class, 'index'])->name('materials.index');
        Route::get('/materials/{material}', [StudentMaterialController::class, 'show'])->name('materials.show');
        Route::get('/materials/{material}/download', [StudentMaterialController::class, 'download'])->name('materials.download');
        
        Route::get('/certificates', [StudentCertificateController::class, 'index'])->name('certificates.index');
        Route::get('/certificates/{certificate}', [StudentCertificateController::class, 'show'])->name('certificates.show');
        Route::get('/certificates/{certificate}/download', [StudentCertificateController::class, 'download'])->name('certificates.download');
    });

    // Direct certificate download by ID
    Route::get('/download/certificate/{certificateId}', [\App\Http\Controllers\FileController::class, 'downloadCertificateById'])->name('download.certificate');
    
    // General file serving routes
    Route::get('/storage/courses/{path}', [\App\Http\Controllers\FileController::class, 'serveFile'])->where('path', '.*');
    Route::get('/storage/course_materials/{courseId}/{fileName}', [\App\Http\Controllers\FileController::class, 'serveCourseMaterial'])->where('fileName', '.*');
    Route::get('/storage/certificates/{fileName}', [\App\Http\Controllers\FileController::class, 'serveCertificate'])->where('fileName', '.*');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

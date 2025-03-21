<?php

use App\Http\Controllers\Admin\UserController;
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
    });

    // Teacher routes
    Route::middleware(['role:teacher'])->prefix('teacher')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('Teacher/Dashboard');
        })->name('teacher.dashboard');
    });

    // Student routes
    Route::middleware(['role:student'])->prefix('student')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('Student/Dashboard');
        })->name('student.dashboard');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

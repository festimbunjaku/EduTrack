<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

test('login screen can be rendered', function () {
    $response = $this->get('/login');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('auth/login'));
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();
    
    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    
    $this->assertAuthenticated();
    $response->assertRedirect('/dashboard');
});

test('users cannot authenticate with invalid password', function () {
    $user = User::factory()->create();
    
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);
    
    $this->assertGuest();
});

test('authenticated users cannot access login page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $response = $this->get('/login');
    
    $response->assertRedirect('/dashboard');
});

test('authenticated users are redirected to role-specific dashboard', function () {
    // Create a teacher user
    $teacher = User::factory()->create();
    $teacher->assignRole('teacher');
    
    // Login
    $response = $this->post('/login', [
        'email' => $teacher->email,
        'password' => 'password',
    ]);
    
    $this->assertAuthenticated();
    $response->assertRedirect('/dashboard');
    
    // Create a student user
    $student = User::factory()->create();
    $student->assignRole('student');
    
    // Login as student
    $this->post('/logout');
    $response = $this->post('/login', [
        'email' => $student->email,
        'password' => 'password',
    ]);
    
    $this->assertAuthenticated();
    $response->assertRedirect('/dashboard');
});

test('login validation errors are displayed', function () {
    $response = $this->post('/login', [
        'email' => '',
        'password' => '',
    ]);
    
    $response->assertSessionHasErrors(['email', 'password']);
});

test('user can logout', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $this->assertAuthenticated();
    
    $response = $this->post('/logout');
    
    $this->assertGuest();
    $response->assertRedirect('/');
}); 
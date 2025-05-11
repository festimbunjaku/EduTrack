<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('auth/register'));
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    
    $this->assertAuthenticated();
    $response->assertRedirect('/dashboard');
    
    // Check if user exists in database
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
    
    // Check if user has been assigned the student role by default
    $user = User::where('email', 'test@example.com')->first();
    $this->assertTrue($user->hasRole('student'));
});

test('registration validation errors are displayed', function () {
    $response = $this->post('/register', [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
        'password_confirmation' => 'not-matching',
    ]);
    
    $response->assertSessionHasErrors(['name', 'email', 'password']);
});

test('email must be unique for registration', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);
    
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    
    $response->assertSessionHasErrors(['email']);
});

test('authenticated users cannot access registration page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $response = $this->get('/register');
    
    $response->assertRedirect('/dashboard');
});
<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles if they don't exist
        if (!Role::where('name', 'admin')->exists()) {
            Role::create(['name' => 'admin', 'guard_name' => 'web']);
        }
        if (!Role::where('name', 'teacher')->exists()) {
            Role::create(['name' => 'teacher', 'guard_name' => 'web']);
        }
        if (!Role::where('name', 'student')->exists()) {
            Role::create(['name' => 'student', 'guard_name' => 'web']);
        }
        
        // Create routes for testing
        $this->app['router']->get('/admin-only', function () {
            return 'Admin Access';
        })->middleware(['auth', 'role:admin']);
        
        $this->app['router']->get('/teacher-only', function () {
            return 'Teacher Access';
        })->middleware(['auth', 'role:teacher']);
        
        $this->app['router']->get('/student-only', function () {
            return 'Student Access';
        })->middleware(['auth', 'role:student']);
        
        $this->app['router']->get('/multiple-roles', function () {
            return 'Multiple Roles Access';
        })->middleware(['auth', 'role:admin,teacher']);
    }
    
    /** @test */
    public function guest_cannot_access_role_protected_routes()
    {
        $this->get('/admin-only')->assertRedirect('/login');
        $this->get('/teacher-only')->assertRedirect('/login');
        $this->get('/student-only')->assertRedirect('/login');
        $this->get('/multiple-roles')->assertRedirect('/login');
    }
    
    /** @test */
    public function admin_can_access_admin_routes()
    {
        /** @var User $admin */
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $this->actingAs($admin)
             ->get('/admin-only')
             ->assertStatus(200)
             ->assertSee('Admin Access');
    }
    
    /** @test */
    public function non_admin_cannot_access_admin_routes()
    {
        /** @var User $teacher */
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');
        
        /** @var User $student */
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $this->actingAs($teacher)
             ->get('/admin-only')
             ->assertStatus(403);
             
        $this->actingAs($student)
             ->get('/admin-only')
             ->assertStatus(403);
    }
    
    /** @test */
    public function teacher_can_access_teacher_routes()
    {
        /** @var User $teacher */
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');
        
        $this->actingAs($teacher)
             ->get('/teacher-only')
             ->assertStatus(200)
             ->assertSee('Teacher Access');
    }
    
    /** @test */
    public function student_can_access_student_routes()
    {
        /** @var User $student */
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $this->actingAs($student)
             ->get('/student-only')
             ->assertStatus(200)
             ->assertSee('Student Access');
    }
    
    /** @test */
    public function multiple_roles_work_correctly()
    {
        /** @var User $admin */
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        /** @var User $teacher */
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');
        
        /** @var User $student */
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $this->actingAs($admin)
             ->get('/multiple-roles')
             ->assertStatus(200)
             ->assertSee('Multiple Roles Access');
             
        $this->actingAs($teacher)
             ->get('/multiple-roles')
             ->assertStatus(200)
             ->assertSee('Multiple Roles Access');
             
        $this->actingAs($student)
             ->get('/multiple-roles')
             ->assertStatus(403);
    }
    
    /** @test */
    public function user_with_multiple_roles_can_access_all_relevant_routes()
    {
        /** @var User $superUser */
        $superUser = User::factory()->create();
        $superUser->assignRole('admin');
        $superUser->assignRole('teacher');
        $superUser->assignRole('student');
        
        $this->actingAs($superUser)
             ->get('/admin-only')
             ->assertStatus(200);
             
        $this->actingAs($superUser)
             ->get('/teacher-only')
             ->assertStatus(200);
             
        $this->actingAs($superUser)
             ->get('/student-only')
             ->assertStatus(200);
             
        $this->actingAs($superUser)
             ->get('/multiple-roles')
             ->assertStatus(200);
    }
} 
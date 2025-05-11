<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoControllerTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function guests_cannot_access_todo_routes()
    {
        $response = $this->get(route('todos.index'));
        $response->assertRedirect('/login');
        
        $response = $this->post(route('todos.store'));
        $response->assertRedirect('/login');
        
        $todo = Todo::factory()->create();
        
        $response = $this->get(route('todos.show', $todo));
        $response->assertRedirect('/login');
        
        $response = $this->put(route('todos.update', $todo));
        $response->assertRedirect('/login');
        
        $response = $this->delete(route('todos.destroy', $todo));
        $response->assertRedirect('/login');
    }
    
    /** @test */
    public function user_can_view_their_todos()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        $userTodos = Todo::factory()->count(3)->create([
            'user_id' => $user->id
        ]);
        
        // Another user's todos
        Todo::factory()->count(2)->create();
        
        $response = $this->actingAs($user)->get(route('todos.index'));
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Todos/Index')
                 ->has('todos', 3)
        );
    }
    
    /** @test */
    public function user_can_create_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        $todoData = [
            'title' => 'Test Todo',
            'description' => 'Test description'
        ];
        
        $response = $this->actingAs($user)
                         ->post(route('todos.store'), $todoData);
        
        $response->assertRedirect(route('todos.index'));
        $response->assertSessionHas('success', 'Todo created successfully.');
        
        $this->assertDatabaseHas('todos', [
            'title' => 'Test Todo',
            'description' => 'Test description',
            'user_id' => $user->id
        ]);
    }
    
    /** @test */
    public function user_can_update_their_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Original Title'
        ]);
        
        $response = $this->actingAs($user)
                         ->put(route('todos.update', $todo), [
                             'title' => 'Updated Title',
                             'description' => $todo->description
                         ]);
        
        $response->assertRedirect(route('todos.index'));
        $response->assertSessionHas('success', 'Todo updated successfully.');
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title',
            'user_id' => $user->id
        ]);
    }
    
    /** @test */
    public function user_cannot_update_others_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var User $otherUser */
        $otherUser = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Original Title'
        ]);
        
        $response = $this->actingAs($user)
                         ->put(route('todos.update', $todo), [
                             'title' => 'Updated Title',
                             'description' => $todo->description
                         ]);
        
        $response->assertStatus(403);
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Original Title',
            'user_id' => $otherUser->id
        ]);
    }
    
    /** @test */
    public function user_can_delete_their_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'user_id' => $user->id
        ]);
        
        $response = $this->actingAs($user)
                         ->delete(route('todos.destroy', $todo));
        
        $response->assertRedirect(route('todos.index'));
        $response->assertSessionHas('success', 'Todo deleted successfully.');
        
        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id
        ]);
    }
    
    /** @test */
    public function user_cannot_delete_others_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var User $otherUser */
        $otherUser = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'user_id' => $otherUser->id
        ]);
        
        $response = $this->actingAs($user)
                         ->delete(route('todos.destroy', $todo));
        
        $response->assertStatus(403);
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'user_id' => $otherUser->id
        ]);
    }
    
    /** @test */
    public function user_can_toggle_todo_completion()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        // Create a non-completed todo
        $todo = Todo::factory()->create([
            'user_id' => $user->id,
            'completed' => false
        ]);
        
        $response = $this->actingAs($user)
                         ->post(route('todos.toggle', $todo));
        
        $response->assertRedirect(route('todos.index'));
        $response->assertSessionHas('success', 'Todo status updated.');
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'completed' => true
        ]);
        
        // Toggle back to incomplete
        $response = $this->actingAs($user)
                         ->post(route('todos.toggle', $todo->fresh()));
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'completed' => false
        ]);
    }
    
    /** @test */
    public function user_cannot_toggle_others_todo()
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var User $otherUser */
        $otherUser = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'user_id' => $otherUser->id,
            'completed' => false
        ]);
        
        $response = $this->actingAs($user)
                         ->post(route('todos.toggle', $todo));
        
        $response->assertStatus(403);
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'completed' => false
        ]);
    }
} 
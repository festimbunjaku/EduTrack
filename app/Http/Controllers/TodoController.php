<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware(['auth']);
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $todos = Auth::user()->todos()->latest()->get();
        
        return Inertia::render('Todos/Index', [
            'todos' => $todos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Todos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'nullable|boolean',
        ]);
        
        Auth::user()->todos()->create($validated);
        
        return redirect()->route('todos.index')->with('success', 'Todo created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Todo $todo): Response
    {
        try {
            $this->authorize('view', $todo);
            
            return Inertia::render('Todos/Show', [
                'todo' => $todo,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return redirect()->route('todos.index')->with('error', 'You are not authorized to view this todo.')->toResponse(request());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Todo $todo): Response
    {
        $this->authorize('update', $todo);
        
        return Inertia::render('Todos/Edit', [
            'todo' => $todo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Todo $todo): RedirectResponse
    {
        $this->authorize('update', $todo);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'nullable|boolean',
        ]);
        
        $todo->update($validated);
        
        return redirect()->route('todos.index')->with('success', 'Todo updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Todo $todo): RedirectResponse
    {
        $this->authorize('delete', $todo);
        
        $todo->delete();
        
        return redirect()->route('todos.index')->with('success', 'Todo deleted successfully.');
    }
    
    /**
     * Toggle the completed status of the specified todo.
     */
    public function toggle(Todo $todo): RedirectResponse
    {
        $this->authorize('update', $todo);
        
        $todo->update([
            'completed' => !$todo->completed,
        ]);
        
        return redirect()->route('todos.index')->with('success', 'Todo status updated.');
    }
}

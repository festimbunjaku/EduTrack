<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        // Check if we have search params in session
        $searchParams = session()->get('user_search', [
            'search' => '',
            'role' => 'all',
            'page' => 1
        ]);
        
        // Build the query with filters from session
        $query = User::query()
            ->with('roles')
            ->orderBy('id', 'desc');
        
        // Apply stored search if available
        if (!empty($searchParams['search'])) {
            $search = $searchParams['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . addcslashes($search, '%_') . '%')
                  ->orWhere('email', 'like', '%' . addcslashes($search, '%_') . '%');
            });
        }
        
        // Apply role filter if available
        if (!empty($searchParams['role']) && $searchParams['role'] !== 'all') {
            $role = $searchParams['role'];
            $query->whereHas('roles', function($q) use ($role) {
                $q->where('name', $role);
            });
        }
        
        // Get the page number
        $page = $request->input('page', $searchParams['page'] ?? 1);
        
        // Get paginated results
        $users = $query->paginate(10, ['*'], 'page', $page);
        
        // Render Inertia view with data
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::all()->pluck('name'),
            'filters' => [
                'search' => $searchParams['search'] ?? '',
                'role' => $searchParams['role'] ?? 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully!');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load('roles');
        
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()->name,
            ],
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Rules\Password::defaults()];
        }

        $validated = $request->validate($rules);

        // Update user information
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Update role if it changed
        $currentRole = $user->roles->first()->name;
        if ($validated['role'] !== $currentRole) {
            $user->removeRole($currentRole);
            $user->assignRole($validated['role']);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deletion of self
        if ($user->id === request()->user()->id) {
            return redirect()->route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully!');
    }

    /**
     * Search users with POST method and Inertia
     */
    public function search(Request $request)
    {
        // Validate inputs
        $validated = $request->validate([
            'search' => 'nullable|string|max:100',
            'role' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        // Store search params in session with defaults for empty values
        session()->put('user_search', [
            'search' => $validated['search'] ?? '',
            'role' => $validated['role'] ?? 'all',
            'page' => $validated['page'] ?? 1,
        ]);

        // Build the query using the validated search parameters
        $query = User::query()
            ->with('roles')
            ->orderBy('id', 'desc');

        // Apply search filter if provided
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . addcslashes($search, '%_') . '%')
                  ->orWhere('email', 'like', '%' . addcslashes($search, '%_') . '%');
            });
        }

        // Apply role filter if provided
        if (!empty($validated['role'])) {
            $role = $validated['role'];
            $query->whereHas('roles', function($q) use ($role) {
                $q->where('name', $role);
            });
        }

        // Get the page number
        $page = $validated['page'] ?? 1;
        
        // Get the paginated results
        $users = $query->paginate(10, ['*'], 'page', $page);

        // Prepare data for the response
        $data = [
            'users' => $users,
            'roles' => Role::all()->pluck('name'),
            'filters' => [
                'search' => $validated['search'] ?? '',
                'role' => $validated['role'] ?? 'all',
            ],
        ];
        
        // Return JSON or Inertia response
        if ($request->wantsJson()) {
            return response()->json($data);
        }
        
        // Return Inertia response with partial reload
        return Inertia::render('Admin/Users/Index', $data);
    }
}

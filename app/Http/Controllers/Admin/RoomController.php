<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\TimetableService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    protected $timetableService;

    public function __construct(TimetableService $timetableService)
    {
        $this->timetableService = $timetableService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::withCount('schedules')->paginate(10);

        return Inertia::render('Admin/Rooms/Index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Rooms/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        Room::create($validated);

        return redirect()->route('admin.rooms.index')
            ->with('success', 'Room created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        $schedules = $this->timetableService->getRoomTimetable($room->id);

        return Inertia::render('Admin/Rooms/Show', [
            'room' => $room,
            'schedules' => $schedules,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        return Inertia::render('Admin/Rooms/Edit', [
            'room' => $room,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $room->update($validated);

        return redirect()->route('admin.rooms.index')
            ->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        // Check if room has schedules
        if ($room->schedules()->exists()) {
            return back()->with('error', 'Cannot delete a room with existing schedules.');
        }

        $room->delete();

        return redirect()->route('admin.rooms.index')
            ->with('success', 'Room deleted successfully.');
    }

    /**
     * Display the timetable for all rooms.
     */
    public function timetable()
    {
        $timetables = $this->timetableService->getAllRoomTimetables();

        return Inertia::render('Admin/Rooms/Timetable', [
            'timetables' => $timetables,
        ]);
    }

    /**
     * Check room availability.
     */
    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $availableRooms = $this->timetableService->getAvailableRooms(
            $validated['day_of_week'],
            $validated['start_time'],
            $validated['end_time']
        );

        return response()->json([
            'available_rooms' => $availableRooms,
            'has_available_rooms' => $availableRooms->isNotEmpty(),
        ]);
    }
} 
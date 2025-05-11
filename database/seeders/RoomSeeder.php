<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Room 101',
                'location' => 'Main Building, 1st Floor',
                'capacity' => 25,
                'is_active' => true,
            ],
            [
                'name' => 'Room 102',
                'location' => 'Main Building, 1st Floor',
                'capacity' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Room 103',
                'location' => 'Main Building, 1st Floor',
                'capacity' => 30,
                'is_active' => true,
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
} 
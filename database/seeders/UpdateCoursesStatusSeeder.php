<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course;
use Carbon\Carbon;

class UpdateCoursesStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $today = Carbon::now();
        
        // Set appropriate status based on date ranges
        $courses = Course::all();
        
        foreach ($courses as $course) {
            $startDate = $course->start_date;
            $endDate = $course->end_date;
            
            if ($endDate < $today) {
                $course->status = 'completed';
            } elseif ($startDate > $today) {
                $course->status = 'upcoming';
            } else {
                $course->status = 'active';
            }
            
            $course->save();
        }
        
        $this->command->info('Updated statuses for ' . $courses->count() . ' courses.');
    }
}

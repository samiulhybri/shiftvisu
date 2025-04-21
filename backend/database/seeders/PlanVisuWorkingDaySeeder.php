<?php

namespace Database\Seeders;

use App\Models\PlanVisuWorkingDaysSettings;
use Illuminate\Database\Seeder;

class PlanVisuWorkingDaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $weekDays = [
            ['day' => 'Monday',    'is_working_day' => 1],
            ['day' => 'Tuesday',   'is_working_day' => 1],
            ['day' => 'Wednesday', 'is_working_day' => 1],
            ['day' => 'Thursday',  'is_working_day' => 1],
            ['day' => 'Friday',    'is_working_day' => 1],
            ['day' => 'Saturday',  'is_working_day' => 0],
            ['day' => 'Sunday',    'is_working_day' => 0],
        ];

        foreach ($weekDays as $day) {
            PlanVisuWorkingDaysSettings::create($day);
        }
    }
}

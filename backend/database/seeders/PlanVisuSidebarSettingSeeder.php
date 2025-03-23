<?php

namespace Database\Seeders;

use App\Models\PlanVisuSidebarSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanVisuSidebarSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sidebarMenu = ['planning', 'setup_plan', 'range_overview', 'workload', 'call_off_simulation', 'table', 'employee_planning', 'weekly_planning', 'deadline_monitoring'];
        foreach($sidebarMenu as $menu){
            PlanVisuSidebarSetting::updateOrCreate([
                "name" => $menu
            ], [
                "is_showed" => 1
            ]);
        }

    }
}

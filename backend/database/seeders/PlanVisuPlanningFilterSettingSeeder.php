<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PlanVisuPlanningFilterSetting;

class PlanVisuPlanningFilterSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $filters = ['machine_group', 'machine', 'order', 'item'];
        foreach($filters as $filter){
           PlanVisuPlanningFilterSetting::updateOrCreate([
                "name" => $filter
            ], [
                "is_showed" => 1
            ]);
        }

    }
}

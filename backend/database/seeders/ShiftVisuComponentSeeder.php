<?php

namespace Database\Seeders;

use App\Enums\ShiftVisuComponentTypeEnum;
use App\Models\ShiftVisu\ShiftVisuComponent;
use Illuminate\Database\Seeder;

class ShiftVisuComponentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $components = [
            [
                'custom_id' => 'SUB::Creator',
                'name' => 'Creator',
                'component_type' => ShiftVisuComponentTypeEnum::COMBOBOX,
                'is_required' => true,
            ],
            [
                'custom_id' => 'SUB::Error',
                'name' => 'Error',
                'component_type' => ShiftVisuComponentTypeEnum::DROPDOWN_SINGLE,
                'is_required' => true,
            ],
            [
                'custom_id' => 'SUB::Department',
                'name' => 'Department',
                'component_type' => ShiftVisuComponentTypeEnum::TEXTFIELD,
                'is_required' => true,
            ],
            [
                'custom_id' => 'SUB::Emergency_Measure',
                'name' => 'Emergency Measure',
                'component_type' => ShiftVisuComponentTypeEnum::TEXTAREA,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Emergency_Measure::Finished',
                'name' => 'Finished',
                'component_type' => ShiftVisuComponentTypeEnum::SWITCH,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Emergency_Measure::Responsible',
                'name' => 'Responsible',
                'component_type' => ShiftVisuComponentTypeEnum::COMBOBOX,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Emergency_Measure::End_Date',
                'name' => 'End Date',
                'component_type' => ShiftVisuComponentTypeEnum::DATETIME,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Emergency_Measure::Restart',
                'name' => 'Restart',
                'component_type' => ShiftVisuComponentTypeEnum::DATETIME,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Corrective_Measure',
                'name' => 'Corrective Measure',
                'component_type' => ShiftVisuComponentTypeEnum::TEXTAREA,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Corrective_Measure::Finished',
                'name' => 'Finished',
                'component_type' => ShiftVisuComponentTypeEnum::SWITCH,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Corrective_Measure::Responsible',
                'name' => 'Responsible',
                'component_type' => ShiftVisuComponentTypeEnum::COMBOBOX,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Corrective_Measure::End_Date',
                'name' => 'End Date',
                'component_type' => ShiftVisuComponentTypeEnum::DATETIME,
                'is_required' => false,
            ],
            [
                'custom_id' => 'SUB::Corrective_Measure::Restart',
                'name' => 'Restart',
                'component_type' => ShiftVisuComponentTypeEnum::DATETIME,
                'is_required' => false,
            ],
        ];

        foreach ($components as $component) {
            ShiftVisuComponent::updateOrCreate(
                [
                    'custom_id' => $component['custom_id']
                ], 
                [
                    'name' => $component['name'],
                    'component_type' => $component['component_type'],
                    'is_required' => $component['is_required'],
                ]
            );
        }
    }
}

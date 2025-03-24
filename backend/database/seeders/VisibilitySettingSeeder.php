<?php

namespace Database\Seeders;

use App\Enums\VisibilitySettingType;
use Illuminate\Database\Seeder;
use \App\Models\VisibilitySetting;

class VisibilitySettingSeeder extends Seeder
{
    /**
     * This seeder is created to maintain hide/show options.
     *
     * @return void
     */
    public function run()
    {

        $sidebarSettings = [
            'planning' => true,
            'setup_plan' => true,
            'range_overview' => true,
            'workload' => true,
            'call_off_simulation' => true,
            'table' => true,
            'employee_planning' => true,
            'weekly_planning' => true,
            'deadline_monitoring' => true,
            'production_planning' => false,
            'api_interfaces' => true,
        ];

        // Handle the sidebar settings
        $this->updateOrCreateVisibilitySettings(
            VisibilitySettingType::PLAN_VISU_SIDEBAR()->value,
            $sidebarSettings
        );

        $filters = [
            ## Planvisu planning page filter options (hide/show)
                'machine_group' => true,
                'machine' => true,
                'order' => true,
                'item' => true
        ];

        // Handle the planning page filter settings
        $this->updateOrCreateVisibilitySettings(
            VisibilitySettingType::PLAN_VISU_PLANNING_PAGE_FILTER()->value,
            $filters
        );

        
        ## Planvisu planning page filter options (hide/show)
        $view_options = [
                'standard_view' => 0,
                'view_1' => 1,
                'view_2' => 0,
                'view_3' => 0
        ];

        // Handle the planning page view settings
        $this->updateOrCreateVisibilitySettings(
            VisibilitySettingType::PLAN_VISU_PLANNING_PAGE_VIEW()->value,
            $view_options
        );
    }

    private function updateOrCreateVisibilitySettings($key, $newSettings)
    {
        // Fetch current settings from the database
        $currentSetting = VisibilitySetting::where('type', $key)->first();

        if ($currentSetting) {
            // Decode the current settings
            $currentSettings = json_decode($currentSetting->metadata, true);
            // Merge with new settings
            $mergedSettings = $currentSettings + $newSettings;

            // If merged settings are different from current settings, update the record
            if ($mergedSettings != $currentSettings) {
                $currentSetting->metadata = json_encode($mergedSettings);
                $currentSetting->save();
            }
        } else {
            // If no current settings, create a new record with the new settings
            VisibilitySetting::updateOrCreate(
                ['type' => $key],
                ['metadata' => json_encode($newSettings)]
            );
        }
    }      
}

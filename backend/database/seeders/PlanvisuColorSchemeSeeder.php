<?php

namespace Database\Seeders;

use App\Enums\ProdOrderPosOperationStatus;
use App\Http\Controllers\IdGeneratorController;
use App\Models\IdGeneratorSetting;
use App\Models\PlanVisuColorScheme;
use App\Models\ProdOrderPosOperation;
use Illuminate\Database\Seeder;

class PlanvisuColorSchemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if(env('CLIENT_NAME') != 'ICT' && env('CLIENT_NAME') != 'SHOPFLOOR') $this->runSeederForBasic();
        if(env('CLIENT_NAME') == 'ICT') $this->runSeederForICT(); 
        if(env('CLIENT_NAME') == 'SHOPFLOOR')$this->runSeederForShopfloor();
    }

    public function runSeederForBasic() {
        $baseLegend =  [
            [ 'name' => 'Proposed', 'color' => 'ff8d69', 'border' => 'none' ],
            [ 'name' => 'Planned', 'color' => '0b77cf', 'border' => 'none' ],
            [ 'name' => 'Released', 'color' => 'cd7a00', 'border' => 'none' ],
            [ 'name' => 'In Setup', 'color' => 'b5deb7', 'border' => 'none' ],
            [ 'name' => 'In Production', 'color' => 'd4ad02', 'border' => 'none' ],
            [ 'name' => 'Suspended', 'color' => 'e90b0b', 'border' => 'none' ],
            [ 'name' => 'Restrictions', 'color' => 'ffffff', 'border' => 'fd3131' ],
        ];

        $this->runSeeder($baseLegend);
    }

    public function runSeederForICT() {
        $baseLegend =  [
            [ 'name' => 'In Production', 'color' => 'b5deb7', 'border' => 'none' ],
            [ 'name' => 'In Setup', 'color' => 'cd7a00', 'border' => 'none' ],
            [ 'name' => 'Components prepared', 'color' => '4fb6ac', 'border' => 'none' ],
            [ 'name' => 'Printed', 'color' => 'ff7043', 'border' => 'none' ],
            [ 'name' => 'Components available', 'color' => '0b77cf', 'border' => 'none' ],
            [ 'name' => 'Others', 'color' => '707070', 'border' => 'none' ],
            [ 'name' => 'Restrictions', 'color' => 'ffffff', 'border' => 'fd3131' ],
        ];

        $this->runSeeder($baseLegend);
    }

    public function runSeederForShopfloor() {
        $baseLegend =  [
            [ 'name' => 'Design', 'color' => 'f07371', 'border' => 'none' ],
            [ 'name' => 'Development', 'color' => '85c988', 'border' => 'none' ],
            [ 'name' => 'QA Dev', 'color' => '68b7f7', 'border' => 'none' ],
            [ 'name' => 'QA Test', 'color' => 'ffa533', 'border' => 'none' ],
            [ 'name' => 'Running Task', 'color' => 'ffffff', 'border' => 'FF5C00' ],
        ];

        $this->runSeeder($baseLegend);
    }

    public function runSeeder($list) {
        IdGeneratorSetting::firstOrCreate([
            "entity" => "ColorScheme"
            ], [
            "table" => "plan_visu_color_schemes",
            "prefix" => "CS-",
            "field" => "custom_id",
            "length" => 8
        ]);

        $count = 1;
        foreach($list as $base) {
            $newId = IdGeneratorController::generateId('ColorScheme');
            $colorScheme = new PlanVisuColorScheme();
            $colorScheme->custom_id = $newId;
            $colorScheme->save();

            $colorSort = $colorScheme->createColorSchemeSorting();
            $colorSort->sorting = $count;
            $colorSort->model_type = ProdOrderPosOperation::class;
            $colorSort->model_column = 'pos';
            $colorSort->value_string = $base['name'];
            $colorSort->color = $base['color'];
            $colorSort->has_border = $base['border'] != 'none' ? 1 : 0;
            $colorSort->border_color = $base['border'] != 'none' ? $base['border'] : '';
            $colorSort->update();

            $count++;
        }
    }
}

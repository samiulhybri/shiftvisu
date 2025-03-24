<?php

namespace Database\Seeders;

use App\Enums\MPOffer\MPCostGroup;
use App\Enums\MPOffer\MPCostSubGroup;
use App\Enums\MPOffer\MPCostType;
use App\Models\MpCost;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MPCostTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->addCostTypeData();
    }

    public function addCostTypeData(): void 
    { 
        MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
        MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
    }
}

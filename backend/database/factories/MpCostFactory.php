<?php

namespace Database\Factories;

use App\Enums\MPOffer\MPCostGroup;
use App\Enums\MPOffer\MPCostSubGroup;
use App\Enums\MPOffer\MPCostType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MpCosts>
 */
class MpCostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $mpCosts = [
            "cost_group" => fake()->randomElement(['MATERIAL', 'EXTERNAL', 'INTERNAL']),
            "name" => fake()->word()
        ];

        if($mpCosts['cost_group'] == 'MATERIAL') {
            $mpCosts['cost_sub_group'] = fake()->randomElement(['MATERIAL_INTERNAL', 'MATERIAL_ACQUIRED']);
        } else if($mpCosts['cost_group'] == 'INTERNAL') {
            $mpCosts['cost_sub_group'] = fake()->randomElement(['INTERNAL_TECH_OFFICE', 'INTERNAL_MACHINING', 'INTERNAL_EROSION', 'INTERNAL_ASSEMBLY', 'INTERNAL_SAMPLING', 'INTERNAL_QUALITY']);
        } else {
            $mpCosts['cost_sub_group'] = '';
        }

        if($mpCosts['cost_sub_group'] == 'MATERIAL_INTERNAL') {
            $mpCosts['cost_type'] = fake()->randomElement(['DIMENSION', 'FIXED']);
        } else if($mpCosts['cost_sub_group'] == 'MATERIAL_ACQUIRED') {
            $mpCosts['cost_type'] = fake()->randomElement(['FIXED', 'PIECES', 'WEIGHT']);
        } else {
            $mpCosts['cost_type'] = fake()->randomElement(['DIMENSION', 'PIECES', 'OFFER', 'FIXED', 'WEIGHT']);
        }

        return $mpCosts;
    }
}

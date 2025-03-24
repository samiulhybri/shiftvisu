<?php

namespace Database\Factories;

use App\Models\Bom;
use App\Models\OfferPos;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use App\Models\Specification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Calculation>
 */
class CalculationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "offer_pos_id" => OfferPos::inRandomOrder()->first(),
            "operation_plan_id" => OperationPlan::inRandomOrder()->first(),
            "bom_id" => Bom::inRandomOrder()->first(),
            "specification_id" => Specification::inRandomOrder()->first(),
            "revision" => fake()->word(2),
            "specification_note" => fake()->word(3)
        ];
    }
}

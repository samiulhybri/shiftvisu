<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Machine;
use App\Models\OperationPlan;
use App\Models\SalesOpportunity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OperationPlanPos>
 */
class OperationPlanPosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'operation_plan_id' => OperationPlan::inRandomOrder()->first()->id,
            'pos' => fake()->unique()->word(),
            'name' => fake()->word(),
            'te' => rand(10, 60)/10,
            'tr' => rand(10, 60)/10,
            'machine_id' =>Machine::inRandomOrder()->first()->id,
        ];
    }
}

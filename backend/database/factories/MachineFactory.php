<?php

namespace Database\Factories;

use App\Enums\ProductionPlanType;
use App\Models\Hall;
use App\Models\MachineGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Validation\Rules\Unique;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Machine>
 */
class MachineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {   
        $machine = [
            "custom_id" => fake()->unique()->numberBetween(1000, 2000000),
            "name" => fake()->word(),
            "usage_factor" => rand(1,9),
            "tr" => rand(1,9),
            // "hall_id" => Hall::inRandomOrder()->first()->id,
            // "machine_group_id" => MachineGroup::inRandomOrder()->first()->id,
            "is_furnace" => rand(0,1),
            "is_casting_machine" => rand(0,1),
            "has_operation_pool" => rand(0,1),
            "production_plan_type" => array_rand(ProductionPlanType::toArray())
        ];
        if($machine['is_furnace'] == 1) {
            $machine['is_casting_machine'] = 0;
        } 
        if($machine['is_furnace'] == 0) {
            $machine['is_casting_machine'] = 1;
        }
        return $machine;
    }
}

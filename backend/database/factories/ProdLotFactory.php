<?php

namespace Database\Factories;

use App\Models\Machine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProdLot>
 */
class ProdLotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'custom_id' => fake()->unique()->numberBetween(1000, 2000),
            'machine_id' => Machine::inRandomOrder()->first()->id,
        ];
    }
}

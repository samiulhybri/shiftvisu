<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MpPersonnel>
 */
class MpPersonnelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "custom_id" => fake()->unique()->numberBetween(1000, 5000),
            "name" => fake()->name(),
            "price" => fake()->randomFloat(1000,100000)
        ];
    }
}

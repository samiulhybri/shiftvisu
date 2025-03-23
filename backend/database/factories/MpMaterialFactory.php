<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MpMaterials>
 */
class MpMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "custom_id" => fake()->unique()->numberBetween(1000, 50000),
            "name" => fake()->word(),
            "density" => fake()->numberBetween(10, 90),
            "price" => fake()->numberBetween(10000, 99000)
        ];
    }
}

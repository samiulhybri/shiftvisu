<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Norm>
 */
class NormFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => fake()->name(),
            'custom_id' => fake()->unique()->numberBetween(1000, 2000),
            'material_id' => Material::inRandomOrder()->first(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Bom;
use App\Models\OperationPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
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
            'is_sales_item' => rand(0, 1),
            'name' => fake()->word(),
            'use_stock_for_backlog' => rand(0, 1),
        ];
    }
}

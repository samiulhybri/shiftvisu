<?php

namespace Database\Factories;

use App\Models\Bom;
use App\Models\OperationPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChemAnalysis>
 */
class ChemAnalysisFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => fake()->word(),
            'min' => rand(0, 1),
            'max' => rand(1, 2),
        ];
    }
}

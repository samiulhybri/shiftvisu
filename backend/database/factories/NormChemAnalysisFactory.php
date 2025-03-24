<?php

namespace Database\Factories;

use App\Models\ChemAnalysis;
use App\Models\Norm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NormChemAnalysis>
 */
class NormChemAnalysisFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'norm_id' => Norm::inRandomOrder()->first()->id,
            'chem_analyses_id' => ChemAnalysis::inRandomOrder()->first()->id
        ];
    }
}

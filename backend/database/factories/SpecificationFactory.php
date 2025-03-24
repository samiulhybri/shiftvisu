<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Norm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Specification>
 */
class SpecificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'custom_id' => fake()->unique()->numberBetween(5555, 7777),
            'norm_id' => Norm::inRandomOrder()->first()->id,
            'specification_note' => fake()->sentence(),
            'note' => fake()->text(),
            'customer_id' => Customer::inRandomOrder()->first()->id,
            'bom' => fake()->word(),
            'is_electric_steel' => rand(0, 1),
            'is_vacuum_degassed' => rand(0, 1),
            'is_classified_steel_plant' => rand(0, 1),
            'is_casting_beam_shielded' => rand(0, 1),
            'is_deoxidized' => rand(0, 1),
            'is_killed_steel' => rand(0, 1),
            'jominy_batch' => fake()->word(2),
            'continuous_casting' => fake()->word(2),
            'ingot_casting' => fake()->word(2),
            'deformation' => fake()->word(2),
            'stretch_forging_degree' => fake()->word(2),
            'check_stock' => rand(0, 1),
            'KSR_max' => fake()->word(2),
            'attestation' => fake()->word(2),
            'attestation_entity' => fake()->word(2),
            'non_destructive_testing' => fake()->word(2),
            'frequency' => fake()->word(2),
            'specimen_rest_material' => fake()->word(2),
            'WZV_temperature' => rand(4, 100),
            'zug' => rand(4, 100) / 10,
            'kbz' => rand(4, 100) / 10,
            'wzv' => rand(4, 100) / 10,
            'needs_ic_3651_2_method_a' => rand(0, 1),
            'needs_ic_3651_1' => rand(0, 1),
            'needs_ic_a262_practice_e' => rand(0, 1),
            'product_analysis' => rand(0, 1),
            'grain_size' => fake()->word,
            'is_50601' => rand(0, 1),
            'astm_e112' => rand(0, 1),
            'iso_643' => rand(0, 1),
            'grain_size_after_carburizing' => fake()->word,
            'needs_jominy_face_quenching_test' => rand(0, 1),
            'needs_microsection_structure' => rand(0, 1),
            'needs_microsection_cleanliness' => rand(0, 1),
            'needs_microsection_carburized' => rand(0, 1),
            'needs_microsection_grain_size' => rand(0, 1),
        ];
    }
}

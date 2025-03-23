<?php

namespace Database\Factories;

use App\Enums\MPOffer\MPConstructionType;
use App\Enums\MPOffer\MPToolType;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Customer;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MpOffer>
 */
class MpOfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "custom_id" => fake()->unique()->numberBetween(1000, 200000),
            "date" => Carbon::now()->subDays(rand(1, 5)),
            "customer_id" => Customer::inRandomOrder()->first()->id,
            "final_customer_id" => Customer::inRandomOrder()->first()->id,
            "tool_type" => fake()->randomElement(['Plastic', 'Plastic Rubber', 'Die Casting']),
            "name" => fake()->name(),
            "is_closed" => rand(0, 1),
            "construction_type" => fake()->randomElement(['New', 'Renewal', 'Active Parts', 'Maintainance', 'Repair', 'Accessories', 'Prototype']),
            "press_weight" => fake()->randomFloat(1, 100),
            "quantity_imprint" => fake()->randomFloat(1, 100),
            "max_length" => fake()->randomFloat(1, 100),
            "max_width" => fake()->randomFloat(1, 100),
            "max_height" => fake()->randomFloat(1, 100),
            "weight" => fake()->randomFloat(1, 100),
            "length" => fake()->randomFloat(1, 100),
            "width" => fake()->randomFloat(1, 100),
            "height" => fake()->randomFloat(1, 100),
            "size" => fake()->randomFloat(1, 100),
            "projected_area" => fake()->randomFloat(1, 100),
            "imprint_volume" => fake()->randomFloat(1, 100),
            "material" => fake()->word(1),
            "shots_guaranteed" => fake()->randomFloat(1, 100),
            "finishing_visible" => fake()->word(),
            "finishing_not_visible" => fake()->word(),
            "injection_type" => fake()->randomElement(['Single', 'Hot Channel']),
            "nozzle_quantity" => fake()->randomFloat(1, 100),
            "nozzle_type" => fake()->randomElement(['Cold', 'Hot', 'Clogging']),
            "rubber_injection" => fake()->word(),
            "has_movements" => rand(0, 1),
            "movements_mechanic" => fake()->randomFloat(1, 100),
            "movements_hydraulic" => fake()->randomFloat(1, 100),
            "rods" => fake()->randomFloat(1, 100),
            "jowls" => fake()->randomFloat(1, 100),
            "unscrewing" => fake()->randomFloat(1, 100),
            "has_third_plate" => rand(0, 1),
            "has_double_extraction" => rand(0, 1),
            "extraction_type" => fake()->randomElement(['Machanic', 'Hydraulic', 'Machanic Hydraulic']),
            "is_rounded_extractor" => rand(0, 1),
            "is_tear_extractor" => rand(0, 1),
            "is_tubular_extractor" => rand(0, 1),
            "is_square_extractor" => rand(0, 1),
            "is_extraction_help_fixed" => rand(0, 1),
            "is_hydraulic_extraction_fixed" => rand(0, 1),
            "has_laths_rings" => rand(0, 1)
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Machine;
use App\Models\MpCost;
use App\Models\MpMaterial;
use App\Models\MpOffer;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MpOfferPos>
 */
class MpOfferPosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "mp_offer_id" => MpOffer::inRandomOrder()->first()->id,
            "mp_costs_id" => MpCost::inRandomOrder()->first()->id,
            "cost_group" => function (array $fake) {
                return MpCost::find($fake['mp_costs_id'])->cost_group;
            },
            "cost_sub_group" => function (array $fake) {
                return MpCost::find($fake['mp_costs_id'])->cost_sub_group;
            },
            "cost_type" => function (array $fake) {
                return MpCost::find($fake['mp_costs_id'])->cost_type;
            },
            "name" => function (array $fake) {
                return MpCost::find($fake['mp_costs_id'])->name;
            },
            // "cost_group" => fake()->randomElement(['Material', 'External', 'Internal']),
            // "cost_sub_group" => fake()->randomElement(['Material Internal', 'Material Acquired', 'Internal Tech Office', 'Internal Machining', 'Internal Erosion', 'Internal Assembly', 'Internal Sampling', 'Internal Quality']),
            // "cost_type" => fake()->randomElement(['Dimension', 'Pieces', 'Offer', 'Fixed', 'Weight']),
            // "name" => fake()->word(),
            "length" => fake()->randomFloat(1, 100),
            "width" => fake()->randomFloat(1, 100),
            "height" => fake()->randomFloat(1, 100),
            "mp_material_id" => MpMaterial::inRandomOrder()->first()->id,
            "price" => fake()->randomFloat(100, 100000),
            "total" => fake()->randomFloat(100, 10000),
            "density" => fake()->randomFloat(1, 100),
            "quantity" => fake()->numberBetween(1, 1000),
            "supplier_offer_id" => fake()->numberBetween(1, 100),
            "supplier_name" => fake()->name(),
            "supplier_offer_date" => Carbon::now()->subDays(rand(1, 5)),
            "machine_id" => Machine::inRandomOrder()->first()->id,
            "machine_quantity" => fake()->numberBetween(1, 100),
            "machine_price" => fake()->randomFloat(1000, 1000000),
            "personnel_quantity" => fake()->numberBetween(1, 100),
            "personnel_price" => fake()->randomFloat(1000, 1000000),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Enums\OfferPosProductType;
use App\Models\Item;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfferPos>
 */
class OfferPosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'offer_id' => Offer::inRandomOrder()->first()->id,
            'pos' => fake()->word(1),
            'standard_item_id' => Item::inRandomOrder()->first()->id,
            'item_name' => fake()->word(1),
            'product_type' => fake()->randomElement(OfferPosProductType::toArray()),
            'quantity' => rand(0, 100),
            'outer_diameter' => rand(0, 100),
            'inner_diameter' => rand(0, 100),
            'height' => rand(0, 100),
            'drawing_id' => fake()->word(1),
            'attachments' => fake()->word(2),
            'offset_number' => rand(0, 1),
        ];
    }
}

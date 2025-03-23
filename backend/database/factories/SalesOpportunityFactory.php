<?php

namespace Database\Factories;

use App\Enums\SalesOpportunityType;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesOpportunity>
 */
class SalesOpportunityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'customer_id' => Customer::inRandomOrder()->first()->id,
            'custom_id' => fake()->unique()->numberBetween(5555, 7777),
            'sales_department' => 'dep-' . fake()->numberBetween(20, 99),
            'customer_reference' => 'ref-' . fake()->unique()->numberBetween(5555, 7777),
            'request_date' => $date = Carbon::now()->subDays(rand(1, 5)),
            'offer_until_date' => $date->addDays(rand(6, 10)),
            'contact_person' => fake()->word(1),
            'type' => array_rand(SalesOpportunityType::toArray()),
            'additional_info' => fake()->word(1),
            'changes' => fake()->word(2),
            'is_short_offer' => rand(0, 1),
            'sales_group' => rand(0, 1),
            'is_specification_necessary' => rand(0, 1),
        ];
    }
}

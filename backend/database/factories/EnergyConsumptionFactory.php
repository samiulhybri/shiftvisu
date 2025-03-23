<?php

namespace Database\Factories;

use App\Enums\EnergyType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EnergyConsumption>
 */
class EnergyConsumptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "date" => fake()->date(),
            "energy_consumer_id" => rand(1,9),
            "energy_type" => fake()->randomElement(EnergyType::toValues()),
            "hour_of_day" => rand(1,23),
            "energy_consumption" => rand(1,99),
        ];
    }
}

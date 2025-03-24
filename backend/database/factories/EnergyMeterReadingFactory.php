<?php

namespace Database\Factories;

use App\Enums\EnergyType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EnergyMeterReading>
 */
class EnergyMeterReadingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "energy_consumer_id" => rand(1,9),
            "value" => rand(1,100),
            "energy_type" => fake()->randomElement(EnergyType::toValues()),
            "energy_meter_id" => rand(1,50),
        ];
    }
}

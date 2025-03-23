<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EnergyConsumerMachine>
 */
class EnergyConsumerMachineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "machine_id" => rand(1,9),
            "energy_consumer_id" => rand(1,9),
        ];
    }
}

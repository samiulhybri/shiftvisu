<?php

namespace Database\Factories;

use App\Enums\EnergyGatewayType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EnergyGateway>
 */
class EnergyGatewayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "custom_id" => fake()->unique()->numberBetween(1000, 2000),
            "ip_address" => fake()->ipv4(),
            "port" => fake()->unique()->numberBetween(3000, 65000),
            "gateway_type" => fake()->randomElement(EnergyGatewayType::toValues()),
        ];
    }
}

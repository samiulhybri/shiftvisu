<?php

namespace Database\Factories;

use App\Enums\ModbusDataType;
use App\Enums\EnergyType;
use App\Enums\ModbusFunctionCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class EnergyMeterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            "factor" => rand(1,99),
            "interval" => rand(1,99),
            "input_number" => rand(1,99),
            "data_type" => fake()->randomElement(ModbusDataType::toValues()),
            "modbus_function_code" => fake()->randomElement(ModbusFunctionCode::toValues()),
            "slave_id" => rand(1,9),
            "address" => rand(1,9),
            "energy_consumer_id" => fake()->numberBetween(1,99),
            "energy_type" => fake()->randomElement(EnergyType::toValues()),
            "energy_gateway_id" => rand(1, 99),
        ];
    }
}

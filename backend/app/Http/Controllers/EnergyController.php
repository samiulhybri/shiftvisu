<?php

namespace App\Http\Controllers;

use App\Enums\EnergyType;
use App\Models\EnergyConsumption;
use App\Models\EnergyMeterReading;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class EnergyController extends Controller
{
    public function saveConsumptionFromGateWay(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'consumption_hour' => 'required|date_format:Y-m-d H:i:s',
            'registered_datetime' => 'required|date_format:Y-m-d H:i:s',
            'energy_consumer_id' => 'required|integer|exists:energy_consumers,id',
            'energy_type' => [
                'required',
                Rule::in(collect(EnergyType::cases())->map(fn(EnergyType $type) => $type->value)->toArray()), // Must be a valid enum value
            ],
            'energy_consumption' => 'required|numeric|min:0', // Must be a positive numeric value
        ]);

        $data = [
            'date' => $validated['date'],
            'energy_consumer_id' => $validated['energy_consumer_id'],
            'energy_type' => $validated['energy_type'],
            'consumption_hour' => $validated['consumption_hour'],
            'energy_consumption' => $validated['energy_consumption'],
            'created_at' => now(),
            'updated_at' => now(),
        ];

        try {
            EnergyConsumption::create($data);
            Log::info("Energy consumption data saved successfully!");
        } catch (\Exception $e) {
            Log::error('Failed to save energy consumption data');
        }
    }

    public function saveMeterReadingFromGateway(Request $request)
    {
        $validated = $request->validate([
            'energy_consumer_id' => 'required|numeric|min:0',
            'value' => 'required|numeric|min:0', // Reading value must be a positive number
            'energy_meter_id' => 'required|numeric|min:0',
            'energy_type' => [
                'required',
                Rule::in(collect(EnergyType::cases())->map(fn(EnergyType $type) => $type->value)->toArray())
            ],
        ]);

        $data = [
            'energy_consumer_id' => $validated['energy_consumer_id'],
            'energy_type' => $validated['energy_type'],
            'consumption_hour' => $validated['consumption_hour'],
            'value' => $validated['value'],
            'created_at' => now(),
            'updated_at' => now(),
        ];

        try {
            EnergyMeterReading::create($data);
            Log::info("Energy meter reading data saved successfully!");
        } catch (\Exception $e) {
            Log::error('Failed to save energy meter reading data');
        }
    }
}

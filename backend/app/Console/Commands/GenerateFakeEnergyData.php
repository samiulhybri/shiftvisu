<?php

namespace App\Console\Commands;

use App\Models\EnergyConsumer;
use App\Models\EnergyConsumerMachine;
use App\Models\EnergyConsumption;
use App\Models\EnergyGateway;
use App\Models\EnergyMeter;
use App\Models\EnergyMeterReading;
use App\Models\EnergyReading;
use App\Models\Machine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateFakeEnergyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fake_energy_data:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '<fake_energy_data:seed> command is used to create fake data list for energy module';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            EnergyConsumer::factory()->count(100)->create();
            EnergyConsumerMachine::factory()->count(10)->create();
            EnergyGateway::factory()->count(100)->create();
            EnergyMeter::factory()->count(100)->create();
            EnergyMeterReading::factory()->count(100)->create();
            EnergyConsumption::factory()->count(100)->create();
            Log::info("Energy module data seeding completed successfully!");
        } catch (\Throwable $th) {
            Log::error($th);
        }
        return 0;
    }
}

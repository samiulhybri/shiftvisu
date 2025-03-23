<?php

namespace App\Console\Commands\EnerVisuCommands;

use App\Enums\ModbusDataType;
use App\Enums\ModbusFunctionCode;
use App\Models\EnergyGateway;
use App\Models\EnergyMeter;
use App\Models\EnergyMeterReading;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use ModbusTcpClient\Composer\Read\ReadRegistersBuilder;
use ModbusTcpClient\Network\NonBlockingClient;

class ReadEnergyMeters extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'read:energy_meters';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reads energy meter data and inserts it into energy meter readings table';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $gateways = EnergyGateway::select('energy_meters.id AS meter_id', 'ip_address', 'port', 'gateway_type', 'interval', 'slave_id', 'address', 'energy_consumer_id', 'energy_type', 'data_type', 'modbus_function_code')
            ->join('energy_meters', 'energy_gateways.id', '=', 'energy_meters.energy_gateway_id')
            ->where('energy_gateways.gateway_type', '=', 'MODBUS_TCP')
            ->where(function ($query) {
                $query->where('energy_meters.next_read_at', '<', Carbon::now())
                    ->orWhereNull('energy_meters.next_read_at');
            })
            ->get();

        foreach ($gateways as $gateway) {
            $uri = "tcp://{$gateway->ip_address}:{$gateway->port}";
            $this->readEnergyMeter($gateway, $uri);
        }
        return Command::SUCCESS;
    }

    /**
     * @param Object $gateway
     * @param int $uri
     * @return void
     */
    public function readEnergyMeter($gateway, string $uri): void
    {
        if ($gateway->data_type == ModbusDataType::FLOAT()) {
            switch ($gateway->modbus_function_code) {
                case ModbusFunctionCode::FC3():
                    $request = ReadRegistersBuilder::newReadHoldingRegisters($uri, $gateway->slave_id)
                        ->float($gateway->address - 2, 'FIX1')
                        ->float($gateway->address - 1, 'FIX2')
                        ->float($gateway->address, 'MeterReading')
                        ->build();
                    break;
                
                case ModbusFunctionCode::FC4():
                    $request = ReadRegistersBuilder::newReadInputRegisters($uri, $gateway->slave_id)
                        ->float($gateway->address - 2, 'FIX1')
                        ->float($gateway->address - 1, 'FIX2')
                        ->float($gateway->address, 'MeterReading')
                        ->build();
                    break;
            
                default:
                    break;
            }
        } else {
            switch ($gateway->modbus_function_code) {
                case ModbusFunctionCode::FC3():
                    $request = ReadRegistersBuilder::newReadHoldingRegisters($uri, $gateway->slave_id)
                        ->uint16($gateway->address - 1, 'FIX1')
                        ->uint16($gateway->address, 'MeterReading')
                        ->build();
                    break;
                
                case ModbusFunctionCode::FC4():
                    $request = ReadRegistersBuilder::newReadInputRegisters($uri, $gateway->slave_id)
                        ->uint16($gateway->address - 1, 'FIX1')
                        ->uint16($gateway->address, 'MeterReading')
                        ->build();
                    break;
            
                default:
                    break;
            }
        }

        try {
            $response = (new NonBlockingClient(['readTimeoutSec' => 0.4]))->sendRequests($request);
            $data = $response->getData();

            EnergyMeterReading::create([
                'energy_consumer_id'    => $gateway->energy_consumer_id,
                'value'                 => $data['MeterReading'],
                'energy_type'           => $gateway->energy_type,
                'energy_meter_id'       => $gateway->meter_id,
            ]);

            EnergyMeter::where('id', $gateway->meter_id)
                ->update(['next_read_at' => Carbon::now()->addMinutes($gateway->interval)]);
        } catch (Exception $exception) {
            Log::error($exception->getMessage());
        }
    }
}

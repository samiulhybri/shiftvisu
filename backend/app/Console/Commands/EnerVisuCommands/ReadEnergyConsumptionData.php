<?php

namespace App\Console\Commands\EnerVisuCommands;

use App\Models\EnergyConsumption;
use App\Models\EnergyMeter;
use App\Models\EnergyMeterReading;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReadEnergyConsumptionData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'read:energy_consumption';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reads hourly energy consumption data from energy meters by grouping the energy consumer ID and inserts it into the energy consumption table';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {

            /*
                Cases:
                1: If there is only the current hour and no last hour, then the value is the current_hour value.
                2: The difference between the latest record of the current hour and the latest record of the last hour.
                3: The difference between the latest record of the current hour and the most recent hours' latest records.
                4: If the latest records of the current hour and the last hour are the same, then the value is 0.
            */

            // Get all distinct consumers, there energy tpe and factor value
            $consumers = EnergyMeter::selectRaw('DISTINCT energy_consumer_id, energy_type, factor')
                ->get();
            $consumerIds = [];
            $distinctConsumersFactorValue = [];
            foreach ($consumers as $key => $value) {
                $consumerIds[] = $value->energy_consumer_id;
                $distinctConsumersFactorValue[$key]['energy_consumer_id'] = $value->energy_consumer_id;
                $distinctConsumersFactorValue[$key]['energy_type'] = $value->energy_type;
                $distinctConsumersFactorValue[$key]['factor'] = $value->factor;
            }
            
            //get all readings of last hour grouped by consumer and energy_type
            $consumersAvailableForCurrentHour = EnergyMeterReading::whereIn('id', function($query) {
                $query->select(DB::raw('max(id)'))
                    ->from('energy_meter_readings')
                    ->whereBetween('created_at', [Carbon::now()->subHour()->startOfHour(), Carbon::now()->subHour()->endOfHour()])
                    ->groupBy('energy_consumer_id', 'energy_type');
            })->get();
            
            $insertRowList = [];
            $consumerListToCheckHasPreviousHourData = [];
            // Where there is energy meter data for current hour for a consumer, and energy_type
            if (sizeof($consumersAvailableForCurrentHour) > 0) {
                foreach ($consumersAvailableForCurrentHour as $consumer) {
                    if (in_array($consumer->energy_consumer_id, $consumerIds)) {
                        $consumerListToCheckHasPreviousHourData[] = $consumer->energy_consumer_id;
                        $consumerLastReading = $this->getConsumerLastReading($consumer->energy_consumer_id);
                        
                        $rawDifference = $consumer->value - $consumerLastReading;
                        $consumerLastHourReading = ($rawDifference < 0) ? (pow(2, 16) - abs($rawDifference)) : $rawDifference; //Fix 16 bit overflow ADK

                        $insertRowList[] = [
                            'date'                      => Carbon::now()->format('Y-m-d'),
                            'energy_consumer_id'        => $consumer->energy_consumer_id,
                            'energy_type'               => $consumer->energy_type,
                            'consumption_hour'         => Carbon::now()->subHour()->startOfHour(),
                            'energy_consumption'        => $consumerLastHourReading * $this->getConsumerFactor($consumer->energy_consumer_id, $consumer->energy_type, $distinctConsumersFactorValue),
                            'created_at'                => Carbon::now(),
                            'updated_at'                => Carbon::now(),
                        ];
                    }
                }
            }
            $consumersWithNoCurrentHourData = array_diff($consumerIds, $consumerListToCheckHasPreviousHourData);
            forEach($consumers AS $consumer){
                if(in_array($consumer->energy_consumer_id, $consumersWithNoCurrentHourData)){
                    $insertRowList[] = [
                        'date'                      => Carbon::now()->format('Y-m-d'),
                        'energy_consumer_id'        => $consumer->energy_consumer_id,
                        'energy_type'               => $consumer->energy_type,
                        'consumption_hour'         => Carbon::now()->subHour()->startOfHour(),
                        'energy_consumption'        => 0,
                        'created_at'                => Carbon::now(),
                        'updated_at'                => Carbon::now(),
                    ];
                }
            }
            
            // batch inserting all calculated values
            EnergyConsumption::upsert($insertRowList, ['energy_consumer_id','date','energy_type','consumption_hour'], ['energy_consumption']);
            // Log::info('Energy Consumption data run successfully');
            return Command::SUCCESS;

        } catch (\Throwable $e) {
            Log::error('Error processing energy consumption data: '.$e->getMessage());
        }
    }

    /**
     * return the last row consumption value before calculating hour. if not found then return first consumption value of calculating hour 
     * @param int $consumerId
     * @return float
     */
    public function getConsumerLastReading($consumerId){
        
        $beforeLastRow = EnergyMeterReading::where('created_at', '<', Carbon::now()->subHour()->startOfHour())
                        ->where('energy_consumer_id', '=', $consumerId)
                        ->orderBy('created_at', 'desc')
                        ->limit(1);

        $afterFirstRow = EnergyMeterReading::where('created_at', '>=', Carbon::now()->subHour()->startOfHour())
                        ->where('energy_consumer_id', '=', $consumerId)
                        ->orderBy('created_at', 'asc')
                        ->limit(1);

        $lastRow = $beforeLastRow->union($afterFirstRow)->get();
        return $lastRow[0]->value;
    }

    private function getConsumerFactor($consumerId, $energy_type, $distinctConsumersFactorValue){
        $factorValue = 1;
        foreach ($distinctConsumersFactorValue as $entry) {
            if ($entry['energy_consumer_id'] === $consumerId && $entry['energy_type'] === $energy_type) {
                $factorValue = $entry['factor'];
                break;
            }
        }
        return $factorValue;
    }     
}

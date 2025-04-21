<?php

namespace App\Console\Commands;

use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\Machine;
use Illuminate\Console\Command;

class QualiVisuCheckMachineShift extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'quali-visu:check-machine-shift';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        foreach (Machine::with('currentCapacities')->get() as $machine) {
            foreach ($machine->prodOrderPosOperationTimes()
                         ->with(['prodOrderPosOperation', 'prodOrderPosOperation.prodInspectionOperations'])
                         ->whereNull('end')
                         ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                         ->get() as $operationInProduction) {
                foreach ($operationInProduction
                             ->prodOrderPosOperation
                             ->prodInspectionOperations()
                             ->where('frequency', ProdInspectionOperationFrequency::MACHINE_SHIFT)
                             ->get() as $prodInspectionOperation) {
                    $currentCapacity = $machine->currentCapacities->first();

                    if(!$currentCapacity)
                        continue;

                    if ($prodInspectionOperation->capacity_id_last_point) {
                        //TODO Make seconds dynamic
                        if ($prodInspectionOperation->capacity_id_last_point != $currentCapacity->id && $currentCapacity->start_time > now()->addSeconds(600)->toTimeString()) {
                            $prodInspectionOperation->capacity_id_last_point = $currentCapacity->id;
                            $prodInspectionOperation->save();
                            $prodInspectionOperation->createInspectionPoint();
                        }
                    } else {
                        //Save first shift when operation was started
                        $prodInspectionOperation->capacity_id_last_point = $currentCapacity->id;
                        $prodInspectionOperation->save();
                    }
                }
            }
        }
    }
}

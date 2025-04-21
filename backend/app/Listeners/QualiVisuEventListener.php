<?php

namespace App\Listeners;

use App\Enums\MachineStateStateType;
use App\Enums\MachineStateType;
use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\QualiEventType;
use App\Events\ComponentScanned;
use App\Events\HandlingUnitCreated;
use App\Events\MachineCycleRegistered;
use App\Events\MachineShiftStarted;
use App\Events\MachineStateChanged;
use App\Events\OperationClosed;
use App\Events\OperationProductionStarted;
use App\Events\OperationSetupStarted;
use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
use App\Models\QualiEvent;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QualiVisuEventListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        try {
            if ($event instanceof ComponentScanned) {
                $this->createQualiEvent($event->machine, QualiEventType::COMPONENT_SCANNED, $event->operation);

                foreach ($event->operation?->prodInspectionOperations()->where('frequency', ProdInspectionOperationFrequency::COMPONENT_SCANNED)->get() as $prodInspectionOperation) {
                    $prodInspectionOperation->createInspectionPoint();
                }
            } elseif ($event instanceof MachineCycleRegistered) {
                foreach ($event->machine->prodOrderPosOperationTimes()
                             ->with(['prodOrderPosOperation', 'prodOrderPosOperation.prodInspectionOperations'])
                             ->whereNull('end')
                             ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                             ->get() as $operationInProduction) {
                    $operation = $operationInProduction->prodOrderPosOperation;
                    foreach ($operation->prodInspectionOperations()
                                 ->where('frequency', ProdInspectionOperationFrequency::CYCLE_FREQUENCY)
                                 ->get() as $prodInspectionOperation) {

                        if (!$prodInspectionOperation->interval_cycles)
                            continue;

                        $latestInspectionPoint = $prodInspectionOperation->inspectionPoints()->latest('registered_datetime')->first();

                        $lastMachineCycleTrigger = $latestInspectionPoint?->machine_cycle_id_trigger ?? null;

                        $operations = $operation->prodOrderPosOperationTimes()->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())->get();

                        $periods = $operations->map(function ($operation) {
                            return [$operation->start, $operation->end ?? now()];
                        });

                        $query = DB::table('machine_cycles')
                            ->where('machine_id', $event->machine->id)
                            ->where(function ($query) use ($lastMachineCycleTrigger, $periods) {
                                if ($lastMachineCycleTrigger) {
                                    // If $varId is set, use "id > $varId"
                                    $query->where('id', '>', $lastMachineCycleTrigger);
                                } else {
                                    // Apply multiple dynamic registered_datetime periods if we open the first inspection point
                                    $query->where(function ($subQuery) use ($periods) {
                                        foreach ($periods as $period) {
                                            $subQuery->orWhereBetween('registered_datetime', [$period[0], $period[1]]);
                                        }
                                    });
                                }
                            })
                            ->where(function ($query) use ($operation) {
                                $query->where('prod_order_pos_operation_id', $operation->id)
                                    ->orWhereNull('prod_order_pos_operation_id');
                            })
                            ->selectRaw('SUM(quantity) as total_quantity, MAX(id) as max_cycle_id')
                            ->first();

                        // Access the results
                        $totalQuantity = $query->total_quantity;
                        $maxCycleId = $query->max_cycle_id;

                        if ($totalQuantity >= $prodInspectionOperation->interval_cycles)
                            $prodInspectionOperation->createInspectionPoint($maxCycleId);
                    }
                }
            } elseif ($event instanceof OperationSetupStarted) {
                $this->createQualiEvent($event->machine, QualiEventType::OPERATION_SETUP_STARTED, $event->operation);

                foreach ($event->operation->prodInspectionOperations()->where('frequency', ProdInspectionOperationFrequency::OPERATION_IN_SETUP)->get() as $prodInspectionOperation) {
                    $prodInspectionOperation->createInspectionPoint();
                }
            } elseif ($event instanceof OperationProductionStarted) {
                $this->createQualiEvent($event->machine, QualiEventType::OPERATION_PRODUCTION_STARTED, $event->operation);

                foreach ($event->operation->prodInspectionOperations()->where('frequency', ProdInspectionOperationFrequency::OPERATION_IN_PRODUCTION)->get() as $prodInspectionOperation) {
                    $prodInspectionOperation->createInspectionPoint();
                }
            } elseif ($event instanceof OperationClosed) {
                $this->createQualiEvent($event->machine, QualiEventType::OPERATION_CLOSED, $event->operation);
                //Inspection point is triggered from $operation->canCloseOperation called from the frontend before closing
            } elseif ($event instanceof MachineStateChanged) {
                //Check if this state is productive -> search last productive -> check if in between there was at least x time a state that was quality relevant
                if ($event->machineStateTime->machineState->state_type == MachineStateStateType::PRODUCTION()) {
                    //Search last productive
                    $latestEndTime = DB::table('machine_machine_state_times')
                        ->join('machine_states', 'machine_states.id', '=', 'machine_machine_state_times.machine_state_id')
                        ->where('machine_machine_state_times.machine_id', $event->machine->id)
                        ->where('machine_states.state_type', MachineStateStateType::PRODUCTION())
                        ->where('machine_machine_state_times.id', '<>', $event->machineStateTime->id)
                        ->max('machine_machine_state_times.end');

                    //Check if there was at least one state for more time than microstop
                    $stateWithDuration = DB::table('machine_machine_state_times')
                        ->join('machine_states', 'machine_states.id', '=', 'machine_machine_state_times.machine_state_id')
                        ->where('machine_machine_state_times.machine_id', $event->machine->id)
                        ->where('machine_machine_state_times.id', '<>', $event->machineStateTime->id)
                        ->where('machine_machine_state_times.start', '>=', $latestEndTime)
                        ->where('machine_states.is_quality_relevant', true)
                        ->groupBy('machine_states.id', 'machine_states.microstop_duration')
                        ->havingRaw('SUM(EXTRACT(EPOCH FROM (COALESCE(machine_machine_state_times.end, NOW()) - GREATEST(machine_machine_state_times.start, ?)))) > machine_states.microstop_duration',
                            [$latestEndTime])
                        ->selectRaw('machine_states.id, machine_states.microstop_duration, SUM(EXTRACT(EPOCH FROM (COALESCE(machine_machine_state_times.end, NOW()) - GREATEST(machine_machine_state_times.start, ?)))) as time',
                            [$latestEndTime])
                        ->first();

                    if ($stateWithDuration) {
                        foreach ($event->machine->prodOrderPosOperationTimes()
                                     ->with(['prodOrderPosOperation', 'prodOrderPosOperation.prodInspectionOperations'])
                                     ->whereNull('end')
                                     ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                                     ->get() as $operationInProduction) {
                            foreach ($operationInProduction
                                         ->prodOrderPosOperation
                                         ->prodInspectionOperations()
                                         ->where('frequency', ProdInspectionOperationFrequency::OPERATION_IN_SETUP)
                                         ->get() as $prodInspectionOperation) {
                                $prodInspectionOperation->createInspectionPoint();
                            }
                        }
                    }
                }
                if ($event->machineStateTime->machineState->is_quality_relevant) {
                    $this->createQualiEvent($event->machine, QualiEventType::MACHINE_STATE_QUALITY_RELEVANT);
                }
            } elseif ($event instanceof MachineShiftStarted) {
                Log::info('EVENT::MachineShiftStarted has just called & listened by QualiVisuEventListener.');
            } elseif ($event instanceof HandlingUnitCreated) {
                if ($event->handlingUnit->packaging_instruction_id) {
                    $this->createQualiEvent($event->machine, QualiEventType::HANDLING_UNIT_CREATED, $event->operation);

                    foreach ($event->operation?->prodInspectionOperations()->where('frequency', ProdInspectionOperationFrequency::HANDLING_UNIT_CREATED)->get() as $prodInspectionOperation) {
                        $prodInspectionOperation->createInspectionPoint();
                    }
                }
            }
        } catch (Exception $exception) {
            Log::error($exception->getMessage());
        }
    }

    /**
     * @param Machine $machine
     * @param QualiEventType $type
     * @param ProdOrderPosOperation|null $operation
     * @return void
     */
    public
    function createQualiEvent(Machine $machine, QualiEventType $type, ?ProdOrderPosOperation $operation = null): void
    {
        QualiEvent::query()->create([
            'machine_id' => $machine->id,
            'prod_order_pos_operation_id' => $operation?->id ?? null,
            'type' => $type,
            'registered_datetime' => now(),
        ]);
    }
}

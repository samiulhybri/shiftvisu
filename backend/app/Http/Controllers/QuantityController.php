<?php

namespace App\Http\Controllers;

use App\DTO\ConsumptionData;
use App\DTO\QuantityData;
use App\Enums\MachineConfirmationType;
use App\Enums\ProdOrderPosOperationHandlingUnitType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\QuantityInputMethod;
use App\Enums\StockOperationType;
use App\Events\ComponentScanned;
use App\Models\ItemStateMachine;
use App\Models\HandlingUnit;
use App\Models\ItemPlant;
use App\Models\Item;
use App\Models\Machine;
use App\Models\MachineCycle;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosOperationBatch;
use App\Models\ProdOrderPosOperationHandlingUnit;
use App\Models\ProdOrderPosOperationQuantity;
use App\Models\ProdOrderPosSerial;
use App\Models\Stock;
use App\Models\StorageLocation;
use App\Models\UnitOfMeasure;
use App\Services\ImportFromBTPService;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class QuantityController extends Controller
{
    protected ImportFromBTPService $apiService;
    protected IdGeneratorController $idGeneratorController;


    public function __construct(ImportFromBTPService $apiService, IdGeneratorController $idGeneratorController)
    {
        $this->apiService = $apiService;
        $this->idGeneratorController = $idGeneratorController;
    }

    public function getQuantity(Machine $machine): JsonResponse
    {
        $response = [];
        try {
            $response['production_orders'] = $this->getProductionOrdersAndOperations($machine);
            $response['confirmation_type'] = $machine->confirmation_type;
            $response['machine_component_serial_number_profiles'] = $machine->machineComponentSerialNumberProfiles;
            $response['item_state'] = $this->getItemStates($machine);
            if ($machine->confirmation_type != MachineConfirmationType::MANUAL()) {
                $response['proposed_quantities'] = $this->proposeIiotQuantities($machine);
            }
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
        return response()->json($response);
    }

    private function getProductionOrdersAndOperations(Machine $machine): array
    {
        $operationTimes = MachineProdOrderPosOperationTime::query()
            ->where('machine_id', $machine->id)
            ->whereNull('end')
            ->whereIn('status', [ProdOrderPosOperationStatus::IN_SETUP(),ProdOrderPosOperationStatus::IN_TEARDOWN(),ProdOrderPosOperationStatus::IN_PRODUCTION() ])
            ->with(['prodOrderPosOperation'])
            ->with(['prodOrderPosOperation.prodOrderPos.prodOrder'])
            ->with(['prodOrderPosOperation.prodOrderPos.prodOrderPosSerial'])
            ->with(['prodOrderPosOperation.prodOrderPos.item.media'])
            ->with(['prodOrderPosOperation.prodOrderPos.item.itemPlants'])
            ->with(['prodOrderPosOperation.machine'])
            ->with(['prodOrderPosOperation.prodOrderPosBomPos'])
            ->with(['prodOrderPosOperation.prodOrderPosBomPos.item'])
            ->with(['prodOrderPosOperation.prodOrderPosBomPos.item.itemPlants'])
            ->with(['prodOrderPosOperation.prodOrderPosOperationQuantities'])
            ->with(['prodOrderPosOperation.prodOrderPosOperationQuantities.canceledBy'])
            ->with(['prodOrderPosOperation.prodOrderPosOperationQuantities.canceledBy'])
            ->orderBy('start', 'ASC')
            ->get();

        $result = [];

        foreach ($operationTimes as $operationTime) {
            $prodOrderPos = $operationTime->prodOrderPosOperation->prodOrderPos;
            $customId = $prodOrderPos->prodOrder->custom_id;
            $pos = $operationTime->prodOrderPosOperation->pos;
            $prodOrderPosOperation = $operationTime->prodOrderPosOperation;
            $item = $prodOrderPos->item;
            $itemPlant = $prodOrderPos->itemPlant();

            $usedSerials = collect($operationTime->prodOrderPosOperation->prodOrderPosOperationQuantities)
                ->whereNotNull('serial')
                ->whereNull('prod_order_pos_operation_quantity_id_canceled')
                ->whereNull('canceledBy')
                ->pluck('serial');

            $availableSerials = $prodOrderPos
                ->prodOrderPosSerial()
                ->where('is_suspended', false)
                ->orderBy('serial', 'ASC')
                ->get()
                ->pluck('serial')
                ->diff($usedSerials)
                ->values();

            $suspendedSerials = $prodOrderPos->prodOrderPosSerial()->where('is_suspended', true)->get()->pluck('serial');

            $result[] = [
                'order_custom_id' => $customId,
                'prod_order_pos_operation_pos' => $pos,
                'prod_order_pos_id' => $prodOrderPos->id,
                'batch' => $prodOrderPos->batch,
                'serials' => $availableSerials,
                'suspendedSerials' => $suspendedSerials,
                'item_id' => $item?->id,
                'prod_order_pos_operation_id' => $prodOrderPosOperation->id,
                'prod_order_pos_operation' => $operationTime->prodOrderPosOperation,
                'prod_order_pos_operation_quantities' => ProdOrderPosOperationQuantity::with(['itemState', 'user', 'prodOrderPosOperation.prodOrderPos.item', 'canceledBy', 'cancellationFor'])
                    ->where('machine_id', $operationTime->machine_id)
                    ->where('prod_order_pos_operation_id', $prodOrderPosOperation->id)
                    ->orderBy('confirmed_datetime', 'DESC')
                    ->get(),
                'item' => $item ? [
                    'id' => $item->id,
                    'custom_id' => $item->custom_id,
                    'name' => $item->name,
                ] : null,
                'proposed_hu_for_quantity' => $this->getProposedHuForQuantity($prodOrderPosOperation),
                'quantity_input_method' => $this->getQuantityInputMethod($machine, $prodOrderPosOperation, $itemPlant),
                'check_stock' => $itemPlant->serialNumberProfile?->check_stock ?? false,
                'used_serials' => $usedSerials,
            ];
        }

        return $result;
    }

    private function getQuantityInputMethod(Machine $machine, ProdOrderPosOperation $operation, ItemPlant $prodItemPlant): QuantityInputMethod
    {
        if ($operation->isLastOperation()) {
            $serialManaged = $prodItemPlant->serial_number_profile_id && ($prodItemPlant->serialNumberProfile->check_stock ||
                    $machine->machineLastSerialNumberProfiles
                        ->where("serial_number_profile_id", $prodItemPlant->serial_number_profile_id)
                        ->count());
            $batchManaged = $machine->requires_batch_management_last && $prodItemPlant->is_batch_managed;
        } else {
            $serialManaged = $prodItemPlant->serial_number_profile_id && $machine->machineMiddleSerialNumberProfiles
                    ->where("serial_number_profile_id", $prodItemPlant->serial_number_profile_id)
                    ->count();
            $batchManaged = $machine->requires_batch_management_middle && $prodItemPlant->is_batch_managed;
        }

        $componentSerialProfileIds = $machine->machineComponentSerialNumberProfiles
            ->pluck('serial_number_profile_id');

        $canSupportMultiSerial = true;

        if ($componentSerialProfileIds) {
            $prodOrderPosBomPoses = $operation->prodOrderPosBomPos;

            foreach ($prodOrderPosBomPoses as $prodOrderBomPos) {
                $itemPlant = $prodOrderBomPos->item->itemPlants
                    ->where('plant_id', $machine->plant_id)
                    ->first();

                if ($itemPlant && $componentSerialProfileIds->contains($itemPlant->serial_number_profile_id)) {
                    $canSupportMultiSerial = false;
                }
            }
        }

        if ($serialManaged && $batchManaged) {
            Log::error('Machine requires both serial and batch management. (Machine ' . $machine->id . ')');
        }
        if (!$serialManaged && !$canSupportMultiSerial) {
            Log::warning('Machine consumes serial managed parts but does not produce serial managed parts. This might be an error. (Machine ' . $machine->id . ')');
        }

        if ($serialManaged) {
            if ($canSupportMultiSerial) {
                return QuantityInputMethod::SERIAL_MULTI();
            } else {
                return QuantityInputMethod::SERIAL_SINGLE();
            }
        } else if ($batchManaged) {
            return QuantityInputMethod::QUANTITY_WITH_BATCH();
        } else {
            return QuantityInputMethod::QUANTITY();
        }
    }


    private function getProposedHuForQuantity(ProdOrderPosOperation $operation): array
    {
        $precedingOperation = $operation->preceedingOperations()->first();

        if (!$precedingOperation) {
            return [];
        }

        $stocks = Stock::query()
            ->where("positionable_type", HandlingUnit::class)
            ->where("stockable_type", ProdOrderPosOperation::class)
            ->where("stockable_id", $precedingOperation->id)
            ->get();

        $handlingUnits = HandlingUnit::query()
            ->whereIn("id", $stocks->pluck("positionable_id"))
            ->get();

        $data = [];

        foreach ($handlingUnits as $handlingUnit) {
            $data[$handlingUnit->id] = [
                "handlingUnit" => $handlingUnit,
                "stocks" => $stocks->where("positionable_id", $handlingUnit->id)->values(),
            ];
        }

        return $data;
    }

    /**
     * @throws Throwable
     * @throws ValidationException
     */
    public function insertQuantity(Machine $machine, Request $request): void
    {
        //Validate input data
        $request->validate([
            'quantity.prod_order_pos_operation_id' => 'required|integer|exists:prod_order_pos_operations,id',
            'quantity.item_state_id' => 'nullable|integer|exists:item_states,id',
            'quantity.quantity' => 'required|numeric',
            'quantity.serials' => 'nullable|array',
            'quantity.serials.*' => 'string',
            'quantity.batch' => 'nullable|string',
            'quantity.check_linked_orders' => 'nullable|boolean',

            'consumptions' => 'nullable|array',
            'consumptions.*.quantity' => 'required|numeric',
            'consumptions.*.serial' => 'nullable|string',
            'consumptions.*.batch' => 'nullable|string',
            'consumptions.*.unit_of_measure_id' => 'nullable|integer|exists:unit_of_measures,id',
            'consumptions.*.storage_location_id' => 'nullable|integer|exists:storage_locations,id',
            'consumptions.*.handling_unit_id' => 'nullable|integer|exists:handling_units,id',
            'consumptions.*.item_state_id' => 'nullable|integer|exists:item_states,id',
            'consumptions.*.item_plant_id' => 'nullable|integer|exists:item_plants,id',
            'consumptions.*.warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'consumptions.*.storage_bin_id' => 'nullable|integer|exists:storage_bins,id',
            'consumptions.*.production_supply_area_id' => 'nullable|integer|exists:production_supply_areas,id',

            'last_proposed_id' => "nullable|integer|exists:machine_cycles,id",
            'user_id' => "nullable|integer|exists:users,id",
        ]);

        $quantityData = QuantityData::fromArray($request->input('quantity'));
        $consumptionData = array_map(
            fn($item) => ConsumptionData::fromArray($item),
            $request->input('consumptions', [])
        );
        $userId = $request->input('user_id', auth()->id());
        $lastProposedId = $request->input('last_proposed_id');
        $machine->insertQuantity($quantityData, $userId, $consumptionData, $lastProposedId);
    }

    private function getItemStates(Machine $machine)
    {
        return ItemStateMachine::with('itemState')
            ->where('machine_id', $machine->id)
            ->get()
            ->map(function ($itemStateMachine) {
                return [
                    'id' => $itemStateMachine->item_state_id,
                    'name' => $itemStateMachine->itemState->name,
                    'item_state_type' => $itemStateMachine->itemState->item_state_type,
                ];
            });
    }

    private function proposeIiotQuantities(Machine $machine): array
    {
        $dbResults = DB::select(
            "
            SELECT
                c.type,
                SUM(c.quantity * t.cavity) as sum,
                MAX(c.id) as last_id,
                t.prod_order_pos_operation_id,
                c.serial
            FROM machine_cycles c
            JOIN machine_prod_order_pos_operation_times t ON
                c.machine_id = t.machine_id AND
                (
                c.registered_datetime >= t.start AND (c.registered_datetime <= t.end OR t.end IS NULL) AND
                (c.prod_order_pos_operation_id = t.prod_order_pos_operation_id OR c.prod_order_pos_operation_id IS NULL)
                )
            WHERE c.machine_id = ?
                AND c.confirmed_datetime IS NULL
            GROUP BY c.type, t.prod_order_pos_operation_id, c.serial",
            [
                $machine->id
            ]
        );

        $res = [];

        foreach ($dbResults as $dbResult) {
            $res[] = [
                "type" => $dbResult->type,
                "sum" => floatval($dbResult->sum),
                "last_id" => $dbResult->last_id,
                "prod_order_pos_operation_id" => $dbResult->prod_order_pos_operation_id,
                "serial" => $dbResult->serial,
            ];
        }

        return $res;
    }

    public function resetMachineCycles(Machine $machine, Request $request): void
    {
        $operationId = $request->input('operation_id');
        $lastId = $request->input('last_proposed_id');

        $machine->confirmMachineCycles($operationId, $lastId, []);
    }

    public function proposedIiotQuantitiesDetails(Machine $machine, Request $request): Collection
    {
        $operations = $request->json('operations');
        $lastId = $request->input('last_id');
        $type = $request->input('type');
        $skip = $request->input('skip');
        $take = $request->input('take');

        return MachineCycle::query()
            ->select("machine_cycles.registered_datetime", "machine_cycles.quantity", "t.cavity", "machine_cycles.serial", "machine_cycles.batch")
            ->distinct()
            ->where('machine_cycles.machine_id', $machine->id)
            ->whereIn('t.prod_order_pos_operation_id', $operations)
            ->where('machine_cycles.id', '<=', $lastId)
            ->where('machine_cycles.type', $type)
            ->whereNull('machine_cycles.confirmed_datetime')
            ->join('machine_prod_order_pos_operation_times as t', function ($join) {
                $join->on('machine_cycles.machine_id', '=', 't.machine_id')
                    ->whereColumn('machine_cycles.registered_datetime', '>=', 't.start')
                    ->where(function ($query) {
                        $query->whereColumn('machine_cycles.registered_datetime', '<=', 't.end')
                            ->orWhereNull('t.end');
                    })
                    ->where(function ($query) {
                        $query->whereColumn('machine_cycles.prod_order_pos_operation_id', '=', 't.prod_order_pos_operation_id')
                            ->orWhereNull('machine_cycles.prod_order_pos_operation_id');
                    });
            })
            ->orderBy('machine_cycles.registered_datetime', 'ASC')
            ->skip($skip)
            ->take($take)
            ->get();
    }

    public function proposeConsumptionWithData(Machine $machine, ProdOrderPosOperation $operation, Request $request)
    {
        $quantity = $request->get('quantity');
        $result = $this->proposeConsumption($machine, $operation, $quantity);

        foreach ($result as $consumption) {
            $itemPlant = ItemPlant::query()->find($consumption->item_plant_id);
            $item = $itemPlant->item;

            $consumption->sort_order = $item?->itemGroup?->sort_order;
            $consumption->item_id_custom = $item->custom_id;
            $consumption->item_name = $item->name;
            $consumption->item_is_batch_managed = $itemPlant->is_batch_managed;
            $consumption->item_is_serial_managed = ($machine->machineComponentSerialNumberProfiles->where('serial_number_profile_id', $itemPlant->serial_number_profile_id)->first() ?? null) != null;
            $consumption->handling_unit_id_custom = $consumption->handling_unit_id ?
                HandlingUnit::query()->find($consumption->handling_unit_id)->custom_id :
                null;
            $consumption->storage_location_id_custom = $consumption->storage_location_id ?
                StorageLocation::query()->find($consumption->storage_location_id)->custom_id :
                null;
            $consumption->unit_of_measure_id_custom = $consumption->unit_of_measure_id ?
                UnitOfMeasure::query()->find($consumption->unit_of_measure_id)->custom_id :
                null;
        }

        return collect($result)->sortBy(function ($consumption) {
            return $consumption->sort_order ?? PHP_INT_MAX;
        })->values();
    }

    private function proposeConsumption(Machine $machine, ProdOrderPosOperation $operation, float $quantity)
    {
        [$arr, $autoPostFromErp] = $operation->proposeConsumptionData($quantity, $machine);

        collect($arr)->sortBy(
            function (ConsumptionData $consumption) use ($machine) {
                $itemPlant = ItemPlant::find($consumption->item_plant_id);
                if (($machine->machineComponentSerialNumberProfiles->where('serial_number_profile_id', $itemPlant->serial_number_profile_id)->first() ?? null) != null) {
                    return 0;
                } else if ($itemPlant->is_batch_managed) {
                    return 1;
                } else {
                    return 2;
                }
            }
        );

        return $arr;
    }

    public function scanHandlingUnitForQuantity(Request $request): JsonResponse
    {

        //Validate input data
        $request->validate([
            'custom_id' => 'required|array',
            'prodOrderPosOperation_id' => 'nullable|integer|exists:prod_order_pos_operations,id',
            'machine_id' => 'required|integer|exists:machines,id',
        ]);

        DB::beginTransaction();

        try {
            $scannedValues = $request->custom_id;
            $prodOrderPosOperationId = $request->prodOrderPosOperation_id;

            foreach ($scannedValues as $scannedValue) {
                $handlingUnit = HandlingUnit::query()->where('custom_id', ltrim($scannedValue, '0'))->first();

                $operation = null;
    
                $machine = Machine::query()->findOrFail( $request->get('machine_id'));
                if ($prodOrderPosOperationId) {
                    $operation = ProdOrderPosOperation::query()->find($prodOrderPosOperationId);
                }
                event(new ComponentScanned($machine, $operation ?? null));
    
                ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();
    
                if ($handlingUnit) {
                    $isExist = ProdOrderPosOperationHandlingUnit::where('id', $handlingUnit->id)->where('machine_id', $machine->id)->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())->first();
    
                    if($isExist){
                        return response()->json(['type' => 'EXISTS'], 409);
                    }
    
                    // Create ProdOrderPosOperationHandlingUnit
                    ProdOrderPosOperationHandlingUnit::query()->create([
                        'prod_order_pos_operation_id' => $prodOrderPosOperationId,
                        'handling_unit_id' => $handlingUnit->id,
                        'machine_id' => $machine->id,
                        'type' => ProdOrderPosOperationHandlingUnitType::CONSUMPTION()
                    ]);
    
                    // Check stock in PSA
                    $isStockalreadyInPSA = Stock::query()->where('stockable_id', $handlingUnit->id)
                        ->where('stockable_type', HandlingUnit::class)
                        ->where('positionable_id', $positionableId)
                        ->where('positionable_type', $positionableType)
                        ->exists();
    
                    if (!$isStockalreadyInPSA) {
                        $inputs = collect();
                        $outputs = collect();
                        foreach (Stock::query()->where('stockable_type', HandlingUnit::class)->where('stockable_id', $handlingUnit->id)->get() as $stock) {
                            $inputs->push([
                                'stockable_type' => $stock['stockable_type'],
                                'stockable_id' => $stock['stockable_id'],
                                'positionable_type' => $stock['positionable_type'],
                                'positionable_id' => $stock['positionable_id'],
                                'item_state_id' => $stock['item_state_id'],
                                'quantity' => -$stock['quantity'],
                                'serial' => $stock['serial'],
                                'batch' => $stock['batch'],
                            ]);
                            $outputs->push([
                                'stockable_type' => $stock['stockable_type'],
                                'stockable_id' => $stock['stockable_id'],
                                'positionable_type' => $positionableType,
                                'positionable_id' => $positionableId,
                                'item_state_id' => $stock['item_state_id'],
                                'quantity' => $stock['quantity'],
                                'serial' => $stock['serial'],
                                'batch' => $stock['batch'],
                            ]);
                        }
                        StockController::moveStocks($inputs->toArray(), $outputs->toArray(), StockOperationType::PSA_SCAN(), $operation);
                    }
    
                } else {
                    $isExist = ProdOrderPosOperationBatch::where('batch', $scannedValue)->where('machine_id', $machine->id)->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())->first();
    
                    if($isExist){
                        return response()->json(['type' => 'EXISTS'], 409);
                    }
    
                    // Create ProdOrderPosOperationBatch
                    ProdOrderPosOperationBatch::query()->updateOrCreate(
                        [
                            'batch' => $scannedValue,
                            'prod_order_pos_operation_id' => $prodOrderPosOperationId,
                        ],
                        [
                            'machine_id' => $machine->id,
                            'type' => ProdOrderPosOperationHandlingUnitType::CONSUMPTION()
                        ]
                    );
    
                    // Check stock in PSA
                    $isStockalreadyInPSA = Stock::query()->where('batch', $scannedValue)
                        ->where('positionable_id', $positionableId)
                        ->where('positionable_type', $positionableType)
                        ->exists();
    
                    if (!$isStockalreadyInPSA) {
                        $inputs = collect();
                        $outputs = collect();
                        foreach (Stock::query()->where('batch', $scannedValue)->where('quantity', '>', 0)->get() as $stock) {
                            $inputs->push([
                                'stockable_type' => $stock['stockable_type'],
                                'stockable_id' => $stock['stockable_id'],
                                'positionable_type' => $stock['positionable_type'],
                                'positionable_id' => $stock['positionable_id'],
                                'item_state_id' => $stock['item_state_id'],
                                'quantity' => -$stock['quantity'],
                                'serial' => $stock['serial'],
                                'batch' => $stock['batch'],
                            ]);
                            $outputs->push([
                                'stockable_type' => $stock['stockable_type'],
                                'stockable_id' => $stock['stockable_id'],
                                'positionable_type' => $positionableType,
                                'positionable_id' => $positionableId,
                                'item_state_id' => $stock['item_state_id'],
                                'quantity' => $stock['quantity'],
                                'serial' => $stock['serial'],
                                'batch' => $stock['batch'],
                            ]);
                        }
                        StockController::moveStocks($inputs->toArray(), $outputs->toArray(), StockOperationType::PSA_SCAN(), $operation);
                    }
                }  
            }

            DB::commit();
            return response()->json(['success' => true], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function maximumQuantity($operationId, $itemId): JsonResponse
    {
        try {
            # find packagingInstruction
            $packagingInstruction = MachineProdOrderPosOperationTime::with([
                'packagingInstruction.packagingInstructionPos' => function ($query) use ($itemId) {
                    return $query->where('is_container', 0)
                        ->where('packable_type', Item::class)
                        ->where('packable_id', $itemId);
                }
            ])
                ->where('prod_order_pos_operation_id', $operationId)
                ->whereNull('end')
                ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                ->first();
            $isPackagingInstruction = $packagingInstruction?->packagingInstruction?->packagingInstructionPos->count() > 0;
            $targetQuantity = $packagingInstruction?->packagingInstruction?->packagingInstructionPos[0]->target_quantity ?? 0;

            $handlingunitId = ProdOrderPosOperationHandlingUnit::query()
                ->join('handling_units', 'handling_units.id', '=', 'prod_order_pos_operation_handling_units.handling_unit_id')
                ->where('handling_units.packaging_instruction_id', $packagingInstruction?->packagingInstruction?->id)
                ->where('prod_order_pos_operation_id', $operationId)
                ->first()?->id ?? null;

            $stock = 0;
            if ($handlingunitId) {
                $stock = Stock::query()->where('positionable_type', HandlingUnit::class)
                    ->where('positionable_id', $handlingunitId)
                    ->sum('quantity') ?? 0;
            }
        } catch (Exception) {
            $isPackagingInstruction = false;
            $targetQuantity = 0;
            $stock = 0;
        }
        return response()->json(compact('isPackagingInstruction', 'targetQuantity', 'stock'));
    }

    /**
     * @throws ConnectionException
     */
    public function getQuaitityFromv10($prodOrderPosOperationIds): JsonResponse
    {
        if(env("APP_ENV") == "local") {
            return response()->json([
            ]);
        }
        
        $prodOrderPosOperationIds = explode(',', $prodOrderPosOperationIds);


        // Then proceed to run your query
        $reqData = ProdOrderPosOperation::with('prodOrderPos.prodOrder', 'machine')
            ->whereIn('id', $prodOrderPosOperationIds)
            ->get()->map(function ($prodOrderPosOperation) {
                return [
                    "bde_nr" => $prodOrderPosOperation->machine->custom_id,
                    "auf_nr" => "{$prodOrderPosOperation->prodOrderPos->prodOrder->custom_id}|$prodOrderPosOperation->pos",
                    "id" => $prodOrderPosOperation->id
                ];
            });

        $response = Http::withoutVerifying()->get(getenv("APP_URL") . "/shopfloor/php/shopfloor_services.php?service=getQuantities&orders=" . urlencode(json_encode($reqData)));

        if ($response->successful()) {
            $operationQuantities = $response->json();

            $resData = collect($operationQuantities)->map(function ($item) use ($reqData) {
                return [
                    'quantity' => $item['quantity'][0]['gut'] ?? 0,
                    'id' => $reqData->first(function ($item2) use ($item) {
                        return $item['auf_nr'] === $item2['auf_nr'];
                    })['id']
                ];
            });
            return response()->json($resData);
        }

        return response()->json([
            "status" => "unable to get the data"
        ]);

    }

    public function suspendSerials(Request $request): JsonResponse
    {
        try {
            $posId = $request->prodOrderPosId;
            $serials = $request->serials;

            // Validate input
            if (empty($posId) || empty($serials) || !is_array($serials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid input data. Ensure prodOrderPosId and serials are provided and valid.',
                ], 400);
            }

            $serialValues = ProdOrderPosSerial::query()
                ->where('prod_order_pos_id', $posId)
                ->whereIn('serial', $serials)
                ->update(['is_suspended' => true]);

            return response()->json([
                'success' => true,
                'updated_count' => $serialValues,
            ]);
        } catch (Exception $e) {
            // Handle unexpected errors
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while suspending serials.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

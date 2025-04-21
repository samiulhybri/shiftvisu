<?php

namespace App\Console\Commands;

use App\Enums\ComponentPreparationState;
use App\Enums\MachineQualificationImportType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\PlanVisuImport;
use App\Models\Classification;
use App\Models\Equipment;
use App\Models\Item;
use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\OperationControlProfile;
use App\Models\Plant;
use App\Models\ProdInspectionOperation;
use App\Models\ProdInspectionOperationResource;
use App\Models\ProdLot;
use App\Models\ProdOrderPosOperationAltMachine;
use App\Models\ProdOrderPosOperationResource;
use App\Models\Qualification;
use App\Models\StorageBin;
use App\Models\StorageLocation;
use App\Models\UserGroup;
use App\Models\ResourceGroup;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosBomPos;
use App\Models\SalesOrder;
use App\Models\Tool;
use App\Models\DataImport;
use App\Models\ProdOrderPosSerial;
use App\Models\UnitOfMeasure;
use App\Models\Warehouse;
use App\Services\CapacityPlanService;
use App\Services\ImportFromBTPService;
use App\Services\ItemService;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProdOrderDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:prodorder {custom_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected ImportFromBTPService $apiService;
    protected CapacityPlanService $capacityPlanService;
    protected ItemService $itemService;

    public function __construct(ImportFromBTPService $apiService, CapacityPlanService $capacityPlanService, ItemService $itemService)
    {
        parent::__construct();

        $this->apiService = $apiService;
        $this->capacityPlanService = $capacityPlanService;
        $this->itemService = $itemService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $onlyCustomId = $this->argument('custom_id');

        $ds = new ExternalDataSourceController();

        $items = Item::query()->select("id", "custom_id")->lazyById()->pluck("id", "custom_id")->collect();

        $toolEquipments = Equipment::query()->whereNull('item_id')->select("id", "custom_id")->lazyById()->pluck("id", "custom_id")->collect();

        $machines = Machine::all([
            'id',
            'custom_id',
            'qualification_import_type',
            'default_qualification_hours',
            'default_qualification_operations'
        ])->mapWithKeys(function ($machine) {
            return [$machine->custom_id => $machine];
        })->collect();

        $machine_groups = MachineGroup::with('machines')
            ->get()
            ->mapWithKeys(function ($machineGroup) {
                return [
                    $machineGroup->custom_id => [
                        'id' => $machineGroup->id,
                        'default_te' => $machineGroup->default_te,
                        'machine_id' => $machineGroup->machines->first()->id ?? null,
                    ],
                ];
            })->collect();

        $userGroups = UserGroup::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $resourceGroups = ResourceGroup::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $tools = Tool::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $sop = SalesOrder::with('salesOrderPos')->get()->mapWithKeys(function ($salesOrder) {
            return [$salesOrder->custom_id => $salesOrder->salesOrderPos->pluck('id', 'pos')->collect(),];
        })->collect();

        $units = UnitOfMeasure::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $plants = Plant::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $storageLocations = StorageLocation::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $storageBins = StorageBin::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $warehouses = Warehouse::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $operationControlProfiles = OperationControlProfile::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $prodLots = ProdLot::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        $xmlIds = [];

        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        $importedOrderIds = [];
        $importedOperations = [];

        while ($orderChunk = $ds->prodOrderDtos($skip, $take, $onlyCustomId)) {
            $skip += $take;
            $xmlIds = collect();
            foreach ($orderChunk as $prodOrderDto) {
                if ($onlyCustomId && !str_contains($prodOrderDto->custom_id, $onlyCustomId)) {
                    continue;
                }

                if (isset($prodOrderDto->xml_id)) {
                    $xmlIds->push($prodOrderDto->xml_id);
                }

                $prodOrder = ProdOrder::where(
                    'custom_id',
                    $prodOrderDto->custom_id
                )->first();

                if (!$prodOrder) {
                    if ($prodOrderDto->update_only) {
                        continue;
                    }

                    $prodOrder = new ProdOrder();
                    $prodOrder->custom_id = $prodOrderDto->custom_id;
                }

                $prodOrder->assembly = $prodOrderDto->assembly ?? $prodOrder->assembly;
                $prodOrder->document_date = $prodOrderDto->document_date ?? $prodOrder->document_date;
                $prodOrder->production_register = $prodOrderDto->production_register ?? $prodOrder->production_register;
                $prodOrder->order_type = $prodOrderDto->order_type;

                if (!$prodOrderDto->plant_id_production_custom) {
                    $prodOrder->plant_id_production = $plants->first();
                } else if ($plants->has($prodOrderDto->plant_id_production_custom)) {
                    $prodOrder->plant_id_production = $plants->get($prodOrderDto->plant_id_production_custom);
                } else {
                    continue;
                }

                if (!$prodOrderDto->plant_id_custom) {
                    $prodOrder->plant_id = $plants->first();
                } else if ($plants->has($prodOrderDto->plant_id_custom)) {
                    $prodOrder->plant_id = $plants->get($prodOrderDto->plant_id_custom);
                }

                $prodOrder->is_closed = false;
                $prodOrder->save();

                $importedOrderIds[] = $prodOrder->id;

                foreach ($prodOrderDto->classifications as $classificationDto) {
                    Classification::updateOrCreate(
                        [
                            "model_type" => ProdOrder::class,
                            "model_id" => $prodOrder->id,
                            "class" => $classificationDto->class,
                            "attribute" => $classificationDto->attribute,
                        ],
                        [
                            "value_string" => $classificationDto->value_string,
                            "value_double" => $classificationDto->value_double,
                        ]
                    );
                }

                $importedPosIds = [];
                foreach ($prodOrderDto->positions as $prodOrderPosDto) {
                    $prodOrderPos = ProdOrderPos::where(
                        'prod_order_id',
                        $prodOrder->id
                    )->where(
                        'pos',
                        $prodOrderPosDto->pos
                    )->first();

                    if (!$prodOrderPos) {
                        $prodOrderPos = new ProdOrderPos();
                        $prodOrderPos->pos = $prodOrderPosDto->pos;
                        $prodOrderPos->prod_order_id = $prodOrder->id;
                    }
                    $releaseDate = $prodOrderPos->release_date;
                    $prodOrderPos->item_id = $items->get($prodOrderPosDto->item_id_custom);
                    //In benacchio we need to import orders without item (for example for cleaning)
                    if ($prodOrderPos->item_id == null && env('EXTERNAL_DS_TARGET') != 'benacchio') {
                        Log::warning('Item not found!', ["custom id" => $prodOrderPosDto->item_id_custom]);
                        continue;
                    }
                    $prodOrderPos->raw_material = $prodOrderPosDto->raw_material ?? $prodOrderPos->raw_material;
                    $prodOrderPos->release_date = $prodOrderPosDto->release_date ?? $prodOrderPos->release_date;
                    $prodOrderPos->due_date = $prodOrderPosDto->due_date ?? $prodOrderPos->due_date;
                    $prodOrderPos->status_erp = $prodOrderPosDto->status;
                    $hasOperationInProduction = $prodOrderPos->prodOrderPosOperations()
                        ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                        ->exists();

                    if (
                        !$hasOperationInProduction &&
                        (
                            $prodOrderPos->status_erp == ProdOrderPosStatus::DELETED() ||
                            $prodOrderPos->status_erp == ProdOrderPosStatus::CLOSED()
                        )
                    ) {
                        $prodOrderPos->status = $prodOrderPos->status_erp;
                    }else if ($prodOrderPos->status != ProdOrderPosStatus::CLOSED()) {
                        $prodOrderPos->status = $prodOrderPos->status_erp;
                        $prodOrderPos->status_plan = null;
                    } else if ($prodOrderPos->status != ProdOrderPosStatus::IN_PRODUCTION()) {
                        $prodOrderPos->status = $prodOrderPos->status_plan ?? $prodOrderPos->status_erp;
                    } 

                    $prodOrderPos->sales_order_pos_id = $sop->get($prodOrderPosDto->sales_order_id_custom)?->get($prodOrderPosDto->sales_order_pos_custom);

                    $prodOrderPos->quantity = $prodOrderPosDto->quantity;
                    $prodOrderPos->start = $prodOrderPosDto->start;
                    $prodOrderPos->end = $prodOrderPosDto->end;

                    $prodOrderPos->unit_of_measure_id = $units->get($prodOrderPosDto->unit_of_measure_id_custom);
                    $prodOrderPos->storage_location_id = $storageLocations->get($prodOrderPosDto->storage_location_id_custom);
                    $prodOrderPos->notes = $prodOrderPosDto->notes;
                    $prodOrderPos->batch = $prodOrderPosDto->batch;

                    $prodOrderPos->save();

                    $importedPosIds[] = $prodOrderPos->id;

                    foreach ($prodOrderPosDto->classifications as $classificationDto) {
                        Classification::updateOrCreate(
                            [
                                "model_type" => ProdOrderPos::class,
                                "model_id" => $prodOrderPos->id,
                                "class" => $classificationDto->class,
                                "attribute" => $classificationDto->attribute,
                            ],
                            [
                                "value_string" => $classificationDto->value_string,
                                "value_double" => $classificationDto->value_double,
                            ]
                        );
                    }

                    $serials = [];

                    foreach ($prodOrderPosDto->serials as $serial) {
                        $serials[] = [
                            'prod_order_pos_id' => $prodOrderPos->id,
                            'serial' => $serial,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }

                    // Bulk upsert serials
                    if (!empty($serials)) {
                        ProdOrderPosSerial::query()->upsert($serials, ['prod_order_pos_id', 'serial'], ['updated_at']);
                    }

                    // Delete obsolete serials
                    ProdOrderPosSerial::query()
                        ->where('prod_order_pos_id', $prodOrderPos->id)
                        ->whereNotIn('serial', $prodOrderPosDto->serials)
                        ->delete();

                    $opPosToId = collect();

                    $hasInProgressOperations = false;

                    $end_date = null;
                    foreach ($prodOrderPosDto->operations as $operationDto) {
                        $operation = ProdOrderPosOperation::where(
                            'prod_order_pos_id',
                            $prodOrderPos->id
                        )->where(
                            'pos',
                            $operationDto->pos
                        )->first();

                        if (!$operation) {
                            $operation = new ProdOrderPosOperation();
                            $operation->pos = $operationDto->pos;
                            $operation->prod_order_pos_id = $prodOrderPos->id;
                        }

                        $operation->erp_machine_id = $machines->get($operationDto->machine_id_custom)?->id;

                        if (env('EXTERNAL_DS_TARGET') == 'sct') {
                            $operation->machine_id = $operation->erp_machine_id;
                        } else {
                            $operation->machine_id = $operation->plan_machine_id ?? $operation->erp_machine_id;
                        }

                        $operation->note = $operationDto->note;
                        $operation->has_labels_prepared = $operationDto->has_labels_prepared;
                        $operation->name = $operationDto->name;

                        $inProgressOperation = $operation->prodOrderPosOperationTimes()
                            ->whereNull("end")->first();

                        $operation->status_erp = $operationDto->status;

                        if ($operation->status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                            $operation->status = $operation->status_plan ?? $operation->status_erp;
                            if (
                                $operation->status_erp == ProdOrderPosOperationStatus::DELETED() ||
                                $operation->status_erp == ProdOrderPosOperationStatus::CLOSED()
                            ) {
                                $operation->status = $operation->status_erp;
                            }

                            if($operation->status != ProdOrderPosOperationStatus::CLOSED() ) {
                                $operation->status = $operation->status_erp;
                                $operation->status_plan = null;
                            }

                            // Set status from pos
                            if (
                                $prodOrderPos->status == ProdOrderPosStatus::CLOSED()
                                && $operation->status != ProdOrderPosOperationStatus::DELETED()
                            ) {
                                $operation->status = ProdOrderPosOperationStatus::CLOSED();
                            } else if ($prodOrderPos->status == ProdOrderPosStatus::DELETED()) {
                                $operation->status = ProdOrderPosOperationStatus::DELETED();
                            }
                        }
                        if (
                            $inProgressOperation &&
                            (
                                $operation->status == ProdOrderPosOperationStatus::DELETED() ||
                                $operation->status == ProdOrderPosOperationStatus::CLOSED()
                            )
                        ) {
                            $hasInProgressOperations = true;
                            $operation->status = $inProgressOperation->status;
                        }

                        if (env('EXTERNAL_DS_TARGET') == 'sct') {
                            if (
                                $operation->status_erp == ProdOrderPosOperationStatus::DELETED() ||
                                $operation->status_erp == ProdOrderPosOperationStatus::CLOSED()
                            ) {
                                $operation->status = $operation->status_erp;
                            } else {
                                $operation->status = $operation->status_plan ?? $operation->status_erp;
                            }
                        }

                        //SKIP to next operation if it was already closed
                        if (($operation->status == ProdOrderPosOperationStatus::CLOSED() || $operation->status == ProdOrderPosOperationStatus::DELETED()) &&
                            ($operation->getOriginal('status') == ProdOrderPosOperationStatus::CLOSED() || $operation->getOriginal('status') == ProdOrderPosOperationStatus::DELETED())) {
                            $opPosToId->put($operationDto->pos, $operation->id);
                            continue;
                        }

                        $operation->erp_te = $operationDto->te;
                        $operation->registered_quantity = $operationDto->registered_quantity;
                        $operation->operator_usage_factor = $operationDto->operator_usage_factor;
                        $operation->user_group_id = $userGroups->get($operationDto->user_group_id_custom);
                        $operation->operation_code_erp = $operationDto->operation_code;
                        $operation->send_ahead_quantity = $operationDto->send_ahead_quantity ?? $prodOrderPos->quantity;
                        $operation->transfer_time = $operationDto->transfer_time;

                        $operation->erp_component_availability = $operationDto->component_availability;
                        $operation->component_availability = $operation->plan_component_availability ?? $operation->erp_component_availability;

                        $operation->resource_group_id_erp = $resourceGroups->get($operationDto->resource_group_id_custom);
                        $operation->tool_reference_nr_erp = $operationDto->tool_reference_nr ?? null;

                        $operation->erp_tr = $operationDto->tr;
                        $operation->tr = $operation->plan_tr ?? $operation->erp_tr;

                        $operation->erp_teardown_time = $operationDto->teardown_time;
                        $operation->teardown_time = $operation->plan_teardown_time ?? $operation->erp_teardown_time;

                        $operation->erp_cavity = $operationDto->cavity ? $operationDto->cavity : 1;
                        $operation->cavity = $operation->plan_cavity ?? $operation->erp_cavity;

                        $machine_group = $machine_groups->get($operationDto->machine_group_id_custom);
                        if ($machine_group) {
                            $operation->machine_group_id = $machine_group['id'];

                            if (isset($machine_group['default_te'])) {
                                $operation->erp_te = $machine_group['default_te'];
                            }
                        }

                        $operation->tool_id = $tools->get($operationDto->tool_id_custom);
                        $operation->tool_insert_id = $tools->get($operationDto->tool_insert_id_custom);

                        $operation->item_id_tool = $items->get($operationDto->tool_id_custom);
                        $operation->item_id_tool_insert = $items->get($operationDto->tool_insert_id_custom);

                        $operation->operation_code = $operation->operation_code_plan ?? $operation->operation_code_erp;
                        $operation->resource_group_id = $operation->resource_group_id_plan ?? $operation->resource_group_id_erp;
                        $operation->te = $operation->plan_te ?? $operation->erp_te ?? 0;
                        if (env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            $cavity = $operation->cavity ?? 1;
                            $duration = (($operation->te / $cavity) * $prodOrderPos->quantity) + $operation->tr + $operation->teardown_time ?? 0;
                            $operation->erp_start = $end_date ?? $this->capacityPlanService->calculateEndTime($prodOrderPos->release_date, $duration, $operation->machine_id)['start'];
                        } elseif (env('EXTERNAL_DS_TARGET') == 'sct') {
                            $operation->erp_start = $end_date ?? $operationDto->start;
                        } else {
                            $operation->erp_start = $operationDto->start;
                        }

                        // Calculate End Time
                        if (env('EXTERNAL_DS_TARGET') == 'vop' || env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            if (isset($operation->erp_start) && isset($operation->machine_id)) {
                                $cavity = $operation->cavity ?? 1;
                                $duration = (($operation->te / $cavity) * $prodOrderPos->quantity) + $operation->tr + $operation->teardown_time ?? 0;
                                $operation->erp_end = $end_date = $this->capacityPlanService->calculateEndTime($operation->erp_start, $duration, $operation->machine_id)['end'];
                            } else {
                                $operation->erp_end = $operation->erp_start;
                            }
                        } elseif (env('EXTERNAL_DS_TARGET') == 'sct') {
                            $cavity = $operation->cavity ?? 1;
                            $duration = (($operation->te / $cavity) * $prodOrderPos->quantity) + $operation->tr;
                            $operation->erp_end = $end_date = $this->capacityPlanService->calculateEndTime($operation->erp_start, $duration, $operation->machine_id)['end'];
                        } else {
                            $operation->erp_end = $operationDto->end;
                        }

                        if( env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            if($releaseDate == $prodOrderPos->release_date){
                                $operation->start = $operation->plan_start ?? $operation->erp_start;
                                $operation->end = $operation->plan_end ?? $operation->erp_end;
                            }else{
                                $operation->start =  $operation->erp_start;
                                $operation->end = $operation->erp_end;
                            }
                            
                        }else {
                            $operation->start = $operation->plan_start ?? $operation->erp_start;
                            $operation->end = $operation->plan_end ?? $operation->erp_end;
                        }
                        $operation->plant_id_production = $plants->get($operationDto->plant_id_production_custom);

                        if ($operationDto->operation_control_profile_id_custom && !$operationControlProfiles->has($operationDto->operation_control_profile_id_custom)) {
                            $profile = new OperationControlProfile();
                            $profile->custom_id = $operationDto->operation_control_profile_id_custom;
                            $profile->save();
                            $operationControlProfiles->put($operationDto->operation_control_profile_id_custom, $profile->id);
                        }

                        $operation->operation_control_profile_id = $operationControlProfiles->get($operationDto->operation_control_profile_id_custom);

                        if ($operationDto->prod_lot_id_custom && !$prodLots->has($operationDto->prod_lot_id_custom)) {
                            $lot = new ProdLot();
                            $lot->custom_id = $operationDto->prod_lot_id_custom;
                            $lot->save();
                            $prodLots->put($operationDto->prod_lot_id_custom, $lot->id);
                        }

                        $operation->prod_lot_id = $prodLots->get($operationDto->prod_lot_id_custom);
                        $operation->unit_of_measure_id = $units->get($operationDto->unit_of_measure_id_custom);
                        $operation->quantity = $operationDto->quantity ?? $prodOrderPosDto->quantity;

                        if ($operation->status == ProdOrderPosOperationStatus::CLOSED() || $operation->status == ProdOrderPosOperationStatus::DELETED())
                            $operation->operation_close_date_v10 = $operation->operation_close_date_v10 ?? now();


                        $operation->save();

                        $qualificationImportType = MachineQualificationImportType::tryFrom($machines->get($operationDto->machine_id_custom)?->qualification_import_type) ?? MachineQualificationImportType::NONE;
                        $itemId = null;
                        $machineId = null;
                        $operationCode = null;

                        if ($qualificationImportType === MachineQualificationImportType::MACHINE_ITEM_QUALIFICATION) {
                            $machineId = $machines->get($operationDto->machine_id_custom)?->id;
                            $itemId = $items->get($prodOrderPosDto->item_id_custom);
                            if(!$itemId) {
                                $qualificationImportType = MachineQualificationImportType::NONE;
                            }
                        }

                        if ($qualificationImportType !== MachineQualificationImportType::NONE) {
                            $now = now();
                            Qualification::query()->firstOrCreate(
                                [
                                    'item_id' => $itemId,
                                    'machine_id' => $machineId,
                                    'operation_code' => $operationCode,
                                ],
                                [
                                    'min_qualification_hours' => $machines->get($operationDto->machine_id_custom)?->default_qualification_hours,
                                    'min_qualification_operations' => $machines->get($operationDto->machine_id_custom)?->default_qualification_operations,
                                    'created_at' => $now,
                                    'updated_at' => $now,
                                    'is_imported_from_erp' => true
                                ]
                            );
                        }

                        $importedOperations[] = $operation;

                        foreach ($operationDto->classifications as $classificationDto) {
                            Classification::updateOrCreate(
                                [
                                    "model_type" => ProdOrderPosOperation::class,
                                    "model_id" => $operation->id,
                                    "class" => $classificationDto->class,
                                    "attribute" => $classificationDto->attribute,
                                ],
                                [
                                    "value_string" => $classificationDto->value_string,
                                    "value_double" => $classificationDto->value_double,
                                ]
                            );
                        }

                        // Gather existing inspection operations for the current operation
                        $existingInspectionOperations = ProdInspectionOperation::where('prod_order_pos_operation_id', $operation->id)
                            ->pluck('pos') // We only need the 'pos' to compare
                            ->toArray();

                        // Prepare the data for insertion or update
                        $inspectionOperationPositions = [];

                        foreach ($operationDto->inspectionOperations as $inspectionOperationDto) {
                            $inspectionOperationPositions[] = $inspectionOperationDto->pos; // Track the 'pos' for missing check

                            $inspectionOperation = ProdInspectionOperation::query()->updateOrCreate(
                                [
                                    "prod_order_pos_operation_id" => $operation->id,
                                    "pos" => $inspectionOperationDto->pos,
                                ], // Unique keys for conflict resolution
                                [
                                    "frequency" => $inspectionOperationDto->frequency->value,
                                    "is_active" => $inspectionOperationDto->is_active,
                                    "is_blocking" => $inspectionOperationDto->is_blocking,
                                    "name" => $inspectionOperationDto->name,
                                    "internal_id" => $inspectionOperationDto->internal_id,
                                    "interval_cycles" => $inspectionOperationDto->interval_cycles,
                                    "interval_seconds" => $inspectionOperationDto->interval_seconds,
                                ]
                            );

                            ProdInspectionOperationResource::query()
                                ->upsert(
                                    array_map(
                                        fn($resourceDto) => [
                                            "is_active" => $resourceDto->is_active,
                                            "prod_inspection_operation_id" => $inspectionOperation->id,
                                            "pos" => $resourceDto->pos,
                                            "equipment_id" => $toolEquipments->get($resourceDto->equipment_id_custom),
                                            "type" => $resourceDto->type,
                                            "external_id" => $resourceDto->external_id,
                                        ],
                                        $inspectionOperationDto->prodInspectionOperationResourceDtos
                                    ),
                                    ["prod_inspection_operation_id", "pos"],
                                );
                        }


                        // Find missing inspection operations and set 'is_active' to false for those
                        $missingPositions = array_diff($existingInspectionOperations, $inspectionOperationPositions);

                        if ($missingPositions) {
                            ProdInspectionOperation::where('prod_order_pos_operation_id', $operation->id)
                                ->whereIn('pos', $missingPositions)
                                ->update(['is_active' => false]);
                        }

                        $opPosToId->put($operationDto->pos, $operation->id);

                        if (env('EXTERNAL_DS_TARGET') == 'vop') {
                            $altResourcesPos = collect($operationDto->resources)->pluck('pos')->toArray();

                            // Delete alt resources that are not in the ERP list
                            ProdOrderPosOperationResource::where('prod_order_pos_operation_id', $operation->id)
                                ->whereNotIn('pos', $altResourcesPos)
                                ->delete();
                        }

                        ProdOrderPosOperationResource::query()
                            ->upsert(
                                array_map(
                                    fn($resourceDto) => [
                                        "prod_order_pos_operation_id" => $operation->id,
                                        "is_active" => $resourceDto->is_active,
                                        "pos" => $resourceDto->pos,
                                        "item_id_tool" => $items->get($resourceDto->item_id_tool_custom),
                                        "equipment_id" => $toolEquipments->get($resourceDto->equipment_id_custom),
                                        "reference_nr" => $resourceDto->reference_nr,
                                    ],
                                    $operationDto->resources
                                ),
                                ["prod_order_pos_operation_id", "pos"],
                            );

                        if (env('EXTERNAL_DS_TARGET') == 'vop') {
                            $altMachinesPos = collect($operationDto->alt_machines)->pluck('pos')->toArray();

                            // Delete alt machines that are not in the ERP list
                            ProdOrderPosOperationAltMachine::where('prod_order_pos_operation_id', $operation->id)
                                ->whereNotIn('pos', $altMachinesPos)
                                ->delete();
                        }

                        ProdOrderPosOperationAltMachine::query()
                            ->upsert(
                                array_map(
                                    fn($altMachineDto) => [
                                        "prod_order_pos_operation_id" => $operation->id,
                                        "pos" => $altMachineDto->pos,
                                        "machine_id" => $machines->get($altMachineDto->machine_id_custom)?->id ?? null,
                                        "te" => $altMachineDto->te,
                                        "reference_nr" => $altMachineDto->reference_nr,
                                    ],
                                    $operationDto->alt_machines
                                ),
                                ["prod_order_pos_operation_id", "pos"],
                            );
                    }

                    if (
                        $hasInProgressOperations &&
                        (
                            $prodOrderPos->status == ProdOrderPosStatus::DELETED() ||
                            $prodOrderPos->status == ProdOrderPosStatus::CLOSED()
                        )
                    ) {
                        $prodOrderPos->status = ProdOrderPosStatus::IN_PRODUCTION();
                        $prodOrderPos->save();
                    }

                    $importedOperationIds = $opPosToId->values();
                    ProdOrderPosOperation::where('prod_order_pos_id', $prodOrderPos->id)
                        ->whereNotIn('id', $importedOperationIds)
                        ->update([
                            'status' => ProdOrderPosOperationStatus::DELETED(),
                        ]);

                    $data = [];
                    foreach ($prodOrderPosDto->components as $materialDto) {
                        $data[] = [
                            'prod_order_pos_id' => $prodOrderPos->id,
                            'pos' => $materialDto->pos,
                            'quantity_total' => $materialDto->quantity_total,
                            'qty_for_one_parent' => $materialDto->qty_for_one_parent,
                            'item_id' => $items->get($materialDto->item_id_custom) ?? null,
                            'unit_of_measure_id' => $units->get($materialDto->unit_of_measure_id_custom) ?? null,
                            'prod_order_pos_operation_id' => $opPosToId->get($materialDto->prod_order_pos_operation_pos) ?? null,
                            'name' => $materialDto->name,
                            'is_active' => $materialDto->is_active,
                            'is_bulk' => $materialDto->is_bulk,
                            'is_backflush' => $materialDto->is_backflush,
                            'is_quantity_fixed' => $materialDto->is_quantity_fixed,
                            'storage_location_id' => $storageLocations->get($materialDto->storage_location_id_custom) ?? null,
                            'batch' => $materialDto->batch,
                            'item_type' => $materialDto->item_type,
                            'reference_document' => $materialDto->reference_document,
                            'storage_bin_id' => $storageBins->get($materialDto->storage_bin_id_custom) ?? null,
                            'item_number' => $materialDto->item_number,
                            'warehouse_id' => $warehouses->get($materialDto->warehouse_id_custom) ?? null,
                            'warehouse_process_type' => $materialDto->warehouse_process_type,
                            'stock_type' => $materialDto->stock_type,
                            'entitled_to_dispose_party' => $materialDto->entitled_to_dispose_party,
                            'stock_owner' => $materialDto->stock_owner,
                            'component_preparation_state' => $materialDto->component_preparation_state ?? ComponentPreparationState::NOT_PREPARED,
                            'updated_at' => now(), // Required for upsert
                        ];
                    }

                    // Use upsert to avoid multiple queries in a loop
                    ProdOrderPosBomPos::upsert($data, ['prod_order_pos_id', 'pos'], [
                        'quantity_total', 'qty_for_one_parent', 'item_id', 'unit_of_measure_id',
                        'prod_order_pos_operation_id', 'name', 'is_active', 'is_bulk',
                        'is_backflush', 'is_quantity_fixed', 'storage_location_id', 'batch',
                        'item_type', 'reference_document', 'storage_bin_id', 'item_number',
                        'warehouse_id', 'warehouse_process_type', 'stock_type',
                        'entitled_to_dispose_party', 'stock_owner', 'component_preparation_state'
                    ]);

                    $positions = array_column($data, 'pos');

                    // Deactivate ProdOrderPosBomPos records that were NOT in the ERP list
                    ProdOrderPosBomPos::where('prod_order_pos_id', $prodOrderPos->id)
                        ->whereNotIn('pos', $positions)
                        ->update([
                            'is_active' => 0
                        ]);

                    foreach ($prodOrderPosDto->components as $materialDto) {
                        $material = null;
                        if (count($materialDto->classifications)) {
                            $material = ProdOrderPosBomPos::where(
                                'prod_order_pos_id',
                                $prodOrderPos->id
                            )->where(
                                'pos',
                                $materialDto->pos
                            )->first();
                        }
                        foreach ($materialDto->classifications as $classificationDto) {

                            Classification::updateOrCreate(
                                [
                                    "model_type" => ProdOrderPosBomPos::class,
                                    "model_id" => $material->id,
                                    "class" => $classificationDto->class,
                                    "attribute" => $classificationDto->attribute,
                                ],
                                [
                                    "value_string" => $classificationDto->value_string,
                                    "value_double" => $classificationDto->value_double,
                                ]
                            );
                        }
                    }
                }

                $idsToDelete = ProdOrderPos::where('prod_order_id', $prodOrder->id)
                    ->whereNotIn('id', $importedPosIds)
                    ->select('id')
                    ->pluck('id')
                    ->toArray();

                ProdOrderPos::whereIn('id', $idsToDelete)
                    ->update([
                        'status' => ProdOrderPosStatus::DELETED()
                    ]);
                // Make sure all operations of a deleted pos are also deleted.
                ProdOrderPosOperation::whereIn('prod_order_pos_id', $idsToDelete)
                    ->update([
                        'status' => ProdOrderPosOperationStatus::DELETED()
                    ]);
            }
        }

        // update the status of the prodOrderPos & prodOrderPosOperation of the order that are not in the ERP list
        if (count($importedOrderIds) &&
            collect(['adk', 'adk_v2', 'base_visu', 'zi', 'boh', 'agvs', 'ict', 'ict_test', 'vop', 'skt', 'sct', 'sct_dhaka', 'at', 'die'])
                ->contains(env('EXTERNAL_DS_TARGET'))
            && $onlyCustomId == null) {

            // excluding the maintenance orders
            $posIdsToDelete = ProdOrderPos::whereNotIn('prod_order_id', $importedOrderIds)
                ->whereHas('prodOrder', function ($query) {
                    $query->where('order_type', '!=', ProdOrderType::MAINTENANCE());
                })
                ->select('id')
                ->pluck('id')
                ->toArray();

            // Update prod_orders table and exclude the maintenance orders
            ProdOrder::whereNotIn('id', $importedOrderIds)
                ->where('order_type', '!=', ProdOrderType::MAINTENANCE())
                ->update([
                    'is_closed' => true
                ]);

            // Update prod_order_pos table
            ProdOrderPos::whereIn('id', $posIdsToDelete)
                ->update([
                    'status' => ProdOrderPosStatus::DELETED(),
                    'status_plan' => ProdOrderPosStatus::DELETED()
                ]);

            // Make sure all operations of a deleted pos are also deleted except the production one.
            ProdOrderPosOperation::whereIn('prod_order_pos_id', $posIdsToDelete)
                ->whereDoesntHave('prodOrderPosOperationTimes', function ($query) {
                    $query->whereNull('end');
                })
                ->update([
                    'status' => ProdOrderPosOperationStatus::DELETED(),
                    'status_plan' => ProdOrderPosOperationStatus::DELETED()
                ]);
        }
        // end update the status of the prodOrderPos & prodOrderPosOperation of the order that are not in the ERP list

        # START::Tool ID wise start datetime
        if (count($importedOperations)) {
            $importedOperations = collect($importedOperations)
                ->whereNotIn('status', [ProdOrderPosOperationStatus::DELETED(), ProdOrderPosOperationStatus::CLOSED()])
                ->whereNotNull('item_id_tool')
                ->sortBy('start')
                ->select('id', 'item_id_tool', 'start', 'status')
                ->values();

            $itemToolWiseStartDateTime = [];
            $toolIds = [];
            foreach ($importedOperations as $operation) {
                if (!isset($operation['item_id_tool']) || !isset($operation['start'])) {
                    continue;
                }
                if (!in_array($operation['item_id_tool'], $toolIds)) {
                    $itemToolWiseStartDateTime[] = [
                        'tool_id' => $operation['item_id_tool'],
                        'start_date' => $operation['start']
                    ];

                    $toolIds[] = $operation['item_id_tool'];
                }
            }

            $this->itemService->updateToolsRepairsProdDate($itemToolWiseStartDateTime);
        }
        # END::Tool ID wise start datetime

        DataImport::whereIn('id', $xmlIds)->update(['is_imported' => true]);

        $hosts = Machine::whereRaw('LENGTH(host_iot_gateway) > 0')
            ->distinct()
            ->pluck('host_iot_gateway');

        foreach ($hosts as $host) {
            try {
                $destination = $this->getCurlyBracketContent($host ?? '');
                $url = "api/import-prod-orders";

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST', timeout: 60);
                else
                    $response = Http::post("{$host}{$url}");

                if ($response->failed())
                    throw new Exception($response->body());
            } catch (Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to update prod orders on host {$host}: " . $e->getMessage());
            }
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new PlanVisuImport(['t_auftrag', 't_auftrag_teile']));
        }

        return 0;
    }

    private
    function getCurlyBracketContent($string): ?string
    {
        if (preg_match('/\{(.+?)}/', $string, $matches)) {
            return $matches[1];
        }
        return null;
    }
}

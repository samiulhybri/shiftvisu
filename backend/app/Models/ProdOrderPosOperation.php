<?php

namespace App\Models;

use App\DTO\ConsumptionData;
use App\Enums\ComponentPreparationState;
use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdOrderPosOperationStatus;
use App\Services\ImportFromBTPService;
use Exception;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Collection;

class ProdOrderPosOperation extends Model
{
    protected $fillable = [
        'prod_order_pos_id',
        'machine_id',
        'tool_id',
        'plan_machine_id',
        'erp_machine_id',
        'machine_group_id',
        'user_group_id',
        'user_id',
        'prod_lot_id',
        'resource_group_id',
        'resource_group_id_erp',
        'resource_group_id_plan',
        'operation_plan_id_origin',
        'operation_plan_pos_id_origin',
        'plant_id_production',
        'operation_control_profile_id',
        'unit_of_measure_id',
        'pos',
        'name',
        'start',
        'end',
        'te',
        'tr',
        'cavity',
        'registered_quantity',
        'status',
        'comment',
        'show_in_planvisu',
        'erp_start',
        'erp_end',
        'plan_start',
        'plan_end',
        'plan_te',
        'erp_te',
        'is_changed',
        'operation_code',
        'teardown_time',
        'send_ahead_quantity',
        'transfer_time',
        'operation_start_date_v10',
        'is_urgent_delivery',
        'component_availability',
        'operator_usage_factor',
        'has_labels_prepared',
        'note',
        'is_repair_completed',
        'repair_completed_date',
        'quantity',
        'status_erp',
        'status_plan',
        'operation_close_date_v10',
        'tool_insert_id',
        'item_id_tool'
    ];

    static public $snakeAttributes = false;

    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function resourceGroup(): BelongsTo
    {
        return $this->belongsTo(ResourceGroup::class);
    }

    #[LodataRelationship]
    public function machineGroup(): BelongsTo
    {
        return $this->belongsTo(MachineGroup::class);
    }

    #[LodataRelationship]
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    #[LodataRelationship]
    public function itemTool(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_tool');
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function prodOrderPos(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class);
    }

    public function isMiddleOperation(): bool
    {
        $lastOperation = $this->prodOrderPos->prodOrderPosOperations()
            ->where(function ($query) {
                return $query->where('status', '!=', ProdOrderPosOperationStatus::DELETED())
                    ->orWhere('status', null);
            })
            ->latest('pos')
            ->first();

        return $this->id != $lastOperation->id;
    }

    public function isLastOperation(): bool
    {
        return !$this->isMiddleOperation();
    }

    #[LodataRelationship]
    public function prodLot(): BelongsTo
    {
        return $this->belongsTo(ProdLot::class);
    }

    #[LodataRelationship]
    public function prodOrderProdOperationDeliveries(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationDelivery::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationQuantities(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationQuantity::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationLoadedQuantities(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationLoadedQuantity::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationUnloadedQuantities(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationUnloadedQuantity::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationTimes(): HasMany
    {
        return $this->hasMany(MachineProdOrderPosOperationTime::class);
    }

    #[LodataRelationship]
    public function operationPlan(): BelongsTo
    {
        return $this->belongsTo(OperationPlan::class, 'operation_plan_id_origin');
    }

    #[LodataRelationship]
    public function operationPlanPos(): BelongsTo
    {
        return $this->belongsTo(OperationPlanPos::class, 'operation_plan_pos_id_origin');
    }

    public function qualifiedUsersBuilder(): Builder|null
    {
        $qualifications = $this->requiredQualificationsBuilder()->get();
        if ($qualifications->isEmpty()) {
            return null;
        }

        $userQuery = User::query();

        foreach ($qualifications as $qualification) {
            $qualifiedUsers = $qualification->qualifiedUsers;
            $userQuery->whereIn('users.id', $qualifiedUsers->pluck('user_id'));
        }

        return $userQuery;
    }

    public function requiredQualificationsBuilder(): Builder
    {
        return Qualification::query()->where(function ($query) {
            $query->where('qualifications.machine_id', $this->machine_id)
                ->orWhereNull('qualifications.machine_id');
        })
            ->where(function ($query) {
                $query->where('qualifications.operation_code', $this->operation_code)
                    ->orWhereNull('qualifications.operation_code');
            })
            ->where(function ($query) {
                $query->where('qualifications.item_id', $this->prodOrderPos->item_id)
                    ->orWhereNull('qualifications.item_id');
            });
    }

    public function classifications(): MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }

    #[LodataRelationship]
    public function prodOrderPosOperationResources(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationResource::class);
    }

    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    public function handlingUnits(): BelongsToMany
    {
        return $this->belongsToMany(HandlingUnit::class, 'prod_order_pos_operation_handling_units');
    }

    public function prodOrderPosBomPos(): HasMany
    {
        return $this->hasMany(ProdOrderPosBomPos::class);
    }

    public function prodOrderPosOperationBatches(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationBatch::class);
    }

    #[LodataRelationship]
    public function userRegisteredTimes(): HasMany
    {
        return $this->hasMany(UserRegisteredTime::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationAltMachines(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationAltMachine::class);

    }

    #[LodataRelationship]
    public function operationControlProfile(): BelongsTo
    {
        return $this->belongsTo(OperationControlProfile::class);
    }

    /**
     * @return bool
     */
    public function canCreateTransportOrderSingleStaging(): bool
    {
        $singleStagingBomPos = $this->prodOrderPosBomPos()->where('item_type', 'PCSO')->get();

        foreach ($singleStagingBomPos as $bomPos) {
            if ($bomPos->component_preparation_state == ComponentPreparationState::NOT_PREPARED->value ||
                $bomPos->component_preparation_state == ComponentPreparationState::PARTIALLY_PREPARED->value) {
                return false;
            }
        }

        return $singleStagingBomPos->count() > 0;
    }

    public function remainingQuantity()
    {
        $operationQuantity = $this->quantity ?? 0;
        $goodPart = $this->prodOrderPosOperationQuantities()
            ->whereHas('itemStateGoodPart')
            ->sum('quantity') ?? 0;

        return $operationQuantity - $goodPart;
    }

    public function getComponentPreparationState(): ?string
    {
        $bomPositions = $this->prodOrderPosBomPos()->where('item_type', 'PCSO')->whereNotNull('component_preparation_state')->get();
        if ($bomPositions->isEmpty()) {
            return null;
        }
        $notPre = $bomPositions->filter(fn($data) => $data->component_preparation_state == ComponentPreparationState::NOT_PREPARED->value);
        $parPre = $bomPositions->filter(fn($data) => $data->component_preparation_state == ComponentPreparationState::PARTIALLY_PREPARED->value);


        if ($notPre->count() > 0) {
            return ComponentPreparationState::NOT_PREPARED->value;
        } else if ($parPre->count() > 0) {
            return ComponentPreparationState::PARTIALLY_PREPARED->value;
        } else {
            return ComponentPreparationState::PREPARED->value;
        }
    }

    #[LodataRelationship]
    public function prodInspectionOperations(): HasMany
    {
        return $this->hasMany(ProdInspectionOperation::class);
    }

    public function preceedingOperations()
    {
        return $this->prodOrderPos->prodOrderPosOperations()
            ->where("pos", "<", $this->pos)
            ->where("status", "<>", ProdOrderPosOperationStatus::DELETED())
            ->orderBy("pos", "DESC");
    }

    public function getPackagingInstructions(): Collection
    {
        $item = $this->prodOrderPos->item;

        $packagingInstructions = collect();

        $paDefault = $item->packagingInstruction;
        if ($paDefault)
            $packagingInstructions->push($paDefault);

        $pa = $item->packagingInstruction1;
        if ($pa)
            $packagingInstructions->push($pa);

        $pa = $item->packagingInstruction2;
        if ($pa)
            $packagingInstructions->push($pa);

        $pa = $item->packagingInstruction3;
        if ($pa)
            $packagingInstructions->push($pa);

        $pa = $item->packagingInstruction4;
        if ($pa)
            $packagingInstructions->push($pa);

        $result = collect();

        foreach ($packagingInstructions as $packagingInstruction) {
            if ($packagingInstruction->packagingInstructionPos()->where('packable_type', Item::class)->where('packable_id', $item->id)->count() > 0) {
                $itemIdContainer = $packagingInstruction->packagingInstructionPos()->where('packable_type', Item::class)->where('is_container', true)->first('packable_id')->packable_id;
                $itemContainer = null;
                if ($itemIdContainer)
                    $itemContainer = Item::query()->find($itemIdContainer);

                $result->push([
                    'packaging_instruction_id_parent' => null,
                    'packaging_instruction_custom_id_parent' => null,
                    'packaging_instruction_id_child' => $packagingInstruction->id,
                    'packaging_instruction_custom_id_child' => $packagingInstruction->custom_id,
                    'target_quantity' => $packagingInstruction->packagingInstructionPos()->where('packable_type', Item::class)->where('packable_id', $item->id)->first('target_quantity')->target_quantity ?? 0,
                    'item_id_container_parent' => null,
                    'item_id_container_child' => $itemIdContainer ?? 0,
                    'item_custom_id_container' => $itemContainer?->custom_id ?? null,
                    'item_name_container' => $itemContainer?->name ?? null,
                    'is_default' => $packagingInstruction == $paDefault,
                ]);
            }

            if ($packagingInstruction->packagingInstructionPos()->where('packable_type', PackagingInstruction::class)->count() > 0) {
                $childPa = PackagingInstruction::query()->find($packagingInstruction->packagingInstructionPos()->where('packable_type', PackagingInstruction::class)->first('packable_id')->packable_id);

                if ($childPa->packagingInstructionPos()->where('packable_type', Item::class)->where('packable_id', $item->id)->count() > 0) {
                    $itemIdContainer = $childPa->packagingInstructionPos()->where('packable_type', Item::class)->where('is_container', true)->first('packable_id')->packable_id;
                    $itemContainer = null;
                    if ($itemIdContainer)
                        $itemContainer = Item::query()->find($itemIdContainer);

                    $result->push([
                        'packaging_instruction_id_parent' => $packagingInstruction->id,
                        'packaging_instruction_custom_id_parent' => $packagingInstruction->custom_id,
                        'packaging_instruction_id_child' => $childPa->id,
                        'packaging_instruction_custom_id_child' => $childPa->custom_id,
                        'target_quantity' => $childPa->packagingInstructionPos()->where('packable_type', Item::class)->where('packable_id', $item->id)->first('target_quantity')->target_quantity ?? 0,
                        'item_id_container_parent' => $packagingInstruction->packagingInstructionPos()->where('packable_type', Item::class)->where('is_container', true)->first('packable_id')->packable_id ?? null,
                        'item_id_container_child' => $itemIdContainer ?? 0,
                        'item_custom_id_container' => $itemContainer?->custom_id ?? null,
                        'item_name_container' => $itemContainer?->name ?? null,
                        'is_default' => $packagingInstruction == $paDefault,
                    ]);
                }
            }
        }

        return $result;
    }

    /**
     * @param float $quantity
     * @param Machine $machine
     * @return array
     * @throws Exception
     */
    public function proposeConsumptionData(float $quantity, Machine $machine): array
    {
        [$sequence, $opPos] = explode('-', $this->pos, 2);

        $proposeFromSap = env("EXTERNAL_DS_TARGET") == "sap_api";

        if ($proposeFromSap) {
            $res = (new ImportFromBTPService())->executeHttpRequestInBtp(
                "sap/opu/odata/sap/API_PROD_ORDER_CONFIRMATION_2_SRV/GetGdsMvtProposal?OrderID='" . $this->prodOrderPos->prodOrder->custom_id . "'&Sequence='" . $sequence . "'&OrderOperation='" . $opPos . "'&ConfirmationYieldQuantity=" . $quantity . "M&ConfirmationScrapQuantity=0M&ConfirmationReworkQuantity=0M",
                env('BTP_DESTINATION', 'ODATA_API'),
                'POST',
            );
        }

        if ($proposeFromSap && $res->successful()) {
            $bomProposals = collect(json_decode($res->body())->d->results);
            $contains101 = collect(json_decode($res->body())->d->results)
                ->where('GoodsMovementType', '101')
                ->isNotEmpty();

            $units = UnitOfMeasure::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();
            $storageLocations = StorageLocation::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();
            $warehouses = Warehouse::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();
            $storageBins = StorageBin::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();
            $productionSupplyAreas = ProductionSupplyArea::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();
        } else {
            $bomProposals = collect();
            $contains101 = false;
        }

        /** @var ConsumptionData[] $consumptions */
        $consumptions = [];
        foreach ($this->prodOrderPosBomPos as $prodOrderBomPos) {
            if ($prodOrderBomPos->is_bulk) {
                continue;
            }

            $itemPlant = ItemPlant::query()->where('item_id', $prodOrderBomPos->item_id)
                ->where('plant_id', $machine->plant->id)
                ->first();

            if ($itemPlant && ($itemPlant->is_batch_managed || ($machine->machineComponentSerialNumberProfiles->where('serial_number_profile_id', $itemPlant->serial_number_profile_id)->first() ?? null) || $prodOrderBomPos->is_backflush)) {
                $bomProposal = $bomProposals->where('ReservationItem', $prodOrderBomPos->pos)->first();

                $qnt = $quantity * $prodOrderBomPos->qty_for_one_parent;
                $consumption = new ProdOrderPosOperationConsumption();
                $consumption->prod_order_pos_operation_id = $this->id;
                $consumption->item_plant_id = $itemPlant->id;
                $consumption->item_state_id = $machine->plant->item_state_id_default;
                $consumption->quantity = $bomProposal ? floatval($bomProposal->QuantityInEntryUnit) : $qnt;
                $consumption->unit_of_measure_id = $bomProposal ? ($units[$bomProposal->EntryUnit] ?? $prodOrderBomPos->unit_of_measure_id) : $prodOrderBomPos->unit_of_measure_id;
                $consumption->storage_location_id = $bomProposal ? ($storageLocations[$bomProposal->StorageLocation] ?? $prodOrderBomPos->storage_location_id) : $prodOrderBomPos->storage_location_id;
                $consumption->warehouse_id = $bomProposal ? ($warehouses[$bomProposal->EWMWarehouse] ?? null) : null;
                $consumption->storage_bin_id = $bomProposal ? ($storageBins[$bomProposal->EWMStorageBin] ?? null) : null;
                $consumption->production_supply_area_id = $bomProposal ? ($productionSupplyAreas[$bomProposal->ProductionSupplyArea] ?? null) : null;
                $consumption->batch = $bomProposal->Batch ?? null;

                $consumptions[] = ConsumptionData::fromProdOrderPosOperationConsumption($consumption);
            }
        }

        return [$machine->proposeBatches($consumptions), $contains101];
    }

    /**
     * @param Machine|null $machine
     * @param PackagingInstruction|null $selectedPackagingInstruction
     * @return Collection
     */
    public function getTransportOrderPosForPackaging(?Machine $machine = null, ?PackagingInstruction $selectedPackagingInstruction = null): Collection
    {
        $transportOrderPos = collect();
        $itemStateId = $machine?->plant?->item_state_id_default;

        // Get Default Packaging Instruction
        $prodTime = $this->prodOrderPosOperationTimes()
            ->with('machine')
            ->when($machine, function ($query) use ($machine) {
                $query->where('machine_id', $machine->id);
            })
            ->whereNull('end')->first();

        if (!$machine) {
            if ($prodTime) {
                $machine = $prodTime->machine;
            } else {
                $machine = $this->machine;
            }
        }

        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();

        if (!$selectedPackagingInstruction && $prodTime) {
            $selectedPackagingInstruction = PackagingInstruction::find($prodTime->packaging_instruction_id_parent ?? $prodTime->packaging_instruction_id);
        }

        if (!$selectedPackagingInstruction) {
            $selectedPackagingInstruction = $this->prodOrderPos->item->packagingInstruction;
        }

        // Get Packaging Instruction for Child
        $packagingInstructionPosChild = $selectedPackagingInstruction?->packagingInstructionPos()
            ?->where('packable_type', PackagingInstruction::class)
            ?->first();

        $remainingQuantity = $this->quantity;
        $childPackagingInstructionQty = 1;

        if ($packagingInstructionPosChild) {
            $childPackagingInstruction = PackagingInstruction::find($packagingInstructionPosChild->packable_id);
            $childPackagingInstructionPos = $childPackagingInstruction->packagingInstructionPos()
                ->where('packable_type', Item::class)
                ->where('packable_id', $this->prodOrderPos->item_id)
                ->first('target_quantity');

            if ($childPackagingInstructionPos) {
                $childPackagingInstructionQty = $childPackagingInstructionPos->target_quantity;
            }

            foreach ($childPackagingInstruction->packagingInstructionPos()
                         ->where('packable_type', Item::class)
                         ->where('packable_id', '<>', $this->prodOrderPos->item_id)
                         ->get() as $packagingInstructionPos) {

                $itemPlant = $packagingInstructionPos->packable->itemPlants()
                    ->where('plant_id', $this->prodOrderPos->prodOrder->plant_id)
                    ->first();

                if ($itemPlant) {
                    $transportOrderPos->push([
                            'destination_id' => $positionableId,
                            'destination_type' => $positionableType,
                            'item_state_id' => $itemStateId,
                            'totalQuantity' => ceil($remainingQuantity / $childPackagingInstructionQty),
                            'transportable_type' => ItemPlant::class,
                            'transportable_custom_id' => $packagingInstructionPos->packable->custom_id,
                            'transportable_name' => $packagingInstructionPos?->packable?->name,
                            'transportable_id' => $itemPlant->id,
                        ] + array_fill_keys([
                            'source_id', 'source_type',
                            'prodOrderPosOperation', 'unitOfMeasure', 'item_type', 'prodOrderPos',
                            'prod_order_pos_operation', 'prod_order_pos', 'unit_of_measure',
                            'total_stock_quantity', 'total_psa_quantity'
                        ], null));
                }
            }
        }

        if ($selectedPackagingInstruction) {
            // Get Default Packaging Instruction Quantity
            $defaultPackagingInstructionQty = $selectedPackagingInstruction->packagingInstructionPos()
                ->where('packable_type', Item::class)
                ->where('packable_id', $this->prodOrderPos->item_id)
                ->value('target_quantity') ?? $packagingInstructionPosChild->target_quantity ?? 1;

            // Process Default Packaging Instructions
            foreach ($selectedPackagingInstruction->packagingInstructionPos()
                         ->where('packable_type', Item::class)
                         ->where('packable_id', '<>', $this->prodOrderPos->item_id)
                         ->get() as $packagingInstructionPos) {

                $itemPlant = $packagingInstructionPos->packable->itemPlants()
                    ->where('plant_id', $this->prodOrderPos->prodOrder->plant_id)
                    ->first();

                if ($itemPlant) {
                    $transportOrderPos->push([
                            'destination_id' => $positionableId,
                            'destination_type' => $positionableType,
                            'item_state_id' => $itemStateId,
                            'totalQuantity' => ceil($remainingQuantity / ($childPackagingInstructionQty * $defaultPackagingInstructionQty)),
                            'transportable_type' => ItemPlant::class,
                            'transportable_name' => $packagingInstructionPos?->packable?->name,
                            'transportable_custom_id' => $packagingInstructionPos->packable->custom_id,
                            'transportable_id' => $itemPlant->id,
                        ] + array_fill_keys([
                            'source_id', 'source_type',
                            'prodOrderPosOperation', 'unitOfMeasure', 'item_type', 'prodOrderPos',
                            'prod_order_pos_operation', 'prod_order_pos', 'unit_of_measure',
                            'total_stock_quantity', 'total_psa_quantity'
                        ], null));
                }
            }
        }
        return $transportOrderPos;
    }

    public function canChangeOperationToStatus(?ProdOrderPosOperationStatus $status = null): bool
    {
        if(!$status) {
            $status = ProdOrderPosOperationStatus::CLOSED();
        }

        $canChange = true;

        if($status === ProdOrderPosOperationStatus::CLOSED()) {
            foreach ($this->prodInspectionOperations()->where('frequency', ProdInspectionOperationFrequency::OPERATION_CLOSED)->with('inspectionPoints')->get() as $prodInspectionOperation) {
                if ($prodInspectionOperation->inspectionPoints->isEmpty()) {
                    $prodInspectionOperation->createInspectionPoint();
                }
            }
        }

        foreach ($this->prodInspectionOperations()->with('inspectionPoints')->get() as $prodInspectionOperation) {
            if ($prodInspectionOperation->hasOpenInspectionPoints()) {
                $canChange = false;
            }
        }

        return $canChange;
    }
}

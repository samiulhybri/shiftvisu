<?php

namespace App\Models;

use App\DTO\ConsumptionData;
use App\DTO\QuantityData;
use App\Enums\ItemStateType;
use App\Enums\MachineStateType;
use App\Enums\ProdOrderPosOperationHandlingUnitType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProductionPlanType;
use App\Enums\QuantityErrorType;
use App\Enums\StockOperationType;
use App\Events\HandlingUnitCreated;
use App\Http\Controllers\HandlingUnitController;
use App\Http\Controllers\MachineMachineStateTimeController;
use App\Http\Controllers\StockController;
use App\Models\Model\JpiResource;
use Exception;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class Machine extends Model
{
    use HasFactory;

    protected $guarded = [];
    static public $snakeAttributes = false;

    #[LodataRelationship]
    public function machineGroup(): BelongsTo
    {
        return $this->belongsTo(MachineGroup::class, 'machine_group_id');
    }

    #[LodataRelationship]
    public function tpmSubGroup(): BelongsTo
    {
        return $this->belongsTo(TpmSubGroup::class, 'tpm_sub_group_id');
    }

    #[LodataRelationship]
    public function hall(): BelongsTo
    {
        return $this->belongsTo(Hall::class);
    }

    #[LodataRelationship]
    public function standardValueKey(): BelongsTo
    {
        return $this->belongsTo(StandardValueKey::class);
    }

    public function prodOrders(): HasMany
    {
        return $this->hasMany(ProdOrder::class);
    }

    public function operationPlanPos(): HasMany
    {
        return $this->hasMany(OperationPlanPos::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperations(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationTimes(): HasMany
    {
        return $this->hasMany(MachineProdOrderPosOperationTime::class);
    }

    #[LodataRelationship]
    public function currentProdOrderPosOperationTimes(): HasMany
    {
        return $this->hasMany(MachineProdOrderPosOperationTime::class)->whereNull('end')->orderBy('start');
    }

    #[LodataRelationship]
    public function materialConsumptions(): BelongsToMany
    {
        return $this->belongsToMany(MaterialConsumption::class, "material_consumption_machines");
    }

    #[LodataRelationship]
    public function materialConsumptionMachines(): HasMany
    {
        return $this->hasMany(MaterialConsumptionMachines::class);
    }

    #[LodataRelationship]
    public function mpOfferPos(): HasMany
    {
        return $this->hasMany(MpOfferPos::class);
    }

    #[LodataRelationship]
    public function mpCostMachines(): BelongsToMany
    {
        return $this->belongsToMany(MpCostMachine::class);
    }

    #[LodataRelationship]
    public function capacity(): HasMany
    {
        return $this->hasMany(Capacity::class);
    }

    #[LodataRelationship]
    public function markerRecipes(): BelongsToMany
    {
        return $this->belongsToMany(MarkerRecipe::class);
    }

    #[LodataRelationship]
    public function capacities(): MorphMany
    {
        return $this->morphMany(Capacity::class, 'capacitable');
    }

    public function currentCapacities(): MorphMany
    {
        return $this->morphMany(Capacity::class, 'capacitable')->where('date', now())->where('start_time', '<=', now()->toTimeString())->where('end_time', '>', now()->toTimeString());
    }

    #[LodataRelationship]
    public function sectionActivatables(): MorphMany
    {
        return $this->morphMany(SectionActivatable::class, 'activatable');
    }

    #[LodataRelationship]
    public function resourceGroups(): BelongsToMany
    {
        return $this->belongsToMany(ResourceGroup::class, 'machine_resource_groups');
    }

    #[LodataRelationship]
    public function machineState(): BelongsToMany
    {
        return $this->belongsToMany(MachineState::class, 'machine_machine_states');
    }

    #[LodataRelationship]
    public function machineMachineStateTimes(): HasMany
    {
        return $this->hasMany(MachineMachineStateTime::class);
    }

    #[LodataRelationship]
    public function currentMachineMachineStateTimes(): HasMany
    {
        return $this->hasMany(MachineMachineStateTime::class)->whereNull('end')->orderBy('start');
    }

    #[LodataRelationship]
    public function machineUserRestrictions(): HasMany
    {
        return $this->hasMany(MachineUserRestriction::class);
    }

    public function machineVisibleForUser($userId): bool
    {
        return (bool)$this->machineUserRestrictions()->where('user_id', '=', $userId)->first();
    }

    #[LodataRelationship]
    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    #[LodataRelationship]
    public function topQualification(): HasOne
    {
        return $this->hasOne(Qualification::class, 'machine_id'); //Check, is Machine associated with any Qualification or not
    }

    #[LodataRelationship]
    public function operationPlanOperations(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function itemStates(): BelongsToMany
    {
        return $this->belongsToMany(ItemState::class, 'item_state_machines');
    }


    /**
     * @param Builder $query
     * @param Machine $machine
     * @return Builder
     */
    public function scopeProductionPlanType(Builder $query, Machine $machine): Builder
    {
        return $query->with(['operationPlanOperations' => function ($query) use ($machine) {
            if ($machine->production_plan_type == ProductionPlanType::MANUAL()) {
                $query->whereIn('status', [
                    ProdOrderPosOperationStatus::PLANNED(),
                    ProdOrderPosOperationStatus::SUSPENDED(),
                    ProdOrderPosOperationStatus::IN_PRODUCTION()
                ])->whereNotNull('status')
                    ->where('status', '!=', '');
            } else if ($machine->production_plan_type == ProductionPlanType::SETUP_2()) {
                $query->whereIn('status', [
                    ProdOrderPosOperationStatus::PLANNED(),
                    ProdOrderPosOperationStatus::SUSPENDED(),
                    ProdOrderPosOperationStatus::IN_PRODUCTION(),
                    ProdOrderPosOperationStatus::WAITING_FOR_SETUP(),
                    ProdOrderPosOperationStatus::IN_SETUP()
                ])->whereNotNull('status')
                    ->where('status', '!=', '');
            } else if ($machine->production_plan_type == ProductionPlanType::SETUP_1()) {
                $query->whereIn('status', [
                    ProdOrderPosOperationStatus::PLANNED(),
                    ProdOrderPosOperationStatus::SUSPENDED(),
                    ProdOrderPosOperationStatus::IN_PRODUCTION(),
                    ProdOrderPosOperationStatus::IN_SETUP(),
                    ProdOrderPosOperationStatus::WAITING_FOR_SETUP(),
                    ProdOrderPosOperationStatus::IN_PREPARATION()
                ])->whereNotNull('status')
                    ->where('status', '!=', '');
            } else {
                $query->whereRaw('1 = 0');
            }
        }
        ]);

    }

    #[LodataRelationship]
    public function machineUserTime(): HasMany
    {
        return $this->hasMany(MachineUserTime::class);
    }

    #[LodataRelationship]
    public function jpiResources(): MorphMany
    {
        return $this->morphMany(JpiResource::class, 'model');
    }

    #[LodataRelationship]
    public function machineCycles(): HasMany
    {
        return $this->hasMany(MachineCycle::class);
    }

    /**
     * @return array{hasQualifiedUsers: bool, indispensableUsers: array, missingQualifications: array}
     */
    public function checkQualifiedClockinUsers(?array $operationsOnly = null): array
    {
        $clockedInUsers = $this
            ->machineUserTime()
            ->whereNull("end")
            ->select("user_id")
            ->get();

        $indispensableUsers = [];
        $missingQualifications = [];

        $hasQualifiedUsers = true;

        $operations = $operationsOnly === null
            ? $this
                ->prodOrderPosOperationTimes()
                ->with("prodOrderPosOperation")
                ->whereNull("end")
                ->get()
                ->pluck("prodOrderPosOperation")
            : ProdOrderPosOperation::query()
                ->whereIn("id", $operationsOnly)
                ->get();

        foreach ($operations as $operation) {
            $requiredQualifications = Qualification::query()
                ->where(function ($query) {
                    $query->where('qualifications.machine_id', $this->id)
                        ->orWhereNull('qualifications.machine_id');
                })
                ->where(function ($query) use ($operation) {
                    $query->where('qualifications.operation_code', $operation->operation_code)
                        ->orWhereNull('qualifications.operation_code');
                })
                ->where(function ($query) use ($operation) {
                    $query->where('qualifications.item_id', $operation->prodOrderPos->item_id)
                        ->orWhereNull('qualifications.item_id');
                })->get();

            foreach ($requiredQualifications as $qualification) {
                if ($qualification->min_qualification_hours || $qualification->min_qualification_operations) {
                    $qualifiedUsers = $qualification->qualifiedUsers()->select("qualification_users.user_id")->get();

                    // Use `pluck('user_id')` to compare only user_id values and 
                    $intersection = $clockedInUsers->pluck('user_id')->intersect($qualifiedUsers->pluck('user_id'));
                    $intersection = $clockedInUsers->whereIn('user_id', $intersection->values()); // Convert intersection back to user objects as needed
                } else {
                    $intersection = $clockedInUsers;
                }

                if ($intersection->count() == 1) {
                    $indispensableUsers[$intersection->first()->user_id][] = [
                        "operation" => $operation,
                        "qualification" => $qualification
                    ];
                }

                if ($intersection->isEmpty()) {
                    $hasQualifiedUsers = false;
                    $missingQualifications[] = [
                        "operation" => $operation,
                        "qualification" => $qualification
                    ];
                }
            }
        }

        return [
            'hasQualifiedUsers' => $hasQualifiedUsers,
            'indispensableUsers' => $indispensableUsers,
            'missingQualifications' => $missingQualifications
        ];
    }

    public function getClockinUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return $this
            ->machineUserTime()
            ->whereNull("end")
            ->select("user_id")
            ->get();

    }

    public function getPositionable(): array
    {
        return [
            'positionable_id' => $this->production_supply_area_id ?? $this->id,
            'positionable_type' => $this->production_supply_area_id ? ProductionSupplyArea::class : Machine::class,
        ];
    }

    public function shiftModel(): BelongsTo
    {
        return $this->belongsTo(ShiftModel::class);
    }

    #[LodataRelationship]
    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    #[LodataRelationship]
    public function machineStateProduction(): BelongsTo
    {
        return $this->belongsTo(MachineState::class, 'machine_state_id_default_production');
    }

    #[LodataRelationship]
    public function machineStateOff(): BelongsTo
    {
        return $this->belongsTo(MachineState::class, 'machine_state_id_default_off');
    }

    #[LodataRelationship]
    public function machineStateSetup(): BelongsTo
    {
        return $this->belongsTo(MachineState::class, 'machine_state_id_default_setup');
    }

    #[LodataRelationship]
    public function machineStateAvailable(): BelongsTo
    {
        return $this->belongsTo(MachineState::class, 'machine_state_id_default_available');
    }

    #[LodataRelationship]
    public function machineComponentSerialNumberProfilesPivot(): BelongsToMany
    {
        return $this->belongsToMany(SerialNumberProfile::class, 'machine_component_serial_number_profiles');
    }

    #[LodataRelationship]
    public function machineComponentSerialNumberProfiles(): HasMany
    {
        return $this->hasMany(MachineComponentSerialNumberProfile::class);
    }

    #[LodataRelationship]
    public function machineLastSerialNumberProfilesPivot(): BelongsToMany
    {
        return $this->belongsToMany(SerialNumberProfile::class, 'machine_last_serial_number_profiles');
    }

    #[LodataRelationship]
    public function machineLastSerialNumberProfiles(): HasMany
    {
        return $this->hasMany(MachineLastSerialNumberProfile::class);
    }

    #[LodataRelationship]
    public function machineMiddleSerialNumberProfilesPivot(): BelongsToMany
    {
        return $this->belongsToMany(SerialNumberProfile::class, 'machine_middle_serial_number_profiles');
    }

    #[LodataRelationship]
    public function machineMiddleSerialNumberProfiles(): HasMany
    {
        return $this->hasMany(MachineMiddleSerialNumberProfile::class);
    }

    public function handlingUnits(): BelongsToMany
    {
        return $this->belongsToMany(HandlingUnit::class, 'prod_order_pos_operation_handling_units');
    }

    public function prodOrderPosOperationBatches(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationBatch::class);
    }

    public function getOpenOperationTimeForOperation($operation_id): ?MachineProdOrderPosOperationTime
    {
        return $this->prodOrderPosOperationTimes()
            ->where('prod_order_pos_operation_id', $operation_id)
            ->whereNull('end')->first();
    }

    /**
     * @param QuantityData $quantityData
     * @param int|null $userId
     * @param ConsumptionData[] $consumptionData
     * @param int|null $lastProposedId
     * @return void
     * @throws Throwable
     * @throws ValidationException
     */
    public function insertQuantity(QuantityData $quantityData, ?int $userId, array $consumptionData, ?int $lastProposedId): void
    {
        //Handle linked orders
        $selectedOperation = ProdOrderPosOperation::query()->findOrFail($quantityData->prod_order_pos_operation_id);
        $checkLinkedOrders = $quantityData->check_linked_orders ?? true;

        if ($checkLinkedOrders && $selectedOperation->prod_lot_id) {
            $operations = ProdOrderPosOperation::query()->where('prod_lot_id', $selectedOperation->prod_lot_id)
                ->whereNot('id', $selectedOperation->id)
                ->get();

            $operations = $operations->prepend($selectedOperation);
        } else {
            $operations = collect([$selectedOperation]);
        }

        if (count($quantityData->serials) > 0) {
            $operationIds = $operations->pluck('id');

            $usedSerials = ProdOrderPosOperationQuantity::query()->whereIn('prod_order_pos_operation_id', $operationIds)->whereNotNull('serial')->whereNull('prod_order_pos_operation_quantity_id_canceled')->get()->pluck('serial');
            $duplicateSerials = array_intersect($quantityData->serials, collect($usedSerials)->toArray());

            if (count($duplicateSerials) > 0) {
                throw new Exception(json_encode([
                    "type" => QuantityErrorType::DUPLICATE_SERIAL,
                    "values" => $duplicateSerials
                ]));
            }
        }


        //Split quantity to HU qty if enabled for machine
        //If split is enabled, do not take consumptionData from frontend, just use internal consumption proposal
//        if($this->limitxxxx && $this->auto_packaging) {
//            $itemState = ItemState::query()->findOrFail($quantityData->item_state_id);
//            if($itemState->item_state_type == ItemStateType::GOOD()) {
//                if($quantityData->quantity > )
//
//            }
//
//
//
//
//
//        }


        DB::beginTransaction();
        try {
            foreach ($operations as $operation) {
                $quantityToSave = $quantityData->quantity;
                if ($quantityData->item_state_id)
                    $itemState = ItemState::query()->find($quantityData->item_state_id);
                else
                    $itemState = $this->plant->itemStateDefault ?? null;

                $serials = $quantityData->serials ?? [];
                $batch = $quantityData->batch;

                $confirmation = ProdOrderPosOperationConfirmation::query()->create();

                //Create wip
                $operationQuantities = collect();
                if (count($serials)) {
                    foreach ($serials as $serial) {
                        $operationQuantity = new ProdOrderPosOperationQuantity();
                        $operationQuantity->machine_id = $this->id;
                        $operationQuantity->prod_order_pos_operation_id = $operation->id;
                        $operationQuantity->prod_order_pos_operation_confirmation_id = $confirmation->id;
                        $operationQuantity->user_id = $userId;
                        $operationQuantity->item_state_id = $itemState->id;
                        $operationQuantity->quantity = 1;
                        $operationQuantity->confirmed_datetime = now();
                        $operationQuantity->serial = $serial;
                        $operationQuantity->batch = $batch;
                        $operationQuantities->push($operationQuantity);
                    }
                } else {
                    $operationQuantity = new ProdOrderPosOperationQuantity();
                    $operationQuantity->machine_id = $this->id;
                    $operationQuantity->prod_order_pos_operation_id = $operation->id;
                    $operationQuantity->prod_order_pos_operation_confirmation_id = $confirmation->id;
                    $operationQuantity->user_id = $userId;
                    $operationQuantity->item_state_id = $itemState->id;
                    $operationQuantity->quantity = $quantityToSave;
                    $operationQuantity->confirmed_datetime = now();
                    $operationQuantity->batch = $batch;
                    $operationQuantities->push($operationQuantity);
                }

                //Check batch/serials of quantities
                $machineComponentSerialNumberProfiles = $operation->isMiddleOperation() ? $this->machineMiddleSerialNumberProfiles : $this->machineLastSerialNumberProfiles;

                foreach ($operationQuantities as $operationQuantity) {
                    if (count($machineComponentSerialNumberProfiles) &&
                        $machineComponentSerialNumberProfiles->where('serial_number_profile_id', $operation->prodOrderPos->itemPlant()->serial_number_profile_id)->first() &&
                        empty($operationQuantity['serial'])
                    ) {
                        throw new Exception(json_encode([
                            "type" => QuantityErrorType::SERIAL_REQUIRED_FOR_FINAL_ITEM,
                            "values" => [$operation?->prodOrderPos?->itemPlant()?->item?->custom_id]
                        ]));
                    }

                    // Check batch management condition
                    if (
                        $operation->prodOrderPos->itemPlant()?->is_batch_managed &&
                        empty($operationQuantity['batch'])
                    ) {
                        throw new Exception(json_encode([
                            "type" => QuantityErrorType::BATCH_REQUIRED_FOR_FINAL_ITEM,
                            "values" => [$operation?->prodOrderPos?->itemPlant()?->item?->custom_id]
                        ]));
                    }
                }

                $operationQuantityId = null;
                if (count($operationQuantities)) {
                    $operationQuantities->each(function ($quantity) use (&$operationQuantityId) {
                        $quantity->save();
                        $operationQuantityId = $quantity->id;
                    });
                }

                //If one-to-one relationship save QuantityId for potential mounting
                $operationQuantityId = count($operationQuantities) == 1 ? $operationQuantityId : null;
                //Check if manual consumptions/autopropose and check for serial/batch
                $operationConsumptions = collect();

                $autoPostFromErp = false;
                if (!$consumptionData) {
                    [$consumptionData, $autoPostFromErp] = $operation->proposeConsumptionData($quantityToSave, $this);
                }

                foreach ($consumptionData as $consumption) {
                    $operationConsumption = new ProdOrderPosOperationConsumption();
                    $operationConsumption->prod_order_pos_operation_id = $operation->id;
                    $operationConsumption->prod_order_pos_operation_quantity_id = $operationQuantityId;
                    $operationConsumption->quantity = $consumption->quantity;
                    $operationConsumption->serial = $consumption->serial;
                    $operationConsumption->batch = $consumption->batch;
                    $operationConsumption->consumed_datetime = now();
                    $operationConsumption->unit_of_measure_id = $consumption->unit_of_measure_id;
                    $operationConsumption->storage_location_id = $consumption->storage_location_id;
                    $operationConsumption->handling_unit_id = $consumption->handling_unit_id;
                    $operationConsumption->item_state_id = $consumption->item_state_id;
                    $operationConsumption->item_plant_id = $consumption->item_plant_id;
                    $operationConsumption->warehouse_id = $consumption->warehouse_id;
                    $operationConsumption->storage_bin_id = $consumption->storage_bin_id;
                    $operationConsumption->production_supply_area_id = $consumption->production_supply_area_id;
                    $operationConsumption->note = $consumption->note;
                    $operationConsumption->prod_order_pos_operation_confirmation_id = $confirmation->id;

                    $operationConsumptions->push($operationConsumption);
                }

                //Check batch/serials of consumptions
                $machineComponentSerialNumberProfiles = $this->machineComponentSerialNumberProfiles;
                foreach ($operationConsumptions as $operationConsumption) {
                    if (count($machineComponentSerialNumberProfiles) &&
                        $machineComponentSerialNumberProfiles->where('serial_number_profile_id', $operationConsumption->itemPlant->serial_number_profile_id)->first() &&
                        empty($operationConsumption['serial'])
                    ) {
                        throw new Exception(json_encode([
                            "type" => QuantityErrorType::SERIAL_REQUIRED_FOR_COMPONENT,
                            "values" => [$operationConsumption?->itemPlant?->item?->custom_id]
                        ]));
                    }

                    // Check batch management condition
                    if (
                        $operationConsumption->itemPlant->is_batch_managed &&
                        empty($operationConsumption['batch'])
                    ) {
                        throw new Exception(json_encode([
                            "type" => QuantityErrorType::BATCH_REQUIRED_FOR_COMPONENT,
                            "values" => [$operationConsumption?->itemPlant?->item?->custom_id],
                            "quantity" => $operationConsumption?->quantity
                        ]));
                    }
                }

                $consumptionIds = [];
                //Do not reuse frontend consumption data for multi operation
                $consumptionData = [];
                if (count($operationConsumptions) > 0) {
                    $operationConsumptions->each(function ($consumption) use (&$consumptionIds) {
                        $consumption->save();
                        $consumptionIds[] = $consumption->id;
                    });
                }

                $outputs = $confirmation->moveStocks($autoPostFromErp);

                //Check if there are still HUs or Batches assigned that do not contain any Quantity otherwise disassociate
                foreach ($this->prodOrderPosOperationBatches() as $batch) {
                    ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $this->getPositionable();

                    //TODO: Check stock at positionable
                }

                foreach ($this->handlingUnits as $handlingUnit) {
                    if (!$handlingUnit->hasChildHU() && $handlingUnit->getCurrentWipAndItemPlant() == 0) {
                        $this->handlingUnits()->detach($handlingUnit->id);
                    }
                }

                if ($lastProposedId) {
                    //Set machine cycles as confirmed
                    $this->confirmMachineCycles($operation, $lastProposedId, $serials);
                }

                //If auto_pack, move wip to hu and assign consumption to hu for mat doc
                if ($this->auto_packaging) {
                    $outputs = collect();
                    foreach ($operationQuantities as $operationQuantity) {
                        $itemStateType = ItemStateType::from($operationQuantity->itemState->item_state_type);

                        $huType = match ($itemStateType) {
                            ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP(),
                            ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK(),
                            default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD(),
                        };

                        $handlingUnit = $operation->handlingUnits()->wherePivot('type', $huType)->first() ??
                            $this->handlingUnits()->wherePivot('prod_order_pos_operation_id', null)->wherePivot('type', $huType)->first();

                        if (!$handlingUnit) {
                            //Check if level 2 needed
                            $huTypeLevel2 = match ($itemStateType) {
                                ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP_LEVEL_2(),
                                ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK_LEVEL_2(),
                                default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD_LEVEL_2(),
                            };

                            $handlingUnitParent = $operation->handlingUnits()->wherePivot('type', $huTypeLevel2)->first() ??
                                $this->handlingUnits()->wherePivot('prod_order_pos_operation_id', null)->wherePivot('type', $huTypeLevel2)->first();
                            ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $this->getPositionable();

                            $nextPackagingData = $this->getNextPackagingData($operation->id);

                            switch ($itemStateType) {
                                case ItemStateType::REWORK():
                                case ItemStateType::SCRAP():
                                    $itemIdPackagingParent = null;
                                    $packagingInstructionIdParent = null;
                                    break;
                                default:
                                    $itemIdPackagingParent = $nextPackagingData?->item_id_packaging_parent ?? null;
                                    $packagingInstructionIdParent = $nextPackagingData?->packaging_instruction_id_parent ?? null;
                                    break;
                            }

                            if (!$handlingUnitParent && $packagingInstructionIdParent && $itemIdPackagingParent) {
                                //Create parent on machine
                                $handlingUnitParent = $this->createExitHU(
                                    packaging_instruction_id: $packagingInstructionIdParent,
                                    item_id_packaging: $itemIdPackagingParent,
                                    positionable_type: $positionableType,
                                    positionable_id: $positionableId,
                                    handlingUnitType: $huTypeLevel2,
                                    operation: $operation,
                                );
                                $positionableId = $handlingUnitParent->id;
                                $positionableType = HandlingUnit::class;
                            } else if ($handlingUnitParent) {
                                $positionableId = $handlingUnitParent->id;
                                $positionableType = HandlingUnit::class;
                            }

                            if ((Setting::query()->first()->is_packaging_instruction_necessary_for_hu ?? true) &&
                                !(
                                    $nextPackagingData?->packaging_instruction_id &&
                                    $nextPackagingData?->item_id_packaging
                                )) {
                                throw new Exception(json_encode([
                                    "type" => QuantityErrorType::PACKAGING_INSTRUCTION_FOR_HU
                                ]));
                            }

                            switch ($itemStateType) {
                                case ItemStateType::SCRAP():
                                    $itemIdPackaging = $this->plant->item_id_packaging_scrap;
                                    $packagingInstructionId = null;
                                    break;
                                case ItemStateType::REWORK():
                                    $itemIdPackaging = $this->plant->item_id_packaging_rework;
                                    $packagingInstructionId = null;
                                    break;
                                default:
                                    $itemIdPackaging = $nextPackagingData?->item_id_packaging_parent ?? null;
                                    $packagingInstructionId = $nextPackagingData?->packaging_instruction_id ?? null;
                                    break;
                            }

                            $handlingUnit = $this->createExitHU(
                                packaging_instruction_id: $packagingInstructionId,
                                item_id_packaging: $itemIdPackaging,
                                positionable_type: $positionableType,
                                positionable_id: $positionableId,
                                handlingUnitType: $huType,
                                operation: $operation,
                            );
                        }
                        $handlingUnit->prodOrderPosOperationConsumptions()->attach($consumptionIds);
                        $consumptionIds = [];

                        $stockableId = $autoPostFromErp ? $operationQuantity->prodOrderPosOperation->prodOrderPos->itemPlant()->id : $operationQuantity->prod_order_pos_operation_id;
                        $stockableType = $autoPostFromErp ? ItemPlant::class : ProdOrderPosOperation::class;

                        $outputs = $outputs->merge($operationQuantity->packageStocks($stockableId, $stockableType, $handlingUnit->id, HandlingUnit::class));

                        //Added  && $operationQuantity == $operationQuantities->last() for FNA, because we do not want to print if we do save multiple serials at once
                        if ($this->auto_print_middle_operation && $operation->isMiddleOperation() && $operationQuantity == $operationQuantities->last()) {
                            $handlingUnit->print($operation);

                            ProdOrderPosOperationHandlingUnit::query()->where('handling_unit_id', $handlingUnit->id)
                                ->where('machine_id', $this->id)
                                ->delete();
                        }
                    }
                }

                //If auto_post_goods_receipt create material doc and change wip to itemplant
                if ($this->auto_post_goods_receipt && $operation->isLastOperation()) {
                    //Post HU
                    foreach ($outputs->where('positionable_type', HandlingUnit::class)->pluck('positionable_id')->unique() as $handlingUnitId) {
                        $handlingUnit = HandlingUnit::query()->findOrFail($handlingUnitId);

                        //Auto post only completed HUs
                        if ($handlingUnit->isFullWithWipAndItemPlant()) {
                            $handlingUnit->createGoodsReceipt();

                            if ($handlingUnit->parentStock->positionable_type == HandlingUnit::class) {
                                $parentHU = HandlingUnit::query()->findOrFail($handlingUnit->parentStock->positionable_id);
                                if ($parentHU->isFullWithChildHU()) {
                                    $parentHU->createGoodsReceipt();
                                }
                            }
                        }
                    }

                    //POST non packaged content
                    $goodsReceiptInputs = collect();
                    $goodsReceiptOutputs = collect();
                    foreach ($outputs->where('positionable_type', '<>', HandlingUnit::class) as $output) {
                        if ($output['stockable_type'] == ProdOrderPosOperation::class) {
                            $goodsReceiptInputs->push(
                                [
                                    'stockable_type' => $output['stockable_type'],
                                    'stockable_id' => $output['stockable_id'],
                                    'positionable_type' => $output['positionable_type'],
                                    'positionable_id' => $output['positionable_id'],
                                    'item_state_id' => $output['item_state_id'],
                                    'quantity' => -$output['quantity'],
                                    'serial' => $output['serial'],
                                    'batch' => $output['batch'],
                                ]
                            );

                            $itemPlantId = ProdOrderPosOperation::query()->findOrFail($output['stockable_id'])->prodOrderPos->itemPlant()->id ?? null;
                            if (!$itemPlantId) {
                                throw new Exception('Item Plant not found');
                            }

                            $goodsReceiptOutputs->push(
                                [
                                    'stockable_type' => ItemPlant::class,
                                    'stockable_id' => $itemPlantId,
                                    'positionable_type' => $output['positionable_type'],
                                    'positionable_id' => $output['positionable_id'],
                                    'item_state_id' => $output['item_state_id'],
                                    'quantity' => $output['quantity'],
                                    'serial' => $output['serial'],
                                    'batch' => $output['batch'],
                                ]
                            );
                        }

                        if ($goodsReceiptOutputs->isNotEmpty()) {
                            StockController::moveStocks($goodsReceiptInputs->toArray(), $goodsReceiptOutputs->toArray(), StockOperationType::GOODS_RECEIPT(), $confirmation);
                        }
                    }
                }
            }
            DB::commit();
        } catch (Throwable $e) {
            DB::rollback();
            throw $e;
        }
    }


    /**
     * @param $packaging_instruction_id
     * @param $item_id_packaging
     * @param $positionable_type
     * @param $positionable_id
     * @param ProdOrderPosOperationHandlingUnitType $handlingUnitType
     * @param ProdOrderPosOperation|null $operation
     * @return mixed
     * @throws Exception
     */
    public function createExitHU($packaging_instruction_id, $item_id_packaging, $positionable_type, $positionable_id, ProdOrderPosOperationHandlingUnitType $handlingUnitType, ?ProdOrderPosOperation $operation = null): HandlingUnit
    {
        $handlingUnit = HandlingUnitController::createHandlingUnit($packaging_instruction_id, $item_id_packaging);

        ['positionable_id' => $machinePositionableId, 'positionable_type' => $machinePositionableType] = $this->getPositionable();

        event(new HandlingUnitCreated($this, $handlingUnit, $operation));

        ProdOrderPosOperationHandlingUnit::query()->create([
            'prod_order_pos_operation_id' => $operation->id ?? null,
            'handling_unit_id' => $handlingUnit->id,
            'machine_id' => $this->id,
            'type' => $handlingUnitType
        ]);

        $inputs = [];
        $packagingInstructionPoses = PackagingInstructionPos::query()
            ->where('packaging_instruction_id', $packaging_instruction_id)
            ->whereHasMorph('packable', [Item::class], function ($query) {
                $query->where('is_packaging_item', true)
                    ->whereHas('itemPlants', function ($subQuery) {
                        $subQuery->where('plant_id', $this->plant_id);
                    });
            })
            ->with(['packable' => function ($query) {
                $query->with('itemPlants');
            }])
            ->get();

        foreach ($packagingInstructionPoses as $packagingInstructionPos) {
            if (($packagingInstructionPos->packable?->itemPlants?->where('plant_id', $this->plant_id)?->count() ?? 0) > 0) {
                $inputs[] = [
                    "quantity" => -$packagingInstructionPos->target_quantity,
                    "stockable_type" => ItemPlant::class,
                    "stockable_id" => $packagingInstructionPos->packable->itemPlants->where('plant_id', $this->plant_id)->first()->id,
                    "positionable_type" => $machinePositionableType,
                    "positionable_id" => $machinePositionableId,
                    "item_state_id" => $this->plant->item_state_id_default,
                ];
            }
        }
        $outputs = [
            [
                "quantity" => 1,
                "stockable_type" => HandlingUnit::class,
                "stockable_id" => $handlingUnit->id,
                "positionable_type" => $positionable_type,
                "positionable_id" => $positionable_id,
                "item_state_id" => $this->plant->item_state_id_default,
            ]
        ];

        StockController::moveStocks($inputs, $outputs, StockOperationType::HANDLING_UNIT_CREATION(), $handlingUnit);

        return $handlingUnit;
    }

    /**
     * @param ConsumptionData[] $consumptions
     * @return ConsumptionData[]
     */
    public function proposeBatches(array $consumptions): array
    {
        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $this->getPositionable();

        $handlingUnits = $this
            ->handlingUnits()
            ->wherePivot("type", ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
            ->orderByPivot("created_at")
            ->get();

        $batches = $this
            ->prodOrderPosOperationBatches()
            ->where("type", ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
            ->orderBy("created_at")
            ->get();


        $output = [];

        foreach ($consumptions as $consumption) {
            $remainingQuantity = $consumption->quantity;
            foreach ($handlingUnits as $handlingUnit) {
                //TODO: Check position of Handling unit to match with this positionable

                $itemInStock = $handlingUnit
                    ->childStocks()
                    ->where("stockable_type", ItemPlant::class)
                    ->where("stockable_id", $consumption->item_plant_id)
                    ->first();

                if ($itemInStock) {
                    if (min($remainingQuantity, $itemInStock->quantity) <= 0)
                        continue;

                    $cloned = $consumption->replicate();
                    $qtyToTake = min($remainingQuantity, $itemInStock->quantity);
                    $remainingQuantity -= $qtyToTake;

                    $cloned->quantity = $qtyToTake;
                    $cloned->batch = $itemInStock->batch;
                    $cloned->serial = $itemInStock->serial;
                    $cloned->handling_unit_id = $handlingUnit->id;
                    $cloned->storage_location_id = $handlingUnit
                        ->hierarchy()
                        ->where("positionable_type", StorageLocation::class)
                        ->first()
                        ?->positionable_id ??
                        $cloned->storage_location_id;
                    $cloned->item_state_id = $itemInStock->item_state_id;
                    $output[] = $cloned;
                }

                if (!$remainingQuantity) {
                    continue 2;
                }
            }

            foreach ($batches as $batch) {
                $itemInStock = Stock::query()
                    ->where("batch", $batch->batch)
                    ->where("stockable_type", ItemPlant::class)
                    ->where("stockable_id", $consumption->item_plant_id)
                    ->where("positionable_type", $positionableType)
                    ->where("positionable_id", $positionableId)
                    ->first();

                if ($itemInStock) {
                    if (min($remainingQuantity, $itemInStock->quantity) <= 0)
                        continue;

                    $cloned = $consumption->replicate();
                    $qtyToTake = min($remainingQuantity, $itemInStock->quantity);
                    $remainingQuantity -= $qtyToTake;

                    $cloned->quantity = $qtyToTake;
                    $cloned->batch = $itemInStock->batch;
                    $cloned->serial = $itemInStock->serial;
                    $cloned->storage_location_id =
                        $itemInStock->positionable_type == StorageLocation::class ?
                            $itemInStock->positionable_id :
                            null;
                    $cloned->item_state_id = $itemInStock->item_state_id;
                    $output[] = $cloned;
                }

                if (!$remainingQuantity) {
                    continue 2;
                }
            }

            if ($remainingQuantity) {
                $remainingConsumption = $consumption;
                $remainingConsumption->quantity = $remainingQuantity;
                $output[] = $remainingConsumption;
            }
        }

        return $output;
    }

    public function confirmMachineCycles(ProdOrderPosOperation $operation, int $lastId, array $serials): void
    {
        if ($serials) {
            MachineCycle::query()
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
                ->where('machine_cycles.machine_id', $this->id)
                ->where('t.prod_order_pos_operation_id', $operation->id)
                ->whereIn('serial', $serials)
                ->update([
                    'confirmed_datetime' => now(),
                ]);
        } else {
            MachineCycle::query()
                ->where('machine_cycles.machine_id', $this->id)
                ->where('t.prod_order_pos_operation_id', $operation->id)
                ->where('machine_cycles.id', '<=', $lastId)
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
                ->update([
                    'confirmed_datetime' => now(),
                ]);
        }
    }


    // Fetch the next packaging data
    private function getNextPackagingData($operationId): MachineProdOrderPosOperationTime|null
    {
        return MachineProdOrderPosOperationTime::query()
            ->where('machine_id', $this->id)
            ->where('prod_order_pos_operation_id', $operationId)
            ->whereNull('end')
            ->first();
    }

    public function checkAndUpdateMachineStatus() {
        $machineStateType = MachineStateType::tryFrom($this->machine_state_type);
        if($machineStateType === MachineStateType::BASED_ON_OPERATION()) {
            $currentProdOrderPosOperationTimes = $this->currentProdOrderPosOperationTimes()
                ->whereIn('status', [
                    ProdOrderPosOperationStatus::IN_SETUP(),
                    ProdOrderPosOperationStatus::IN_PRODUCTION(),
                    ProdOrderPosOperationStatus::IN_TEARDOWN()
                ])->get();

            if($currentProdOrderPosOperationTimes
                ->whereIn('status', [ProdOrderPosOperationStatus::IN_SETUP(), ProdOrderPosOperationStatus::IN_TEARDOWN()])
                ->count()) {
                MachineMachineStateTimeController::saveMachineState($this->id, $this->machine_state_id_default_setup, now());
            } else if ($currentProdOrderPosOperationTimes
                ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                ->count()) {
                MachineMachineStateTimeController::saveMachineState($this->id, $this->machine_state_id_default_production, now());
            }
            else {
                MachineMachineStateTimeController::saveMachineState($this->id, $this->machine_state_id_default_off, now());
            }
        } else if($machineStateType === MachineStateType::IIOT()) {
            //TODO: This needs to be done
        }
    }
}
    


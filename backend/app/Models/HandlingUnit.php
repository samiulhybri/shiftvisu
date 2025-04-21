<?php

namespace App\Models;

use App\Enums\DataExportName;
use App\Enums\ItemStateType;
use App\Enums\StockOperationType;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\StockController;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HandlingUnit extends Model
{

    protected $guarded = [];
    use HasFactory;


    #[LodataRelationship]
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationHandlingUnits(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationHandlingUnit::class);
    }

    #[LodataRelationship]
    public function packagingInstruction(): BelongsTo
    {
        return $this->belongsTo(PackagingInstruction::class);
    }

    public function childStocks(): MorphMany
    {
        return $this->morphMany(Stock::class, 'positionable');
    }

    public function parentStock(): MorphOne
    {
        return $this->morphOne(Stock::class, 'stockable');
    }

    public function hierarchy()
    {
        return $this->parentStock?->hierarchy() ?? [];
    }

    #[LodataRelationship]
    public function stocks(): MorphMany
    {
        return $this->morphMany(Stock::class, 'stockable');
    }

    public function isFullWithChildHU(): bool
    {
        return $this->getCurrentChildHU() >= $this->getCapacityChildHU();
    }

    public function isFullWithWipAndItemPlant(): bool
    {
        return $this->getCurrentWipAndItemPlant() >= $this->getCapacityWipAndItemPlant();
    }

    public function getCurrentChildHU(): int
    {
        return $this->childStocks()->where('stockable_type', HandlingUnit::class)->sum('quantity') ?? 0;
    }

    public function getCurrentWipAndItemPlant(): int
    {
        return $this->getCurrentWip() + $this->getCurrentItemPlant();
    }

    public function getCurrentWip(): int
    {
        return $this->childStocks()->where('stockable_type', ProdOrderPosOperation::class)->sum('quantity') ?? 0;
    }

    public function getCurrentItemPlant(): int
    {
        return $this->childStocks()->where('stockable_type', ItemPlant::class)->sum('quantity') ?? 0;
    }

    public function getCapacityChildHU(): int
    {
        return $this->packagingInstruction?->packagingInstructionPos()->where('packable_type', PackagingInstruction::class)->sum('target_quantity') ?? 0;
    }

    public function getCapacityWipAndItemPlant(): int
    {
        return $this->packagingInstruction?->packagingInstructionPos()->where('packable_type', Item::class)->where('is_container', false)->sum('target_quantity') ?? 0;
    }

    public function hasChildHU(): bool
    {
        return $this->childStocks()->where('stockable_type', HandlingUnit::class)->count() ?? false;
    }

    /**
     * @throws ValidationException
     */
    public function createGoodsReceiptExportObject(): array
    {
        //Disassociate from exit
        ProdOrderPosOperationHandlingUnit::query()
            ->where('handling_unit_id', $this->id)
            ->delete();

        $wip = collect();
        $wipConsumptions = collect();
        $items = collect();
        $childHUs = collect();

        if ($this->hasChildHU()) {
            foreach ($this->childStocks()->where('stockable_type', HandlingUnit::class)->get() as $childStock) {
                if ($childStock->stockable instanceof HandlingUnit) {
                    $childHU = $childStock->stockable;
                    $childHUs->push($childHU->createGoodsReceiptExportObject());
                }
            }
        }


        //PREVIOUSLY GOODS RECEIVED POS
        foreach ($this->childStocks()->where('stockable_type', ItemPlant::class)->get() as $childStock) {
            if ($childStock->stockable instanceof ItemPlant) {
                $itemPlant = $childStock->stockable;

                $items->push([
                    "item_id_custom" => $itemPlant->item->custom_id ?? null,
                    "plant_id_custom" => $itemPlant->plant->custom_id ?? null,
                    "quantity" => $childStock->quantity,
                    'item_state_group_id_custom' => $childStock->itemState->itemStateGroup?->custom_id ?? null,
                    "item_state_type" => $childStock->itemState->item_state_type ?? null,
                    "serial" => $childStock->serial,
                    "batch" => $childStock->batch,
                ]);
            }
        }

        $consumptions = ProdOrderPosOperationConsumption::query()
            ->select(
                'prod_order_pos_operation_consumptions.item_plant_id',
                'prod_order_pos_operation_consumptions.item_state_id',
                'prod_order_pos_operation_consumptions.serial',
                'prod_order_pos_operation_consumptions.batch',
                'prod_order_pos_operation_consumptions.handling_unit_id',
                DB::raw('SUM(prod_order_pos_operation_consumptions.quantity) as quantity')
            )
            ->join(
                'handling_unit_prod_order_pos_operation_consumptions',
                'handling_unit_prod_order_pos_operation_consumptions.prod_order_pos_operation_consumption_id',
                '=',
                'prod_order_pos_operation_consumptions.id'
            )
            ->where('handling_unit_prod_order_pos_operation_consumptions.handling_unit_id', $this->id)
            ->groupBy(
                'prod_order_pos_operation_consumptions.item_plant_id',
                'prod_order_pos_operation_consumptions.item_state_id',
                'prod_order_pos_operation_consumptions.serial',
                'prod_order_pos_operation_consumptions.batch',
                'prod_order_pos_operation_consumptions.handling_unit_id'
            )
            ->get();

        //WIP CONSUMPTIONS
        foreach ($consumptions as $consumption) {
            $wipConsumptions->push([
                "item_id_custom" => $consumption->itemPlant->item->custom_id ?? null,
                "plant_id_custom" => $consumption->itemPlant->plant->custom_id ?? null,
                'item_state_group_id_custom' => $consumption->itemState->itemStateGroup?->custom_id ?? null,
                "item_state_type" => $consumption->itemState->item_state_type ?? null,
                "serial" => $consumption->serial ?? null,
                "batch" => $consumption->batch ?? null,
                "handling_unit_custom_id" => $consumption->handlingUnit->custom_id ?? null,
                "quantity" => $consumption->quantity,
            ]);
        }

        $this->prodOrderPosOperationConsumptions()->detach();

        $inputs = collect();
        $outputs = collect();
        //WIP
        foreach ($this->childStocks()->where('stockable_type', ProdOrderPosOperation::class)->get() as $childStock) {
            if ($childStock->stockable instanceof ProdOrderPosOperation) {
                $operation = $childStock->stockable;

                $storageLocation = match ($childStock->itemState->item_state_type) {
                    ItemStateType::SCRAP()->value => $operation->prodOrderPos->prodOrder->plant->storageLocationScrap ?? $operation->prodOrderPos->storageLocation,
                    ItemStateType::REWORK()->value => $operation->prodOrderPos->prodOrder->plant->storageLocationRework ?? $operation->prodOrderPos->storageLocation,
                    default => $operation->prodOrderPos->storageLocation,
                };

                $wip->push([
                    "prod_order_id_custom" => $operation->prodOrderPos->prodOrder->custom_id,
                    "prod_order_pos_operation_id_custom" => $operation->pos,
                    "prod_order_pos_operation_id" => $operation->id,
                    "item_id_custom" => $operation->prodOrderPos->item->custom_id ?? null,
                    "plant_id_custom" => $operation->prodOrderPos->prodOrder->plant->custom_id ?? null,
                    "quantity" => $childStock->quantity,
                    "unit_of_measure_id_custom" => $operation->unitOfMeasure?->custom_id,
                    'item_state_group_id_custom' => $childStock->itemState->itemStateGroup?->custom_id ?? null,
                    "item_state_type" => $childStock->itemState->item_state_type ?? null,
                    "serial" => $childStock->serial,
                    "batch" => $childStock->batch,
                    "storage_location_id_custom" => $storageLocation->custom_id ?? null,
                ]);

                $inputs->push([
                    'stockable_type' => $childStock['stockable_type'],
                    'stockable_id' => $childStock['stockable_id'],
                    'positionable_type' => $childStock['positionable_type'],
                    'positionable_id' => $childStock['positionable_id'],
                    'item_state_id' => $childStock['item_state_id'],
                    'quantity' => -$childStock['quantity'],
                    'serial' => $childStock['serial'],
                    'batch' => $childStock['batch'],
                ]);

                $outputs->push([
                    'stockable_type' => ItemPlant::class,
                    'stockable_id' => $operation->prodOrderPos->itemPlant()->id,
                    'positionable_type' => $childStock['positionable_type'],
                    'positionable_id' => $childStock['positionable_id'],
                    'item_state_id' => $childStock['item_state_id'],
                    'quantity' => $childStock['quantity'],
                    'serial' => $childStock['serial'],
                    'batch' => $childStock['batch'],
                ]);
            }
        }

        StockController::moveStocks($inputs->toArray(), $outputs->toArray(), StockOperationType::GOODS_RECEIPT(), $this);


        $stock = Stock::query()->where('stockable_type', HandlingUnit::class)->where('stockable_id', $this->id)->firstOrFail();
        $parentHU = null;
        if ($stock->positionable_type == HandlingUnit::class) {
            $parentHU = HandlingUnit::query()->findOrFail($stock->positionable_id);
        }

        return [
            "handling_unit_custom_id" => $this->custom_id ?? null,
            "packaging_instruction_custom_id" => $this->packagingInstruction->custom_id ?? null,
            "is_full_with_child_hu" => $this->isFullWithChildHU(),
            "handling_unit_parent_custom_id" => $parentHU->custom_id ?? null,
            "packaging_instruction_parent_custom_id" => $parentHU?->packagingInstruction?->custom_id ?? null,
            "is_parent_full" => $parentHU?->isFullWithChildHU() ?? false,
            "items" => $items->toArray(),
            "wip" => $wip->toArray(),
            "wip_consumptions" => $wipConsumptions->toArray(),
            "handling_units" => $childHUs->toArray(),
        ];
    }

    /**
     * @throws ValidationException
     */
    public function createGoodsReceipt(?ProdOrderPosOperation $operation = null)
    {
        if ($this->hasChildHU()) {
            foreach ($this->childStocks()->where('stockable_type', HandlingUnit::class)->get() as $childStock) {
                if ($childStock->stockable instanceof HandlingUnit) {
                    $childHU = $childStock->stockable;
                    if ($childHU->getCurrentWip())
                        $childHU->createGoodsReceipt();
                }
            }
        }
        $user = auth()->user();

        $docToExport = DataExport::query()->create([
            "name" => DataExportName::MATERIAL_DOCUMENT(),
            "data" => json_encode([
                "user_id_custom" => $user?->custom_id ?? null,
                "user_is_imported_from_erp" => $user?->is_imported_from_erp ?? null,
                "prod_order_custom_id" => $operation->prodOrderPos->prodOrder->custom_id ?? null,
                "posting_date" => now()->toDateTimeString(),
                "handling_unit" => $this->createGoodsReceiptExportObject(),
            ])
        ]);

        (new ExportController)->singleExport($docToExport);

        return $docToExport;
    }

    public function prodOrderPosOperationConsumptions(): BelongsToMany
    {
        return $this->belongsToMany(ProdOrderPosOperationConsumption::class, 'handling_unit_prod_order_pos_operation_consumptions');
    }

    public function print(ProdOrderPosOperation $operation): void
    {
        $data = [
            'handling_unit_id_custom' => $this->custom_id ?? '',
            'printer_name' => $operation->machine?->printer_name ?? '',
            'prod_order_id_custom' => $operation->prodOrderPos->prodOrder->custom_id ?? '',
            'item_id_custom' => $operation->prodOrderPos->item?->custom_id ?? '',
            'prod_order_pos_operation_pos' => $operation->pos ?? '',
        ];

        $now = now();
        $dataExport = DataExport::query()->create([
            'name' => DataExportName::PRINT_HANDLING_UNIT(),
            'data' => json_encode($data),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $c = new ExportController();
        $c->singleExport($dataExport);
    }
}

<?php

namespace App\Models;

use App\Enums\DataExportName;
use App\Enums\StockOperationType;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\StockController;
use Exception;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ProdOrderPosOperationConfirmation extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function prodOrderPosOperationConsumptions(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationConsumption::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationQuantities(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationQuantity::class);
    }

    /**
     * @throws ValidationException
     * @throws Exception
     */
    public function moveStocks(bool $autoPost = false) : Collection
    {
        $machine = $this->prodOrderPosOperationQuantities->first()->machine;

        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();

        $inputs = $this->prodOrderPosOperationConsumptions->map(function ($consumption) use ($positionableId, $positionableType) {
            return [
                'stockable_type' => ItemPlant::class,
                'stockable_id' => $consumption->item_plant_id,
                'positionable_type' => $consumption->handling_unit_id ? HandlingUnit::class : $positionableType,
                'positionable_id' => $consumption->handling_unit_id ?? $positionableId,
                'item_state_id' => $consumption->item_state_id,
                'quantity' => -$consumption->quantity,
                'serial' => $consumption->serial,
                'batch' => $consumption->batch,
            ];
        });

        $outputs = $this->prodOrderPosOperationQuantities->map(function ($quantity) use ($positionableId, $positionableType, $autoPost)  {
            return [
                'stockable_type' => $autoPost ? ItemPlant::class : ProdOrderPosOperation::class,
                'stockable_id' => $autoPost ? $quantity->prodOrderPosOperation->prodOrderPos->itemPlant()->id : $quantity->prodOrderPosOperation->id,
                'positionable_type' => $positionableType,
                'positionable_id' => $positionableId,
                'item_state_id' => $quantity->item_state_id,
                'quantity' => $quantity->quantity,
                'serial' => $quantity->serial,
                'batch' => $quantity->batch,
            ];
        });

        if($outputs->isNotEmpty()) {
            StockController::moveStocks($inputs->toArray(), $outputs->toArray(), StockOperationType::OPERATION_QUANTITY(), $this);

            $quantity = $this->prodOrderPosOperationQuantities()->groupBy(['user_id', 'machine_id', 'prod_order_pos_operation_id', 'item_state_id', 'is_final_quantity'])
                ->selectRaw('sum(quantity) as quantity, user_id, machine_id, prod_order_pos_operation_id, item_state_id, is_final_quantity')->get();

            if ($quantity->isEmpty() || $quantity->count() > 1) {
                throw new Exception('Can not confirm different operations in one save operation');
            }

            $quantity = $quantity->first();

            $quantityToExport = DataExport::query()->create([
                "name" => DataExportName::OPERATION_QUANTITIES(),
                "data" => json_encode([
                    'id' => $this->id,
                    'custom_id' => $this->custom_id,
                    'user_id_custom' => $quantity->user?->custom_id,
                    'machine_id_custom' => $quantity->machine?->custom_id,
                    'item_id_custom' => $quantity->prodOrderPosOperation?->prodOrderPos?->item?->custom_id,
                    'item_state_id_custom' => $quantity->itemState?->custom_id,
                    'item_state_group_id_custom' => $quantity->itemState?->itemStateGroup?->custom_id,
                    'item_state_type' => $quantity->itemState?->item_state_type,
                    'prod_order_id_custom' => $quantity->prodOrderPosOperation?->prodOrderPos?->prodOrder?->custom_id,
                    'prod_order_pos_pos' => $quantity->prodOrderPosOperation?->prodOrderPos?->pos,
                    'prod_order_pos_operation_id' => $quantity->prodOrderPosOperation?->id,
                    'prod_order_pos_operation_pos' => $quantity->prodOrderPosOperation?->pos,
                    'quantity' => floatval($quantity->quantity) ?? 0,
                    'is_final_confirmation' => $quantity->is_final_quantity,
                    'unit_of_measure_id_custom' => $quantity->prodOrderPosOperation?->unitOfMeasure?->custom_id,
                    'storage_location_id_custom' => $quantity->prodOrderPosOperation?->prodOrderPos->storageLocation?->custom_id,
                    'plant_id_custom' => $quantity->machine?->plant?->custom_id,
                    'consumptions' => $this->prodOrderPosOperationConsumptions->map(function (ProdOrderPosOperationConsumption $consumption) {
                        return [
                            'id' => $consumption->id,
                            'item_id_custom' => $consumption->itemPlant?->item?->custom_id,
                            'unit_of_measure_id_custom' => $consumption->unitOfMeasure?->custom_id,
                            'quantity' => floatval($consumption->quantity),
                            'serial' => $consumption->serial,
                            'batch' => $consumption->batch,
                            'consumed_datetime' => $consumption->consumed_datetime,
                            'storage_location_id_custom' => $consumption->storageLocation?->custom_id,
                            'storage_bin_id_custom' => $consumption->storageBin?->custom_id,
                            'warehouse_id_custom' => $consumption->warehouse?->custom_id,
                            'production_supply_area_id_custom' => $consumption->productionSupplyArea?->custom_id,
                            'handling_unit_id_custom' => $consumption->handlingUnit?->custom_id,
                            'manually_changed' => $consumption->manually_changed,
                        ];
                    }),
                ]),
            ]);

            (new ExportController())->singleExport($quantityToExport);
        }

        return $outputs;
    }
}

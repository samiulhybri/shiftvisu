<?php

namespace App\Models;

use App\Enums\ItemStateType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\QuantityErrorType;
use App\Enums\StockOperationType;
use App\Http\Controllers\StockController;
use Exception;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ProdOrderPosOperationQuantity extends Model
{
    use HasFactory;

    protected $table = 'prod_order_pos_operation_quantities';

    protected $guarded = [];

    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function itemState(): BelongsTo
    {
        return $this->belongsTo(ItemState::class);
    }

    #[LodataRelationship]
    public function cancellationFor(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperationQuantity::class, 'prod_order_pos_operation_quantity_id_canceled');
    }

    #[LodataRelationship]
    public function canceledBy(): HasOne
    {
        return $this->hasOne(ProdOrderPosOperationQuantity::class, 'prod_order_pos_operation_quantity_id_canceled');
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function consumptions(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationConsumption::class);
    }

    public function itemStateGoodPart(): BelongsTo
    {
        return $this->belongsTo(ItemState::class, 'item_state_id')->where('item_state_type', ItemStateType::GOOD());
    }

    /**
     * @throws ValidationException
     * @throws Exception
     */
    public function packageStocks($stockableId, $stockableType, $destinationPositionableId, $destinationPositionableType): Collection
    {
        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $this->machine->getPositionable();

        $inputs = collect([
            [
                'stockable_type' => $stockableType,
                'stockable_id' => $stockableId,
                'positionable_type' => $positionableType,
                'positionable_id' => $positionableId,
                'item_state_id' => $this->item_state_id,
                'quantity' => -$this->quantity,
                'serial' => $this->serial,
                'batch' => $this->batch,
            ]
        ]);
        $outputs = collect([
            [
                'stockable_type' => $stockableType,
                'stockable_id' => $stockableId,
                'positionable_type' => $destinationPositionableType,
                'positionable_id' => $destinationPositionableId,
                'item_state_id' => $this->item_state_id,
                'quantity' => $this->quantity,
                'serial' => $this->serial,
                'batch' => $this->batch,
            ]
        ]);

        if($destinationPositionableType == HandlingUnit::class) {
            $handlingUnit = HandlingUnit::query()->findOrFail($destinationPositionableId);
            if ($handlingUnit->getCapacityWipAndItemPlant() && ($handlingUnit->getCurrentWipAndItemPlant() + $this->quantity) > $handlingUnit->getCapacityWipAndItemPlant()) {
                throw new Exception(json_encode([
                    "type" => QuantityErrorType::QUANTITY_IN_HU_EXCEEDS_FOR_PI
                ]));
            }

            if($handlingUnit->isFullWithWipAndItemPlant()) {
                $handlingUnit->is_complete = 1;
                $handlingUnit->save();
            }
        }

        StockController::moveStocks($inputs->toArray(), $outputs->toArray(), StockOperationType::PACKAGING(), $this);

        return $outputs;
    }

    public function save(array $options = []): bool
    {
        $res = parent::save($options);

        if ($this->machine->auto_close_operation) {
            $operation = $this->prodOrderPosOperation;
            $operationQuantities = $operation->prodOrderPosOperationQuantities()->whereHas('itemStateGoodPart')->sum('quantity');

            if ($operation->quantity && $operation->quantity <= $operationQuantities) {
                $operation->prodOrderPosOperationTimes()->whereNull('end')->update([
                    "end" => now(),
                ]);

                $operation->update([
                    "status" => ProdOrderPosOperationStatus::CLOSED(),
                    "status_plan" => ProdOrderPosOperationStatus::CLOSED()
                ]);
            }
        }

        return $res;
    }
}

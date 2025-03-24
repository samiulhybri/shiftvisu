<?php

namespace App\Models;

use App\Enums\DataExportName;
use App\Http\Controllers\ExportController;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdOrderPosOperationConsumption extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    function itemState(): BelongsTo
    {
        return $this->belongsTo(ItemState::class);
    }

    #[LodataRelationship]
    function itemPlant(): BelongsTo
    {
        return $this->belongsTo(ItemPlant::class);
    }

    #[LodataRelationship]
    function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    #[LodataRelationship]
    function storageBin(): BelongsTo
    {
        return $this->belongsTo(StorageBin::class);
    }

    #[LodataRelationship]
    function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    #[LodataRelationship]
    function productionSupplyArea(): BelongsTo
    {
        return $this->belongsTo(ProductionSupplyArea::class);
    }

    #[LodataRelationship]
    function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    #[LodataRelationship]
    function handlingUnit(): BelongsTo
    {
        return $this->belongsTo(HandlingUnit::class);
    }

    #[LodataRelationship]
    function prodOrderPosOperationQuantity(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperationQuantity::class);
    }

    public function save(array $options = []): bool
    {
        $result = parent::save($options);

        if ($result)
            $this->mountEquipment();

        return $result;
    }

    private function mountEquipment()
    {
        $itemIdParent = $this->prodOrderPosOperationQuantity->prodOrderPosOperation->prodOrderPos->item_id ?? null;
        $serialParent = $this->prodOrderPosOperationQuantity->serial ?? null;
        $itemIdComponent = $this->itemPlant->item_id ?? null;
        if (strlen($this->serial ?? '') && strlen($serialParent ?? '') && $itemIdParent && $itemIdComponent) {
            $parent = Equipment::query()->updateOrCreate([
                'item_id' => $itemIdParent,
                'serial' => $serialParent,
            ]);

            $component = Equipment::query()->updateOrCreate(
                [
                    'item_id' => $itemIdComponent,
                    'serial' => $this->serial ?? '',
                ],
                [
                    'equipment_id_parent' => $parent->id,
                ]);

            if (($component->wasRecentlyCreated || $component->wasChanged('equipment_id_parent')) && $component->custom_id) {
                $dataExport = new DataExport();
                $dataExport->name = DataExportName::EQUIPMENT();
                $dataExport->data = json_encode([
                    'id' => $component->id,
                    'custom_id' => $component->custom_id,
                    'serial' => $component->serial,
                    'item_id_custom' => $component->item->custom_id,
                    'validity_end' => $component->validity_end,
                    'parent_id_custom' => $parent->custom_id ?? null,
                ]);

                $dataExport->save();

                (new ExportController())->singleExport($dataExport);
            }
        }
    }
}

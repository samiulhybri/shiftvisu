<?php

namespace App\Models;

use App\Enums\DataExportName;
use App\Http\Controllers\ExportController;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Stock extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function stockable(): MorphTo
    {
        return $this->morphTo();
    }

    public function positionable(): MorphTo
    {
        return $this->morphTo();
    }

    #[LodataRelationship]
    public function itemState(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ItemState::class);
    }

    public function hierarchy()
    {
        $this->load("stockable", "positionable");

        $stock = $this;
        $hierarchy = collect([$this]);
        while ($stock->positionable_id) {
            $stock = Stock::query()
                ->with("stockable")
                ->with("positionable")
                ->where('stockable_type', $stock->positionable_type)
                ->where('stockable_id', $stock->positionable_id)
                ->first(); // We assume that all positionables exist only once, i.e. do not have different batches/serials/states
            if (!$stock) {
                break;
            }
            $hierarchy[] = $stock;
        }
        return $hierarchy;
    }

    public function scopePSAFilter(Builder $builder, $stockableIds, $batches){
        $builder->when($stockableIds && $batches, function($q) use ($stockableIds, $batches){
            $q->where(function ($query) use ($stockableIds, $batches) {
                $query->where(function ($subQuery) use ($stockableIds) {
                    $subQuery->whereIn('stockable_id', $stockableIds)
                        ->where('stockable_type', HandlingUnit::class);
                })->orWhereIn('batch', $batches);
            });
        })
        ->when($stockableIds && !$batches, function($q) use ($stockableIds){
            $q->whereIn('stockable_id', $stockableIds)
            ->where('stockable_type', HandlingUnit::class);
        })
        ->when(!$stockableIds && $batches, function($q) use ($batches){
            $q->whereIn('batch', $batches);
        });
    }

    public function print(?ProdOrderPosOperation $operation = null) {
        $data = null;
        $dataExportName = null;

        if ($this->stockable instanceof HandlingUnit) {
            $data = [
                'prod_order_id_custom' => $operation->prodOrderPos->prodOrder->custom_id ?? null,
                'handling_unit_id_custom' => $this->stockable->custom_id ?? '',
            ];

            $dataExportName = DataExportName::PRINT_HANDLING_UNIT();
        } else if ($this->stockable instanceof ItemPlant && strlen($this->batch)) {
            $data = [
                'prod_order_id_custom' => $operation->prodOrderPos->prodOrder->custom_id ?? null,
                'batch' => $this->batch,
            ];

            $dataExportName = DataExportName::PRINT_BATCH();
        }

        if ($data && $dataExportName) {
            $now = now();
            $dataExport = DataExport::create([
                'name' => $dataExportName,
                'data' => json_encode($data),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $c = new ExportController();
            $c->singleExport($dataExport);
        }
    }
}

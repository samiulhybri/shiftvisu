<?php

namespace App\Models;

use App\Enums\DataExportName;
use App\Http\Controllers\ExportController;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\DB;

class ProdInspectionOperation extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['is_open'];

    #[LodataRelationship]
    public function inspectionOperationCharacteristics(): MorphMany
    {
        return $this->morphMany(InspectionOperationCharacteristic::class, 'characteristicable');
    }

    #[LodataRelationship]
    public function prodInspectionOperationResources(): HasMany
    {
        return $this->hasMany(ProdInspectionOperationResource::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }

    public function getInspectionLot()
    {
        return InspectionLot::query()->whereHas('inspectable', function ($query) {
            $query->whereHas('prodOrderPosOperations', function ($subQuery) {
                $subQuery->where('id', $this->prod_order_pos_operation_id);
            });
        })->first();
    }

    public function createInspectionPoint(?int $machineCycleTrigger = null): ?InspectionPoint
    {
        $userId = auth()->id ?? null;
        $inspectionLot = $this->getInspectionLot();

        if (!$inspectionLot)
            return null;

        DB::beginTransaction();
        try {
            $inspectionPoint = InspectionPoint::query()->create([
                'inspection_lot_id' => $inspectionLot->id ?? null,
                'inspectable_type' => ProdInspectionOperation::class,
                'inspectable_id' => $this->id,
                'is_automatically_triggered' => !$userId,
                'user_id_creator' => $userId,
                'machine_cycle_id_trigger' => $machineCycleTrigger,
                'registered_datetime' => now(),
            ]);

            foreach ($this->inspectionOperationCharacteristics()->get() as $operationCharacteristic) {
                InspectionPointCharacteristic::query()->create([
                    'inspection_point_id' => $inspectionPoint->id,
                    'inspection_operation_characteristic_id' => $operationCharacteristic->id,
                ]);
            }


            $data = $inspectionPoint->getDataExportsObject();

            $now = now();
            $dataExport = DataExport::create([
                'name' => DataExportName::INSPECTION_POINT(),
                'data' => json_encode($data),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            (new ExportController())->singleExport($dataExport);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $inspectionPoint;
    }

    #[LodataRelationship]
    public function inspectionPoints(): MorphMany
    {
        return $this->morphMany(InspectionPoint::class, 'inspectable');
    }

    public function hasOpenInspectionPoints()
    {
        foreach ($this->inspectionPoints as $inspectionPoint) {
            if (!$inspectionPoint->isCompleted()) {
                return true;
            }
        }

        return false;
    }

    public function getIsOpenAttribute()
    {
        return $this->hasOpenInspectionPoints();
    }
}

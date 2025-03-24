<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InspectionPoint extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function inspectionPointCharacteristics(): HasMany
    {
        return $this->hasMany(InspectionPointCharacteristic::class);
    }

    #[LodataRelationship]
    public function inspectionLot(): BelongsTo
    {
        return $this->belongsTo(InspectionLot::class);
    }

    #[LodataRelationship]
    public function userCreator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_creator');
    }

    public function inspectable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isCompleted(): bool
    {
        foreach ($this->inspectionPointCharacteristics as $inspectionPointCharacteristics) {
            $inspectionOperationCharacteristics = InspectionOperationCharacteristic::find($inspectionPointCharacteristics->inspection_operation_characteristic_id);

            if ($inspectionOperationCharacteristics->is_required == true) {
                if ($inspectionOperationCharacteristics->is_quantitative == true && !isset($inspectionPointCharacteristics->value)) {
                    return false;
                } elseif ($inspectionOperationCharacteristics->is_quantitative == false && $inspectionPointCharacteristics->inspectionPointCharacteristicOptions->count() == 0) {
                    return false;
                }
            }
        }

        return true;
    }

    public function getDataExportsObject(): array
    {
        $characteristics = collect();
        foreach ($this->inspectionPointCharacteristics()->with([
            'inspectionOperationCharacteristic',
            'inspectionPointCharacteristicOptions',
            'inspectionPointCharacteristicOptions.inspectionOperationCharacteristicOption',
            'inspectionPointCharacteristicOptions.inspectionOperationCharacteristicOption.attributeSetOption.attributeSet',
        ])->get() as $inspectionPointCharacteristic) {
            $inspectionOperationCharacteristic = $inspectionPointCharacteristic->inspectionOperationCharacteristic;
            $inspectionPointCharacteristicOptions = $inspectionPointCharacteristic->inspectionPointCharacteristicOptions;
            $characteristics->push([
                'inspection_operation_characteristic_pos' => $inspectionOperationCharacteristic->pos,
                'is_quantitative' => $inspectionOperationCharacteristic->is_quantitative,
                'inspection_point_characteristic_id' => $inspectionPointCharacteristic->id,
                'is_exported' => $inspectionPointCharacteristic->is_exported,
                'value' => $inspectionPointCharacteristic->value,
                'valuation_result' => $inspectionPointCharacteristic->valuationResult()->value,
                'confirmation_number' => $inspectionPointCharacteristic->confirmation_number,
                'note' => $inspectionPointCharacteristic->field_note,
                //TODO: User Id needs to be added
                'user_id_inspector_custom' => null,
                'options' => $inspectionPointCharacteristicOptions->map(function (InspectionPointCharacteristicOption $inspectionPointCharacteristicOption) {
                    return [
                        'custom_id' => $inspectionPointCharacteristicOption->inspectionOperationCharacteristicOption->custom_id,
                        'attribute_set_custom_id' => $inspectionPointCharacteristicOption->inspectionOperationCharacteristicOption->attributeSetOption->attributeSet->custom_id ?? null,
                        'attribute_set_internal_id' => $inspectionPointCharacteristicOption->inspectionOperationCharacteristicOption->attributeSetOption->attributeSet->internal_id ?? null,
                        'valuation' => $inspectionPointCharacteristicOption->valuation()->value,
                    ];
                })->toArray(),
            ]);
        }

        return [
            "inspection_point_id" => $this->id,
            "inspection_point_id_custom" => $this->custom_id ?? null,
            "inspection_lot_id_custom" => $this->inspectionLot->custom_id ?? null,
            "user_id_creator_custom" => $this->userCreator->custom_id ?? null,
            "registered_datetime" => $this->registered_datetime,
            "prod_inspection_operation_internal_id" => ($this->inspectable_type == ProdInspectionOperation::class) ? $this->inspectable->internal_id : null,
            "characteristics" => $characteristics->toArray(),
        ];
    }
}

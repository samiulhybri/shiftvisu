<?php

namespace App\Models;

use App\Enums\AttributeSetOptionValuation;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionPointCharacteristic extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function inspectionPoint(): BelongsTo
    {
        return $this->belongsTo(InspectionPoint::class);
    }

    #[LodataRelationship]
    public function inspectionOperationCharacteristic(): BelongsTo
    {
        return $this->belongsTo(InspectionOperationCharacteristic::class);
    }

    #[LodataRelationship]
    public function inspectionOperationCharacteristicOptions(): HasMany
    {
        return $this->hasMany(InspectionPointCharacteristicOption::class);
    }

    #[LodataRelationship]
    public function inspectionPointCharacteristicOptions(): HasMany
    {
        return $this->hasMany(InspectionPointCharacteristicOption::class);
    }

    public function lastModifiedBy()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function valuationResult(): AttributeSetOptionValuation
    {
        if($this->inspectionOperationCharacteristic->is_quantitative) {
            $lowerLimitOk = true;
            if($this->inspectionOperationCharacteristic->value_lower_limit)
                $lowerLimitOk = $this->value >= $this->inspectionOperationCharacteristic->value_lower_limit;

            $upperLimitOk = true;
            if($this->inspectionOperationCharacteristic->value_upper_limit)
                $upperLimitOk = $this->value <= $this->inspectionOperationCharacteristic->value_upper_limit;

            return ($lowerLimitOk && $upperLimitOk) ? AttributeSetOptionValuation::ACCEPT : AttributeSetOptionValuation::REJECT;
        }
        else {
            foreach ($this->inspectionPointCharacteristicOptions as $inspectionPointCharacteristicOption) {
                if($inspectionPointCharacteristicOption->valuation() === AttributeSetOptionValuation::REJECT)
                    return AttributeSetOptionValuation::REJECT;
            }
        }

        return AttributeSetOptionValuation::ACCEPT;
    }
}

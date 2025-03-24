<?php

namespace App\Models;

use App\Enums\AttributeSetOptionValuation;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionPointCharacteristicOption extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function inspectionPointCharacteristic(): BelongsTo
    {
        return $this->belongsTo(InspectionPointCharacteristic::class);
    }

    #[LodataRelationship]
    public function inspectionOperationCharacteristicOption(): BelongsTo
    {
        return $this->belongsTo(InspectionOperationCharacteristicOption::class);
    }

    public function valuation(): AttributeSetOptionValuation
    {
        return AttributeSetOptionValuation::tryFrom($this->inspectionOperationCharacteristicOption->valuation) ?? AttributeSetOptionValuation::REJECT;
    }
}

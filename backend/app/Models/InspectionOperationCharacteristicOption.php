<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionOperationCharacteristicOption extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function inspectionOperationCharacteristic(): BelongsTo
    {
        return $this->belongsTo(InspectionOperationCharacteristic::class);
    }

    #[LodataRelationship]
    public function inspectionPointCharacteristicOptions(): HasMany
    {
        return $this->hasMany(InspectionPointCharacteristicOption::class);
    }

    #[LodataRelationship]
    public function attributeSetOption(): BelongsTo
    {
        return $this->belongsTo(AttributeSetOption::class);
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionOperationCharacteristic extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function inspectionOperationCharacteristicOptions(): HasMany
    {
        return $this->hasMany(InspectionOperationCharacteristicOption::class);
    }

    #[LodataRelationship]
    public function inspectionPointCharacteristics(): HasMany
    {
        return $this->hasMany(InspectionPointCharacteristic::class);
    }

    #[LodataRelationship]
    public function inspectionPointCharacteristicOptions()
    {
        return $this->hasMany(InspectionPointCharacteristicOption::class);
    }

    public function unitOfMeasure()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id_value');
    }

    public function inspectionSpecificationImportanceCode()
    {
        return $this->belongsTo(InspectionSpecificationImportanceCode::class);
    }

    public function userGroup()
    {
        return $this->belongsTo(UserGroup::class);
    }
}

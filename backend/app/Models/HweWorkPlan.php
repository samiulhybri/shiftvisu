<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweWorkPlan extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function heatTreatments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweWorkPlanHeatTreatment::class);
    }

    #[LodataRelationship]
    public function additionalHeatTreatments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweWorkPlanAdditionalHeatTreatment::class);
    }
}

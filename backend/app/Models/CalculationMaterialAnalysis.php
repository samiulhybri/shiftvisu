<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationMaterialAnalysis extends Model
{
    use HasFactory;
    protected $guarded = [];

    #[LodataRelationship]
    public function materials(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'calculation_material_analysis_material', 'calculation_material_analysis_id', 'material_id');
    }

    #[LodataRelationship]
    public function chemAnalyses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationChemicalAnalysis::class);
    }
}

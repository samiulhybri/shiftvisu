<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialAnalysis extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function materials(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'material_analysis_material', 'material_analysis_id', 'material_id');
    }

    #[LodataRelationship]
    public function chemAnalyses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(ChemAnalysis::class, 'material_analysis_chem_analyses', 'material_analysis_id', 'chem_analysis_id');
    }

}

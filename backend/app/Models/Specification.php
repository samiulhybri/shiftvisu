<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specification extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function metallography(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Metallography::class);
    }
    
    #[LodataRelationship]
    public function documentation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Documentation::class);
    }

    #[LodataRelationship]
    public function testingScope(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(TestingScope::class);
    }

    #[LodataRelationship]
    public function nonDestructiveTesting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(NonDestructiveTesting::class);
    }
    #[LodataRelationship]
    public function material(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
    #[LodataRelationship]
    public function hardenabilityRange(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HardenabilityRange::class, 'hardenability_range_id');
    }
    #[LodataRelationship]
    public function materialAnalysis(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MaterialAnalysis::class);
    }
    #[LodataRelationship]
    public function deformation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Deformation::class);
    }

    #[LodataRelationship]
    public function residualMaterial(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ResidualMaterial::class);
    }
    #[LodataRelationship]
    public function hweWorkPlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HweWorkPlan::class);
    }
}

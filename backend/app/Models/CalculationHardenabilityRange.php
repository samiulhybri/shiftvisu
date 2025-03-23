<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationHardenabilityRange extends Model
{
    use HasFactory;
    protected $guarded = [];
    #[LodataRelationship]
    public function materials(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'calculation_hardenability_range_material', 'calculation_hardenability_range_id', 'material_id');
    }
}

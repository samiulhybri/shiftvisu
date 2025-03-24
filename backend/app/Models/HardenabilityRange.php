<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HardenabilityRange extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function materials(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'hardenability_range_material', 'hardenability_range_id', 'material_id');
    }
}

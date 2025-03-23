<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VtNorm extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function testTechniques(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
       return $this->hasMany(VtNormTestTechnique::class);
    }

    #[LodataRelationship]
    public function auxiliaryMeans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(VtNormAuxiliaryMean::class);
    }
}

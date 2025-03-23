<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MtNorm extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function controlUnits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MtNormControlUnit::class);
    }
}

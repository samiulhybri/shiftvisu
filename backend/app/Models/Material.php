<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function materialDatabases(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MaterialDatabase::class);
    }

    #[LodataRelationship]
    public function hardenabilityRanges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasmany(HardenabilityRange::class);
    }

    #[LodataRelationship]
    public function materialAnalyses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasmany(MaterialAnalysis::class);
    }

}

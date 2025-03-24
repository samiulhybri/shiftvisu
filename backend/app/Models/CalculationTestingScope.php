<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationTestingScope extends Model
{
    use HasFactory;
    protected $guarded = [];
    #[LodataRelationship]
    public function attestationEntities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeAttestationEntity::class);
    }
    #[LodataRelationship]
    public function accordingToTensileTests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeAccordingToTensileTest::class);
    }
    #[LodataRelationship]
    public function accordingToImpactTests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeAccordingToImpactTest::class);
    }
    #[LodataRelationship]
    public function meltingTypes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeMeltingType::class);
    }
    #[LodataRelationship]
    public function classifiedBies(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeClassifiedBy::class);
    }

    #[LodataRelationship]
    public function sampleDepths(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationTestingScopeSampleDepth::class);
    }
}

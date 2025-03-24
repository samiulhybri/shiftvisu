<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestingScope extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function attestationEntities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
       return $this->hasMany(TestingScopeAttestationEntity::class);
    }
    #[LodataRelationship]
    public function accordingToTensileTests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TestingScopeAccordingToTensileTest::class);
    }
    #[LodataRelationship]
    public function accordingToImpactTests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TestingScopeAccordingToImpactTest::class);
    }
    #[LodataRelationship]
    public function meltingTypes()
    {
        return $this->hasMany(TestingScopeMeltingType::class);
    }

    #[LodataRelationship]
    public function classifiedBies()
    {
        return $this->hasMany(TestingScopeClassifiedBy::class);
    }    
    
    #[LodataRelationship]
    public function sampleDepths(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TestingScopeSampleDepth::class);
    }
}

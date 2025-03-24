<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationNonDestructiveTesting extends Model
{
    protected $guarded = [];
    use HasFactory;
    #[LodataRelationship]
    public function attestationEntities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationNonDestructiveTestingAttestationEntity::class);
    }
    #[LodataRelationship]
    public function calculationNonDestructiveNorm(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationNonDestructiveNorm::class);
    }

    #[LodataRelationship]
    public function nonDestructiveNorm(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationNonDestructiveNorm::class);
    }
    #[LodataRelationship]
    public function usNorm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UsNorm::class);
    }

}

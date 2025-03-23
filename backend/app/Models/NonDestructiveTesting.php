<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NonDestructiveTesting extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function attestationEntities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NonDestructiveTestingAttestationEntity::class);
    }

    #[LodataRelationship]
    public function nonDestructiveNorm(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(NonDestructiveNorm::class);
    }

    #[LodataRelationship]
    public function usNorm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UsNorm::class);
    }
}

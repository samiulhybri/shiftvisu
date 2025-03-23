<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsNorm extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function adjustments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UsNormAdjustment::class);
    }

    #[LodataRelationship]
    public function usNormTestScopes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UsNormTestScope::class);
    }

    #[LodataRelationship]
    public function usNormTestSections(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UsNormTestSection::class);
    }

    #[LodataRelationship]
    public function usNormRatings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UsNormRating::class);
    }
}

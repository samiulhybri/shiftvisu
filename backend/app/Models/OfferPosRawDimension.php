<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfferPosRawDimension extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function rawDimensionTypes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RawDimensionType::class, 'offer_pos_raw_dimensions_id');
    }

    #[LodataRelationship]
    public function offerPosDimensionShaftUpsetParts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPosDimensionShaftUpsetPart::class);
    }

    #[LodataRelationship]
    public function offerPosDimensionUpsetPartForgedBeams(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPosDimensionUpsetPartForgedBeam::class);
    }
}

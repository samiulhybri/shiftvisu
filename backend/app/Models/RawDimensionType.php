<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawDimensionType extends Model
{
    use HasFactory;
    protected $guarded = [];

    #[LodataRelationship]
    public function offerPosRawDimensions(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(OfferPosRawDimension::class);
    }

}

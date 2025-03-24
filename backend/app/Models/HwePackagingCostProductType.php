<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HwePackagingCostProductType extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function hwePackagingCost(): \Illuminate\Database\Eloquent\Relations\BelongsTo {
        return $this->belongsTo(HwePackagingCost::class);
    }
}

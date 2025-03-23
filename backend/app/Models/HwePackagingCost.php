<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HwePackagingCost extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function hwePackagingCostProductTypes(): \Illuminate\Database\Eloquent\Relations\HasMany {
        return $this->hasMany(HwePackagingCostProductType::class);
    }
}

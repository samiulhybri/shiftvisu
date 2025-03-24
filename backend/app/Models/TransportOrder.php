<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportOrder extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function transportOrderPos(): HasMany
    {
        return $this->hasMany(TransportOrderPos::class);
    }
}

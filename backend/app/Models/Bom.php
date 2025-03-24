<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bom extends Model
{
    use HasFactory;

    public function bomPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BomPos::class);
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Item::class);
    }

    #[LodataRelationship()]
    public function topItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Item::class);  //Check, is bom associated with any item or not
    }
}

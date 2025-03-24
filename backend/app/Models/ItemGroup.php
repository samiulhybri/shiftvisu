<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class ItemGroup extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Item::class);
    }

    #[LodataRelationship]
    public function topItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Item::class);  //Check, is Item group associated with any Item or not
    }
}

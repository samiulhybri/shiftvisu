<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemStateMachine extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function itemState()
    {
        return $this->belongsTo(ItemState::class);
    }
}

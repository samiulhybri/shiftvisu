<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    public function capacities(): MorphMany
    {
        return $this->morphMany(Capacity::class, 'capacitable');
    }

    #[LodataRelationship]
    public function itemState(): BelongsTo
    {
        return $this->belongsTo(ItemState::class, 'item_state_default_good_id');
    }
}

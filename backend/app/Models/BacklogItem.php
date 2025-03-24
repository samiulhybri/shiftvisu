<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class BacklogItem extends Model
{
    use HasFactory;

    /**
     * Returns the standard bom for this item
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    #[LodataRelationship]
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Returns the calculated weeks
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function backlogItemWeeks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BacklogItemWeek::class);
    }
}

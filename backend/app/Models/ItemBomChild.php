<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemBomChild extends Model
{
    use HasFactory;

    /**
     * Returns the standard bom for this item
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class);
    }


    /**
     * Returns the standard bom for this item
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function childItem(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class, 'child_item_id');
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProdOrderPosOperationResource extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    function item(): BelongsTo{
        return $this->belongsTo(Item::class,'item_id_tool');
    }

    #[LodataRelationship]
    function equipment(): BelongsTo{
        return $this->belongsTo(Equipment::class);
    }
}

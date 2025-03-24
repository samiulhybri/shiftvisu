<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualiEvent extends Model
{
    protected $guarded = [];

    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftModelShift extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function shiftModel(): BelongsTo
    {
        return $this->belongsTo(ShiftModel::class);
    }

    #[LodataRelationship]
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }
}
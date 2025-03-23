<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftModel extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function shifts(): BelongsToMany
    {
        return $this->belongsToMany(Shift::class, "shift_model_shifts")->withPivot("day_of_week");
    }

    #[LodataRelationship]
    public function shiftModelShifts(): HasMany
    {
        return $this->hasMany(ShiftModelShift::class);
    }
}

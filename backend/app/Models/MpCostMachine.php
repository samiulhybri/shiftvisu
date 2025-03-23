<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MpCostMachine extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'mp_cost_id',
    ];

    #[LodataRelationship]
    public function machine(): BelongsTo {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function mpCost(): HasOne {
        return $this->hasOne(MpCost::class);
    }
}

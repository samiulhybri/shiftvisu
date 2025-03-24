<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MachineUserPlanTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'user_id',
        'capacity_id',
        'end_time',
        'start_time'
    ];

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
    #[LodataRelationship]
    public function capacity(): BelongsTo
    {
        return $this->belongsTo(Capacity::class);
    }
}

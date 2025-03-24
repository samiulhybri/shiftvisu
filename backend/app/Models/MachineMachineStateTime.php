<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MachineMachineStateTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'machine_state_id',
        'end',
        'start'
    ];

    #[LodataRelationship]
    public function machineState(): BelongsTo
    {
        return $this->belongsTo(MachineState::class);
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}

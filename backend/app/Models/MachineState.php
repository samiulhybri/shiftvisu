<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MachineState extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function machineStateGroup(): BelongsTo
    {
        return $this->belongsTo(MachineStateGroup::class);
    }
    
    #[LodataRelationship]
    public function machines(): BelongsToMany
    {
        return $this->belongsToMany(Machine::class, 'machine_machine_states');
    }

    #[LodataRelationship]
    public function machineMachineStateTimes(): HasMany
    {
        return $this->hasMany(MachineMachineStateTime::class);
    }
}

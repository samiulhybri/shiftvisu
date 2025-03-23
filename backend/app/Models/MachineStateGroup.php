<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineStateGroup extends Model
{
    use HasFactory;

    #[LodataRelationship()]
    public function topMachineState(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MachineState::class);  //Check, is machine state group associated with any machine state or not
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Flat3\Lodata\Attributes\LodataRelationship;

class MaterialConsumption extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function item(): BelongsTo {
        return $this->belongsTo(Item::class)->where("is_alloy", 1);
    }

    #[LodataRelationship]
    public function furnace(): BelongsTo{
        return $this->belongsTo(Machine::class)->where("is_furnace", 1);
    }

    #[LodataRelationship]
    public function user(){
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function machines(): BelongsToMany{
        return  $this->belongsToMany(Machine::class, 'material_consumption_machines')->where('is_casting_machine', 1);
    }

    #[LodataRelationship]
    public function machineConsumptions(): HasMany{
        return $this->hasMany(MaterialConsumptionMachines::class);
    }
}

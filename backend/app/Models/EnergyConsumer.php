<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EnergyConsumer extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function energyConsumerMachines(): HasMany{
        return $this->hasMany(EnergyConsumerMachine::class);
    }

    #[LodataRelationship]
    public function energyConsumerGroups(): BelongsTo {
        return $this->belongsTo(EnergyConsumerGroup::class, 'energy_consumer_group_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class EnergyConsumerGroup extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function energyConsumers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EnergyConsumer::class);
    }

    #[LodataRelationship]
    public function topEnergyConsumer(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(EnergyConsumer::class); //Check, is Energy consumer group associated with any Energy consumer or not
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class EnergyMeter extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function energyConsumer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(EnergyConsumer::class);
    }

}

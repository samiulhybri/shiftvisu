<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EnergyGateway extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function energyMeters(): HasMany{
        return $this->hasMany(EnergyMeter::class);
    }
}

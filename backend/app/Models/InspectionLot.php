<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InspectionLot extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function inspectable(): MorphTo
    {
        return $this->morphTo();
    }

    #[LodataRelationship]
    public function inspectionPoints(): HasMany
    {
        return $this->hasMany(InspectionPoint::class);
    }
}

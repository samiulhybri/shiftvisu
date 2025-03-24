<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HweAdditionalCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'hwe_cost_type',
        'price',
        'unit_of_measure_id',
    ];

    #[LodataRelationship]
    public function unitOfMeasure(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id');
    }

    #[LodataRelationship]
    public function hweAdditionalCostTriggers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweAdditionalCostTrigger::class,);
    }
}

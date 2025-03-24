<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationHeatTreatment extends Model
{
    use HasFactory;
    protected $guarded = [];

    #[LodataRelationship]
    public function calculation()
    {
        return $this->belongsTo(Calculation::class);
    }
}

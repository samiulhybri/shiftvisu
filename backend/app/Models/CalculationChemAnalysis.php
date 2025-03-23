<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationChemAnalysis extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function calculation()
    {
        return $this->belongsTo(Calculation::class);
    }
}

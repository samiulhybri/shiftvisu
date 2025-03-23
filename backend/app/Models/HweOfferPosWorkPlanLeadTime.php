<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
class HweOfferPosWorkPlanLeadTime extends Model
{
    use HasFactory;
    
    #[LodataRelationship]
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}

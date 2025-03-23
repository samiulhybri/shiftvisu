<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdLot extends Model
{
    use HasFactory;
    protected $fillable =  [
        'is_cooldown_needed'
    ];

    #[LodataRelationship]
    public function prodOrderPosOperations()
    {
        return $this->hasMany(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}

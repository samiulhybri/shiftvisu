<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdOrderPosSerial extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship()]
    public function prodOrderPos()
    {
        return $this->belongsTo(ProdOrderPos::class);
    }
}

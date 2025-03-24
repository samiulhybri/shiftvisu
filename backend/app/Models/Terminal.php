<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class Terminal extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function hall(): \Illuminate\Database\Eloquent\Relations\belongsTo
    {
        return $this->belongsTo(Hall::class);
    }

    #[LodataRelationship]
    public function printer(): \Illuminate\Database\Eloquent\Relations\belongsTo
    {
        return $this->belongsTo(Printer::class);
    }
}

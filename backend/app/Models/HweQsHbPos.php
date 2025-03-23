<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsHbPos extends Model
{
    use HasFactory;
    #protected $connection = 'abc';
    #[LodataRelationship]
    public function hweQsHbs(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(HweQsHb::class);
    }
}

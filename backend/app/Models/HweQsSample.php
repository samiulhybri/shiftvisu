<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsSample extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
    ];

    #[LodataRelationship]
    public function samplesProdOrderPos()
    {
        return $this->hasMany(HweQsSamplesProdOrderPos::class, 'hwe_qs_sample_id');
    }
}

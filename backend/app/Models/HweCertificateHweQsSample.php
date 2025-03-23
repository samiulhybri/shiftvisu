<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweCertificateHweQsSample extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function hweQsSample(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HweQsSample::class);
    }
}

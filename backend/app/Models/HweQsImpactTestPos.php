<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsImpactTestPos extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function hweQsImpactTest(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HweQsImpactTest::class, 'hwe_qs_impact_test_id');
    }

}

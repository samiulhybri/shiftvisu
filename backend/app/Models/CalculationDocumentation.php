<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationDocumentation extends Model
{
    use HasFactory;
     protected $guarded = [];

    #[LodataRelationship]
    public function certificates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CalculationDocumentationCertificate::class);
    }
}

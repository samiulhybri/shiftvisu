<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PotentialClassification extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StandardValueKey extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function standardValueKeyActivityTypes(): HasMany
    {
        return $this->hasMany(StandardValueKeyActivityType::class);
    }
}

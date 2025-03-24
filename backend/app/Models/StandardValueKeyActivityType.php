<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StandardValueKeyActivityType extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function standardValueKey(): BelongsTo
    {
        return $this->belongsTo(StandardValueKey::class);
    }
}

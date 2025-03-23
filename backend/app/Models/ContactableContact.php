<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactableContact extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}

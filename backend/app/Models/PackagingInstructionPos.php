<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PackagingInstructionPos extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function packable(): MorphTo
    {
        return $this->morphTo('packable');
    }

    #[LodataRelationship]
    public function packagingInstruction(): BelongsTo
    {
        return $this->belongsTo(PackagingInstruction::class);
    }
}

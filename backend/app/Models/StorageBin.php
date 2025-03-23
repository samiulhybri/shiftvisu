<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageBin extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function storageType(): BelongsTo
    {
        return $this->belongsTo(StorageType::class);
    }
}

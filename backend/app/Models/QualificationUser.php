<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualificationUser extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function qualification(): BelongsTo
    {
        return $this->belongsTo(Qualification::class, 'qualification_id');
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

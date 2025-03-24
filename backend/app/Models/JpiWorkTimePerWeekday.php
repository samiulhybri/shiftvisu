<?php

namespace App\Models;

use App\Models\Model\JpiResource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JpiWorkTimePerWeekday extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function resource(): BelongsTo
    {
        return $this->belongsTo(JpiResource::class);
    }
}

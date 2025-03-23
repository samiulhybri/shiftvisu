<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttributeSet extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function plant() : BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    public function attributeSetOptions() : HasMany
    {
        return $this->hasMany(AttributeSetOption::class);
    }
}

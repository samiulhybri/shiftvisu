<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class StockOperation extends Model
{
    use HasFactory;

    public function context(): MorphTo
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stockOperationInputs()
    {
        return $this->hasMany(StockOperationInput::class);
    }

    public function stockOperationOutputs()
    {
        return $this->hasMany(StockOperationOutput::class);
    }
}

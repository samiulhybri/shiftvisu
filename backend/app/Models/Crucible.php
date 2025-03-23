<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Crucible extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'name',
        'capacity'
    ];

    public function materialConsumptions(): HasMany{
        return $this->hasMany(MaterialConsumption::class);
    }
}

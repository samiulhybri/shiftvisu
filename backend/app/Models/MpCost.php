<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MpCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'cost_group',
        'cost_sub_group',
        'cost_type',
        'name'
    ];

    #[LodataRelationship]
    public function mpOfferPos(): HasMany {
        return $this->hasMany(MpOfferPos::class);
    }

    #[LodataRelationship]
    public function mpCostMachines(): HasMany {
        return $this->hasMany(MpCostMachine::class);
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackagingInstruction extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function packagingInstructionPos(): HasMany
    {
        return $this->hasMany(PackagingInstructionPos::class);
    }
    
    #[LodataRelationship]
    public function handlingUnits(): HasMany
    {
        return $this->hasMany(HandlingUnit::class);
    }
}

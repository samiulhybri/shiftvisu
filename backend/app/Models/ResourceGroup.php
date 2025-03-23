<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ResourceGroup extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function machines(): BelongsToMany
    {
        return $this->belongsToMany(Machine::class, 'machine_resource_groups');
    }

    #[LodataRelationship]
    public function hall(): BelongsTo
    {
        return $this->belongsTo(Hall::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class Metallography extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function cleanlinessDeterminationAccordingTo(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
       return $this->hasMany(MetallographyCleanlinessDeterminationAccording::class);
    }
}

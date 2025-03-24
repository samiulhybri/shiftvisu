<?php

namespace App\Models\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JpiResourceCategory extends Model
{
    use HasFactory;
    protected $guarded = [];
    
    #[LodataRelationship]

    public function jpiResourceCategoryGroups(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JpiResourceGroup::class);
    }
}

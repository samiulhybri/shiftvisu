<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemStateGroup extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'is_active',
        'custom_id',
        'name',
    ];

    #[LodataRelationship]
    public function itemState(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ItemState::class);
    }

    #[LodataRelationship]
    public function topItemState(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ItemState::class); //Check, is Item State Group associated with any Item State or not
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TpmGroup extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'name',
    ];

    public function tpmSubGroups(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TpmSubGroup::class);
    }

    #[LodataRelationship()]
    public function topTpmSubGroup(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(TpmSubGroup::class);  //Check, is TPM group associated with any TPM Sub Group or not
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineGroup extends Model
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
    #[LodataRelationship]
    public function machines(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Machine::class);
    }

    #[LodataRelationship]
    public function topMachine(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Machine::class);  //Check, is machine group associated with any machine or not
    }

    #[LodataRelationship]
    public function prodOrderPosOperations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPosOperation::class);
    }
    #[LodataRelationship]
    public function hall(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Hall::class);
    }
    #[LodataRelationship]
    public function costCenter(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }
}

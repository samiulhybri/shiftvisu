<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperationPlan extends Model
{
    use HasFactory;

    static public $snakeAttributes = false;

    protected $guarded = [];

    #[LodataRelationship]
    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Item::class);
    }

    #[LodataRelationship]
    public function topItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Item::class);  //Check, is Operation plan associated with any item or not
    }

    #[LodataRelationship]
    public function operationPlanPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OperationPlanPos::class);
    }
    #[LodataRelationship]
    public function prodOrderPosOperations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPosOperation::class, 'operation_plan_id_origin');
    }

    #[LodataRelationship]
    public function calculations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Calculation::class);
    }
}

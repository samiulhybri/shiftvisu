<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class OperationPlanPos extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia{
        media as protected trait_media;
    }

    static public $snakeAttributes = false;

    protected $guarded = [];

    #[LodataRelationship]
    public function machine(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
    #[LodataRelationship]
    public function machineGroup(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MachineGroup::class);
    }

    public function operationPlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(OperationPlan::class);
    }

    #[LodataRelationship]
    public function operationPlanPosHeatTreatments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OperationPlanPosHeatTreatment::class, 'operation_plan_pos_id');
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }
    #[LodataRelationship]
    public function prodOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class, 'operation_plan_pos_id_origin');
    }
}

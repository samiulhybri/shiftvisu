<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdOrderPosOperationHandlingUnit extends Model
{
    use HasFactory;
    protected $fillable = ['handling_unit_id', 'machine_id', 'type', 'prod_order_pos_operation_id'];

    #[LodataRelationship]
    public function handlingUnit(): BelongsTo
    {
        return $this->belongsTo(HandlingUnit::class);
    }
    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }
}

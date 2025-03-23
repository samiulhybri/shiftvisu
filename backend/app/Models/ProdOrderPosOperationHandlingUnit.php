<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdOrderPosOperationHandlingUnit extends Model
{
    use HasFactory;
    protected $fillable = ['handling_unit_id', 'machine_id', 'type', 'prod_order_pos_operation_id'];

    #[LodataRelationship]
    public function handlingUnit(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HandlingUnit::class);
    }
}

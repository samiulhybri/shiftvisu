<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdOrderPosOperationUnloadedQuantity extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'prod_order_pos_operation_id',
        'prod_order_pos_operation_loaded_quantity_id',
        'quantity',
        'date',
        'user_id'
    ];

    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationLoadedQuantity(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperationLoadedQuantity::class);
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

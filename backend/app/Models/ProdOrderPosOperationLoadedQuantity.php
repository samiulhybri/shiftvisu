<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdOrderPosOperationLoadedQuantity extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'prod_order_pos_operation_id',
        'quantity',
        'date',
        'user_id',
        'is_unloaded'
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

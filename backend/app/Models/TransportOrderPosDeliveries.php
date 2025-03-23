<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransportOrderPosDeliveries extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'transport_order_pos_id', 'delivered_quantity', 'is_completed', 'transportable_type', 'transportable_id', 'batch', 'serial'];

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transportOrderPos(): BelongsTo
    {
        return $this->belongsTo(TransportOrderPos::class);
    }
}

<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ProdOrderPosOperationDelivery extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'prod_order_pos_operation_id', 'quantity','is_completed'];

    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

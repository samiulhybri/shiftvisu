<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdOrderPosOperationBatch extends Model
{
    use HasFactory;
    protected $fillable = ['batch', 'machine_id', 'type', 'prod_order_pos_operation_id'];
}

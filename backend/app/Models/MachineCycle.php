<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class MachineCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'registered_datetime',
        'type',
        'prod_order_pos_operation_id',
        'quantity',
        'batch',
        'serial',
        'confirmed_datetime'
    ];

    #[LodataRelationship]
    public function prodOrderPosOperations()
    {
        return $this->belongsTo(ProdOrderPosOperation::class, 'machine_id', 'machine_id');
    }
}

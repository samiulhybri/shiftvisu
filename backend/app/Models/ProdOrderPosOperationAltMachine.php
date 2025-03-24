<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdOrderPosOperationAltMachine extends Model
{
    use HasFactory;

    protected $fillable = [
        'prod_order_pos_operation_id',
        'pos',
        'machine_id',
        'te',
        'reference_nr',
    ];
    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}

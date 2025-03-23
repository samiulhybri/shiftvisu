<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MachineProdOrderPosOperationTime extends Model
{
    use HasFactory;

    protected $guarded = [];

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
    public function packagingInstruction(): BelongsTo
    {
        return $this->belongsTo(PackagingInstruction::class);
    }
    
    #[LodataRelationship]
    public function itemPackaging(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_packaging');
    }

    #[LodataRelationship]
    public function packagingInstructionParent(): BelongsTo
    {
        return $this->belongsTo(PackagingInstruction::class, 'packaging_instruction_id_parent');
    }
    
    #[LodataRelationship]
    public function itemPackagingParent(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_packaging_parent');
    }
}

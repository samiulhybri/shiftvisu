<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRegisteredTime extends Model
{
    use HasFactory;
    
    #[LodataRelationship()]
    public function prodOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }

    #[LodataRelationship()]
    public function standardValueKeyActivityType(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(StandardValueKeyActivityType::class);
    }
}

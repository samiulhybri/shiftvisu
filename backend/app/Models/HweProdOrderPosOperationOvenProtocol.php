<?php

namespace App\Models;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweProdOrderPosOperationOvenProtocol extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
    #[LodataRelationship]
    public function sourceMachine()
    {
        return $this->belongsTo(Machine::class, 'machine_id_source');
    }
    #[LodataRelationship]
    public function prodOrderPosOperation()
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }
}

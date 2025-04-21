<?php

namespace App\Models;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageLocation extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    
    #[LodataRelationship]
    public function transportOrderType()
    {
        return $this->belongsTo(TransportOrderType::class);
    }
}

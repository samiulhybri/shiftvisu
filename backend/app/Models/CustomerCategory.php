<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class CustomerCategory extends Model
{
    use HasFactory;

    #[LodataRelationship()]
    public function topCustomer(): \Illuminate\Database\Eloquent\Relations\belongsTo
    {
        return $this->belongsTo(Customer::class); //Check, is customer category associated with any customer or not
    }
}

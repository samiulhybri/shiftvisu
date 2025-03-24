<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesGroup extends Model
{
    use HasFactory;

    #[LodataRelationship()]
    public function topCustomer(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Customer::class); //Check, is Sales Group associated with any Customer or not
    }
}

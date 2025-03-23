<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function salesOpportunity(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SalesOpportunity::class);
    }

    #[LodataRelationship]
    public function salesArea(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SalesArea::class);
    }

    #[LodataRelationship]
    public function salesGroup(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SalesGroup::class);
    }

    #[LodataRelationship]
    public function customer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    #[LodataRelationship]
    public function offerPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OfferPos::class);
    }

    #[LodataRelationship]
    public function logs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweKalkLog::class, 'loggable_id');
    }

    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    #[LodataRelationship]
    public function deliveryTerm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DeliveryTerm::class);
    }

    #[LodataRelationship]
    public function country(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}

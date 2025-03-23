<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Customer extends Model implements HasMedia
{
    static public $snakeAttributes = false;
    use HasFactory;

    use InteractsWithMedia {
        media as protected trait_media;
    }

    protected $fillable = [
        'custom_id',
        'name',
        'is_active',
        'crm_id'
    ];
    
    #[LodataRelationship]
    public function mpoffers(): HasMany
    {
        return $this->hasMany(MpOffer::class);
    }

    #[LodataRelationship]
    public function country(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    #[LodataRelationship]
    public function deliveryTerm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DeliveryTerm::class);
    }

    #[LodataRelationship]
    public function paymentTerm(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
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
    public function sector(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    #[LodataRelationship]
    public function customerGroup(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CustomerGroup::class);
    }
    
    #[LodataRelationship]
    public function salesStatus(): BelongsTo
    {
        return $this->belongsTo(SalesStatus::class);
    }

    #[LodataRelationship]
    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_responsible');
    }

    #[LodataRelationship]
    public function customerMarketSegments(): HasMany
    {
        return $this->hasMany(CustomerMarketSegment::class);
    }

    #[LodataRelationship]
    public function revenueClassification(): BelongsTo
    {
        return $this->belongsTo(RevenueClassification::class);
    }
    
    #[LodataRelationship]
    public function machineClassification(): BelongsTo
    {
        return $this->belongsTo(MachineClassification::class);
    }
    
    #[LodataRelationship]
    public function employeeClassification(): BelongsTo
    {
        return $this->belongsTo(EmployeeClassification::class);
    }
    
    #[LodataRelationship]
    public function potentialClassification(): BelongsTo
    {
        return $this->belongsTo(PotentialClassification::class);
    }
    
    #[LodataRelationship]
    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }
    
    #[LodataRelationship()]
    public function marketSegment(): BelongsTo
    {
        return $this->belongsTo(MarketSegment::class);
    }
   
    #[LodataRelationship]
    public function contactable(): MorphMany
    {
        return $this->morphMany(ContactableContact::class, 'contactable');
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    #[LodataRelationship]
    public function category(): BelongsTo
    {
        return $this->belongsTo(CustomerCategory::class, 'customer_category_id');
    }

    #[LodataRelationship]
    public function customerCrmActionLogs(): HasMany
    {
        return $this->hasMany(CustomerCrmActionLog::class);
    }

    #[LodataRelationship]
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'customer_items');
    }
}

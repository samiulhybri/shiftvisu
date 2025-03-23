<?php

namespace App\Models;

use App\Enums\ProdOrderPosOperationStatus;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ProdOrderPos extends Model implements HasMedia
{
    protected $fillable = [
        'prod_order_id',
        'item_id',
        'pos',
        'start',
        'end',
        'quantity'
    ];

    static public $snakeAttributes = false;

    use HasFactory;
    use InteractsWithMedia {
        media as protected trait_media;
    }

    #[LodataRelationship]
    public function prodOrderPosOperations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperationsIdent(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class)->where('name', 'IDENT');
    }

    #[LodataRelationship]
    public function prodOrderPosOperationForCertificate(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class)->orderBy('pos', 'DESC');
    }

    #[LodataRelationship]
    public function nextProdOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class)->where('status', '<>', ProdOrderPosOperationStatus::CLOSED())->oldest('start');
    }

    #[LodataRelationship]
    public function lastProdOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class)->latest('end');
    }

    #[LodataRelationship]
    public function prodOrderPosBomPos(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosBomPos::class);
    }

    #[LodataRelationship]
    public function bomPos(): HasMany
    {
        return $this->hasMany(ProdOrderPosBomPos::class);
    }

    #[LodataRelationship]
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function prodOrder()
    {
        return $this->belongsTo(ProdOrder::class);
    }

    #[LodataRelationship]
    public function calculation()
    {
        return $this->belongsTo(Calculation::class);
    }

    #[LodataRelationship]
    public function hweQsSamplesProdOrderPos()
    {
        return $this->hasMany(HweQsSamplesProdOrderPos::class);
    }

    #[LodataRelationship]
    public function hweQsTensileTest()
    {
        return $this->hasOne(HweQsTensileTest::class)->where('is_ok', 1);
    }

    #[LodataRelationship]
    public function hweQsImpactTest()
    {
        return $this->hasOne(HweQsImpactTest::class)->where('is_ok', 1);
    }

    #[LodataRelationship]
    public function salesOrderPos(): BelongsTo
    {
        return $this->belongsTo(SalesOrderPos::class);
    }

    #[LodataRelationship]
    public function prodOrderPosSerial(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPosSerial::class);
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    #[LodataRelationship]
    public function userCreator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_creator');
    }

    #[LodataRelationship]
    public function userResponsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_responsible');
    }

    #[LodataRelationship]
    public function classifications(): MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }

    #[LodataRelationship]
    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    #[LodataRelationship]
    public function toolSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id_tool', 'id');
    }

    public function itemPlant()
    {
        return $this->item->itemPlants()->with('serialNumberProfile')->where('plant_id', $this->prodOrder->plant_id)->first();
    }
}

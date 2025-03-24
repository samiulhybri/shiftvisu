<?php

namespace App\Models;

use App\Enums\ItemStateType;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Item extends Model implements HasMedia
{
    use HasFactory;

    use InteractsWithMedia {
        media as protected trait_media;
    }

    static public $snakeAttributes = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'name',
        'is_sales_item',
        'is_alloy',
        'use_stock_for_backlog',
        'is_active',
        'item_group_id',
        'is_packaging_item',
        'is_production_item',
        'is_purchased_item',
    ];

    #[LodataRelationship]
    public function plants(): BelongsToMany
    {
        return $this->belongsToMany(Plant::class, "item_plants")
            ->withTimestamps();
    }

    #[LodataRelationship]
    public function itemPlants(): HasMany
    {
        return $this->hasMany(ItemPlant::class);
    }

    #[LodataRelationship]
    public function operationPlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->BelongsTo(OperationPlan::class);
    }

    /*public function stocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Stock::class);
    }*/

    #[LodataRelationship]
    public function stocks(): MorphMany
    {
        return $this->morphMany(Stock::class, 'stockable');
    }

    #[LodataRelationship]
    public function goodStocks()
    {
        return $this->morphMany(Stock::class, 'stockable')->whereRelation('itemState', 'item_state_type', '!=', ItemStateType::SCRAP());
    }

    /**
     * Returns the standard bom for this item
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    #[LodataRelationship]
    public function bom()
    {
        return $this->belongsTo(Bom::class);
    }

    #[LodataRelationship]
    public function callOffs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CallOff::class, 'item_id');
    }

    /**
     * Returns all the bom positions where this item is a component
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bomPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BomPos::class);
    }

    /**
     * Returns all the bom positions where this item is a component
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemBomChildren(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ItemBomChild::class);
    }

    /**
     * Returns all the bom positions where this item is a component
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemBomParents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ItemBomChild::class, 'child_item_id');
    }

    /**
     * Returns all the items where this item is a direct or sublevel component
     */
    public function parentItems(int $level = 0, int $levels_to_cycle = 10)
    {
        $parent_items = collect([]);
        if ($level > $levels_to_cycle) {
            Log::error("More than 10 levels of BOM for item $this->id");
            return $parent_items;
        }

        // Find all the BOMs where this item is a direct component
        $items = Item::select('items.*')
            ->join('boms', 'items.bom_id', '=', 'boms.id')
            ->join('bom_pos', 'bom_pos.bom_id', '=', 'boms.id')
            ->where('bom_pos.item_id', '=', $this->id)->get();

        foreach ($items as $item) {
            $parent_items->push($item);
            $parent_items = $parent_items->concat($item->parentItems($level + 1));
        }

        return $parent_items->unique();
    }

    /**
     * Returns the standard bom for this item
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function backlogItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(BacklogItem::class);
    }

    #[LodataRelationship]
    public function classifications(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }

    #[LodataRelationship]
    public function hweClassificationBlockGeometrie(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'BLOCKGEOMETRIE');
    }

    #[LodataRelationship]
    public function hweClassificationBlockTyp(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'BLOCKTYP');
    }

    #[LodataRelationship]
    public function hweClassificationGiesstyp(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'GIESSTYP');
    }

    #[LodataRelationship]
    public function hweClassificationLieferantnr(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'LIEFERANTNR');
    }

    #[LodataRelationship]
    public function hweClassificationLieferant(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'LIEFERANT');
    }

    #[LodataRelationship]
    public function hweClassificationWerkstoff(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'WERKSTOFF');
    }

    #[LodataRelationship]
    public function hweClassificationNormt(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE_MATERIALSTAMM')
            ->where('attribute', 'NORMT');
    }

    #[LodataRelationship]
    public function itemGroup(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group_id', 'id');
    }

    #[LodataRelationship]
    public function topQualification(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Qualification::class, 'item_id'); //Check, is item associated with any Qualification or not
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    #[LodataRelationship()]
    public function prodOrderPos(): HasMany
    {
        return $this->hasMany(ProdOrderPos::class); //Check, is item associated with any Qualification or not
    }

    #[LodataRelationship]
    public function alternativeUnits(): BelongsToMany
    {
        return $this->belongsToMany(UnitOfMeasure::class, 'item_unit_of_measure_conversions')
            ->withPivot('quantity_denominator', 'quantity_numerator')
            ->withTimestamps();
    }

    #[LodataRelationship]
    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    #[LodataRelationship]
    public function itemType(): BelongsTo
    {
        return $this->belongsTo(ItemType::class);
    }

    #[LodataRelationship]
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'customer_items');
    }

    #[LodataRelationship]
    public function customer()
    {
        return $this->belongsToMany(Customer::class, 'customer_items')->limit(1); // Automatically fetches the first related customer
    }

    #[LodataRelationship]
    public function backlogItemWeeks()
    {
        return $this->hasManyThrough(BacklogItemWeek::class, BacklogItem::class); // Automatically fetches the first related customer
    }

    public function packagingInstruction()
    {
        return $this->belongsTo(PackagingInstruction::class);
    }

    public function packagingInstruction1()
    {
        return $this->belongsTo(PackagingInstruction::class, 'packaging_instruction_id_1');
    }

    public function packagingInstruction2()
    {
        return $this->belongsTo(PackagingInstruction::class, 'packaging_instruction_id_2');
    }

    public function packagingInstruction3()
    {
        return $this->belongsTo(PackagingInstruction::class, 'packaging_instruction_id_3');
    }

    public function packagingInstruction4()
    {
        return $this->belongsTo(PackagingInstruction::class, 'packaging_instruction_id_4');
    }
}

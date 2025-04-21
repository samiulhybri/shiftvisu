<?php

namespace App\Console\Commands;

use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\HandlingUnit;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\ItemState;
use App\Models\Machine;
use App\Models\Plant;
use App\Models\ProductionSupplyArea;
use App\Models\Stock;
use App\Models\StorageBin;
use App\Models\StorageLocation;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HandlingUnitDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:handling_unit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');


        $items = HandlingUnitDtoImport::preloadItems();
        $itemStates = HandlingUnitDtoImport::preloadItemStates();
        $storageBins = HandlingUnitDtoImport::preloadStorageBins();
        $storageLocations = HandlingUnitDtoImport::preloadStorageLocations();
        $defaultItemStateIds = HandlingUnitDtoImport::preloadPlantItemStateIdDefaults();

        // Preload all ItemPlant and ProdOrderPos data into maps for quick lookup
        $itemPlants = HandlingUnitDtoImport::preloadItemPlants();

        $unprocessedBatches = HandlingUnitDtoImport::preloadUnprocessedBatches();

        $handlingUnitParentChild = collect();

        while ($chunk = $ds->handlingUnitDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $handlingUnitDto) {
                $handlingUnitParentChild = HandlingUnitDtoImport::importHandlingUnit($handlingUnitDto, $items, $itemStates, $itemPlants, $unprocessedBatches, $defaultItemStateIds, $handlingUnitParentChild, $storageBins, $storageLocations);
            }
        }

        $handlingUnits = HandlingUnit::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
        foreach ($handlingUnitParentChild as [$plant_id_custom, $parentCustomId, $childId]) {
            if ($handlingUnits->has($parentCustomId)) {
                Stock::query()->updateOrCreate(
                    [
                        'stockable_type' => HandlingUnit::class,
                        'stockable_id' => $childId,
                    ],
                    [
                        'positionable_type' => HandlingUnit::class,
                        'positionable_id' => $handlingUnits[$parentCustomId],
                        'item_state_id' => $defaultItemStateIds[$plant_id_custom],
                        'quantity' => 1,
                    ]
                );
            }
        }
    }

    /**
     * @param mixed $handlingUnitDto
     * @param Collection|null $items
     * @param Collection|null $itemStates
     * @param Collection|null $itemPlants
     * @param Collection|null $unprocessedBatches
     * @param Collection|null $defaultItemStateIds
     * @param Collection|null $handlingUnitParentChild
     * @param Collection|null $storageBins
     * @param Collection|null $storageLocations
     * @return Collection
     */
    public static function importHandlingUnit(HandlingUnitDto $handlingUnitDto, Collection $items = null, Collection $itemStates = null, Collection $itemPlants = null, Collection $unprocessedBatches = null, Collection $defaultItemStateIds = null, Collection $handlingUnitParentChild = null, Collection $storageBins = null, Collection $storageLocations= null): Collection
    {
        if(!$items)
            $items = HandlingUnitDtoImport::preloadItems();

        if(!$itemStates)
            $itemStates = HandlingUnitDtoImport::preloadItemStates();

        if(!$itemPlants)
            $itemPlants = HandlingUnitDtoImport::preloadItemPlants();

        if(!$unprocessedBatches)
            $unprocessedBatches = HandlingUnitDtoImport::preloadUnprocessedBatches();

        if(!$defaultItemStateIds)
            $defaultItemStateIds = HandlingUnitDtoImport::preloadPlantItemStateIdDefaults();

        if(!$handlingUnitParentChild)
            $handlingUnitParentChild = collect();

        if(!$storageLocations)
            $storageLocations = HandlingUnitDtoImport::preloadStorageLocations();

        if(!$storageBins)
            $storageBins = HandlingUnitDtoImport::preloadStorageBins();

        $handlingUnit = HandlingUnit::query()->where('custom_id', $handlingUnitDto->custom_id)->first();
        if (!$handlingUnit) {
            $handlingUnit = new HandlingUnit();
            $handlingUnit->custom_id = $handlingUnitDto->custom_id;
        }

        $handlingUnit->is_active = $handlingUnitDto->is_active;
        $handlingUnit->is_complete = $handlingUnitDto->is_complete ?? $handlingUnit->is_complete ?? false;
        $handlingUnit->item_id = $items[$handlingUnitDto->handling_unit_item_id_custom]->id ?? null;
        $handlingUnit->save();

        $importedItemStockIds = [];
        foreach ($handlingUnitDto->items as $item) {
            if (!isset($items[$item->item_id_custom]) ||
                ($item->item_state_id_custom && !isset($itemStates[$item->item_state_id_custom]))
            ) {
                continue;
            }
//                    if (!($items[$item->item_id_custom]->itemType?->is_stocked_in_hu ?? false)) {
//                        continue;
//                    }

            if (!isset($itemPlants[$item->item_id_custom . "_" . $handlingUnitDto->plant_id_custom])) {
                continue;
            }

            $itemPlantId = $itemPlants[$item->item_id_custom . "_" . $handlingUnitDto->plant_id_custom];

            if (!$unprocessedBatches->where('batch', $item->batch)->where('item_plant_id', $itemPlantId)->count()) {

                $itemStock = $handlingUnit->childStocks()->updateOrCreate(
                    [
                        'stockable_type' => ItemPlant::class,
                        'stockable_id' => $itemPlantId,
                        'batch' => $item->batch,
                        'item_state_id' => $item->item_state_id_custom
                            ? $itemStates[$item->item_state_id_custom]
                            : $defaultItemStateIds[$handlingUnitDto->plant_id_custom],
                        'serial' => $item->serial_number
                    ],
                    [
                        'quantity' => $item->quantity
                    ]
                );
                $importedItemStockIds[] = $itemStock->id;
            } else {
                $itemStock = $handlingUnit->childStocks()->updateOrCreate(
                    [
                        'stockable_type' => ItemPlant::class,
                        'stockable_id' => $itemPlantId,
                        'batch' => $item->batch,
                        'item_state_id' => $item->item_state_id_custom
                            ? $itemStates[$item->item_state_id_custom]
                            : $defaultItemStateIds[$handlingUnitDto->plant_id_custom],
                        'serial' => $item->serial_number
                    ],
                    []
                );
                $importedItemStockIds[] = $itemStock->id;
            }
        }

        $handlingUnit
            ->childStocks()
            ->where('stockable_type', ItemPlant::class)
            ->whereNotIn('id', $importedItemStockIds)
            ->delete();

        if ($handlingUnitDto->parent_handling_unit_id_custom) {
            $handlingUnitParentChild->push([
                $handlingUnitDto->plant_id_custom,
                $handlingUnitDto->parent_handling_unit_id_custom,
                $handlingUnit->id,
            ]);
        } else {
            $positionable_id = null;
            $positionable_type = null;
            if ($handlingUnitDto->storage_bin_id_custom) {
                $positionable_id = $storageBins[$handlingUnitDto->storage_bin_id_custom] ?? null;
                $positionable_type = StorageBin::class;
            } else if ($handlingUnitDto->storage_location_id_custom) {
                $positionable_id = $storageLocations[$handlingUnitDto->storage_location_id_custom] ?? null;
                $positionable_type = StorageLocation::class;
            }

            $huInPsaOrNested = Stock::query()
                ->where('stockable_type', HandlingUnit::class)
                ->where('stockable_id', $handlingUnit->id)
                ->whereIn('positionable_type', [Machine::class, ProductionSupplyArea::class, HandlingUnit::class])->exists();

            if (!$huInPsaOrNested && $positionable_id && $positionable_type) {
                Stock::query()->updateOrCreate(
                    [
                        'stockable_type' => HandlingUnit::class,
                        'stockable_id' => $handlingUnit->id,
                    ],
                    [
                        'positionable_type' => $positionable_type,
                        'positionable_id' => $positionable_id,
                        'item_state_id' => $defaultItemStateIds[$handlingUnitDto->plant_id_custom],
                        'quantity' => 1,
                    ]
                );
            }
        }
        return $handlingUnitParentChild;
    }

    /**
     * @return Collection
     */
    public static function preloadItems(): Collection
    {
        return Item::with("itemType")->get()->keyBy("custom_id");
    }

    /**
     * @return Collection
     */
    public static function preloadItemStates(): Collection
    {
        return ItemState::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
    }

    /**
     * @return Collection
     */
    public static function preloadStorageBins(): Collection
    {
        return StorageBin::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
    }

    /**
     * @return Collection
     */
    public static function preloadStorageLocations(): Collection
    {
        return StorageLocation::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
    }

    /**
     * @return Collection
     */
    public static function preloadPlantItemStateIdDefaults(): Collection
    {
        return Plant::all()->pluck("item_state_id_default", "custom_id")->collect();
    }

    /**
     * @return Collection
     */
    public static function preloadItemPlants(): Collection
    {
        return ItemPlant::query()->select('id', 'item_id', 'plant_id')
            ->with(['item', 'plant'])
            ->get()
            ->mapWithKeys(function ($itemPlant) {
                return ["" . $itemPlant->item->custom_id . "_" . $itemPlant->plant->custom_id => $itemPlant->id];
            });
    }

    /**
     * @return Collection
     */
    public static function preloadUnprocessedBatches(): Collection
    {
        return DB::table('handling_unit_prod_order_pos_operation_consumptions')
            ->join(
                'prod_order_pos_operation_consumptions',
                'handling_unit_prod_order_pos_operation_consumptions.prod_order_pos_operation_consumption_id',
                '=',
                'prod_order_pos_operation_consumptions.id'
            )
            ->select(
                'prod_order_pos_operation_consumptions.batch',
                'prod_order_pos_operation_consumptions.item_plant_id'
            )
            ->groupBy(
                'prod_order_pos_operation_consumptions.batch',
                'prod_order_pos_operation_consumptions.item_plant_id'
            )
            ->havingRaw('SUM(prod_order_pos_operation_consumptions.quantity) > 0')
            ->get();
    }
}

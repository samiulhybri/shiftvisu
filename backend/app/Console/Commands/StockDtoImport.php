<?php

namespace App\Console\Commands;

use App\ExternalDataSource\Dto\StockDto;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\ItemState;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\Machine;
use App\Models\Plant;
use App\Models\ProductionSupplyArea;
use App\Models\Stock;
use App\Models\StorageLocation;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:stock';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $items = $this->preloadItems();

        $plants = $this->preloadPlants();

        $storageLocations = $this->preloadStorageLocations();

        $itemStates = $this->preloadItemStates();

        $defaultItemStateIds = $this->preloadPlantItemStateIdDefaults();

        // Preload all ItemPlant and ProdOrderPos data into maps for quick lookup
        $itemPlants = $this->preloadItemPlants();

        $unprocessedBatches = $this->preloadUnprocessedBatches();

        while ($chunk = $ds->stockDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $stock) {
                $this->importStock($stock, $itemStates, $items, $plants, $storageLocations, $itemPlants, $defaultItemStateIds, $unprocessedBatches);
            }
        }

        return 0;
    }

    /**
     * @param StockDto $stock
     * @param Collection|null $itemStates
     * @param Collection|null $items
     * @param Collection|null $plants
     * @param Collection|null $storageLocations
     * @param Collection|null $itemPlants
     * @param Collection|null $defaultItemStateIds
     * @param Collection|null $unprocessedBatches
     * @return void
     */
    public static function importStock(StockDto $stock, Collection $itemStates = null, Collection $items = null, Collection $plants = null, Collection $storageLocations = null, Collection $itemPlants = null, Collection $defaultItemStateIds = null, Collection $unprocessedBatches = null): void
    {
        if(!$itemStates)
            $itemStates = StockDtoImport::preloadItemStates();

        if(!$items)
            $items = StockDtoImport::preloadItems();

        if(!$plants)
            $plants = StockDtoImport::preloadPlants();

        if(!$storageLocations)
            $storageLocations = StockDtoImport::preloadStorageLocations();

        if(!$itemPlants)
            $itemPlants = StockDtoImport::preloadItemPlants();

        if(!$defaultItemStateIds)
            $defaultItemStateIds = StockDtoImport::preloadPlantItemStateIdDefaults();

        if(!$unprocessedBatches)
            $unprocessedBatches = StockDtoImport::preloadUnprocessedBatches();

        if ($stock->item_state_id_custom && !isset($itemStates[$stock->item_state_id_custom])) {
            return;
        }

        if ($items->has($stock->item_id_custom) &&
            $plants->has($stock->plant_id_custom) &&
            $storageLocations->has($stock->storage_location_id_custom)) {
            if ($items[$stock->item_id_custom]->itemType?->is_stocked_in_hu ?? false) {
                return;
            }

            if (!isset($itemPlants["" . $stock->item_id_custom . "_" . $stock->plant_id_custom])) {
                return;
            }

            $itemPlantId = $itemPlants["" . $stock->item_id_custom . "_" . $stock->plant_id_custom];

            //If batch not set import exact qty at exact position of erp independent of location checks
            if (!$stock->batch) {
                Stock::query()->updateOrCreate(
                    [
                        'stockable_type' => ItemPlant::class,
                        'stockable_id' => $itemPlantId,
                        'item_state_id' => $stock->item_state_id_custom
                            ? $itemStates[$stock->item_state_id_custom]
                            : $defaultItemStateIds[$stock->plant_id_custom],
                        'positionable_type' => StorageLocation::class,
                        'positionable_id' => $storageLocations[$stock->storage_location_id_custom],
                        'batch' => $stock->batch,
                        'serial' => $stock->serial,
                    ],
                    [
                        'quantity' => $stock->quantity,
                    ]
                );
            } elseif (!$unprocessedBatches->where('batch', $stock->batch)->where('item_plant_id', $itemPlantId)->count()) {
                //Check if batch is associated with not yet exported consumption
                //if so, do not update
                //If found in psa update without changing the position
                $recordsFound = Stock::query()
                    ->where('stockable_type', ItemPlant::class)
                    ->where('stockable_id', $itemPlantId)
                    ->where('item_state_id', $stock->item_state_id_custom
                        ? $itemStates[$stock->item_state_id_custom]
                        : $defaultItemStateIds[$stock->plant_id_custom])
                    ->where('batch', $stock->batch)
                    ->where('serial', $stock->serial)
                    ->whereIn('positionable_type', [Machine::class, ProductionSupplyArea::class])
                    ->update([
                        'quantity' => $stock->quantity,
                    ]);

                //Else create at erp position
                if (!$recordsFound) {
                    Stock::query()->updateOrCreate(
                        [
                            'stockable_type' => ItemPlant::class,
                            'stockable_id' => $itemPlantId,
                            'item_state_id' => $stock->item_state_id_custom
                                ? $itemStates[$stock->item_state_id_custom]
                                : $defaultItemStateIds[$stock->plant_id_custom],
                            'positionable_type' => StorageLocation::class,
                            'positionable_id' => $storageLocations[$stock->storage_location_id_custom],
                            'batch' => $stock->batch,
                            'serial' => $stock->serial,
                        ],
                        [
                            'quantity' => $stock->quantity,
                        ]
                    );
                }
            }


        } else {
            Log::error("Stock import: Item ($stock->item_id_custom), Plant ($stock->plant_id_custom) " .
                "or StorageLocation ($stock->storage_location_id_custom) not found");
        }
    }

    /**
     * @return Collection
     */
    public static function preloadItems(): Collection
    {
        $items = collect();
        foreach (Item::with("itemType")->get() as $item) {
            $items[$item->custom_id] = $item;
        }
        return $items;
    }

    /**
     * @return Collection
     */
    public static function preloadPlants(): Collection
    {
        $plants = collect();
        foreach (Plant::all() as $plant) {
            $plants[$plant->custom_id] = $plant->id;
        }
        return $plants;
    }

    /**
     * @return Collection
     */
    public static function preloadStorageLocations(): Collection
    {
        $storageLocations = collect();
        foreach (StorageLocation::all() as $storageLocation) {
            $storageLocations[$storageLocation->custom_id] = $storageLocation->id;
        }
        return $storageLocations;
    }

    /**
     * @return Collection
     */
    public static function preloadItemStates(): Collection
    {
        $itemStates = collect();
        foreach (ItemState::all() as $itemState) {
            $itemStates[$itemState->custom_id] = $itemState->id;
        }
        return $itemStates;
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

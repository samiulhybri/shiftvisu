<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\ItemState;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\Plant;
use App\Models\Stock;
use App\Models\StorageLocation;
use Illuminate\Console\Command;
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

        $items = collect();
        foreach (Item::with("itemType")->get() as $item) {
            $items[$item->custom_id] = $item;
        }

        $plants = collect();
        foreach (Plant::all() as $plant) {
            $plants[$plant->custom_id] = $plant->id;
        }

        $storageLocations = collect();
        foreach (StorageLocation::all() as $storageLocation) {
            $storageLocations[$storageLocation->custom_id] = $storageLocation->id;
        }

        $itemStates = collect();
        foreach (ItemState::all() as $itemState) {
            $itemStates[$itemState->custom_id] = $itemState->id;
        }

        $defaultItemStateIds = Plant::all()->pluck("item_state_id_default", "custom_id")->collect();

        while ($chunk = $ds->stockDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $stock) {
                if ($stock->item_state_id_custom && !isset($itemStates[$stock->item_state_id_custom])
                ) {
                    continue;
                }

                if ($items->has($stock->item_id_custom) &&
                    $plants->has($stock->plant_id_custom) &&
                    $storageLocations->has($stock->storage_location_id_custom)) {

                    if ($items[$stock->item_id_custom]->itemType?->is_stocked_in_hu ?? false) {
                        continue;
                    }

                    $itemPlant = ItemPlant::where('item_id', $items[$stock->item_id_custom]->id)
                        ->where('plant_id', $plants[$stock->plant_id_custom])
                        ->select('id')
                        ->first();

                    if(!$itemPlant) {
                        continue;
                    }

                    Stock::updateOrCreate(
                        [
                            'stockable_type' => ItemPlant::class,
                            'stockable_id' => $itemPlant->id,
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
                } else {
                    Log::error("Stock import: Item ($stock->item_id_custom), Plant ($stock->plant_id_custom) " .
                        "or StorageLocation ($stock->storage_location_id_custom) not found");
                }
            }
        }

        return 0;
    }
}

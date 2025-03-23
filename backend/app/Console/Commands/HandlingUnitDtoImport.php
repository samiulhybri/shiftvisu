<?php

namespace App\Console\Commands;

use App\ExternalDataSource\Dto\HandlingUnitItemDto;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\HandlingUnit;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\ItemState;
use App\Models\Plant;
use App\Models\Setting;
use App\Models\Stock;
use App\Models\StorageBin;
use App\Models\StorageLocation;
use Illuminate\Console\Command;

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


        $items = Item::with("itemType")->get()->keyBy("custom_id");
        $itemStates = ItemState::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
        $storageBins = StorageBin::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
        $plants = Plant::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
        $storageLocations = StorageLocation::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();

        $defaultItemStateIds = Plant::all()->pluck("item_state_id_default", "custom_id")->collect();

        $handlingUnitParentChild = [];

        while ($chunk = $ds->handlingUnitDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $handlingUnitDto) {
                $handlingUnit = HandlingUnit::where('custom_id', $handlingUnitDto->custom_id)->first();
                if (!$handlingUnit) {
                    $handlingUnit = new HandlingUnit();
                    $handlingUnit->custom_id = $handlingUnitDto->custom_id;
                }

                if (!isset($plants[$handlingUnitDto->plant_id_custom])) {
                    continue;
                }

                $handlingUnit->is_active = $handlingUnitDto->is_active;
                $handlingUnit->is_complete = $handlingUnitDto->is_complete;
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

                    $itemPlant = ItemPlant::where('item_id', $items[$item->item_id_custom]->id)
                        ->where('plant_id', $plants[$handlingUnitDto->plant_id_custom])
                        ->select('id')
                        ->first();

                    if(!$itemPlant)
                        continue;

                    $itemStock = $handlingUnit->childStocks()->updateOrCreate(
                        [
                            'stockable_type' => ItemPlant::class,
                            'stockable_id' => $itemPlant->id,
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
                }

                $handlingUnit
                    ->childStocks()
                    ->whereNotIn('id', $importedItemStockIds)
                    ->delete();

                if ($handlingUnitDto->parent_handling_unit_id_custom) {
                    $handlingUnitParentChild[] = [
                        $handlingUnitDto->plant_id_custom,
                        $handlingUnitDto->parent_handling_unit_id_custom,
                        $handlingUnit->id,
                    ];
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

                    Stock::updateOrCreate(
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
        }

        $handlingUnits = HandlingUnit::all(["id", "custom_id"])->pluck("id", "custom_id")->collect();
        foreach ($handlingUnitParentChild as [$plant_id_custom, $parentCustomId, $childId]) {
            if ($handlingUnits->has($parentCustomId)) {
                Stock::updateOrCreate(
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
}

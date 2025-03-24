<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\InspectionLot;
use App\Models\Item;
use App\Models\DataImport;
use App\Models\ItemPlant;
use App\Models\Plant;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class InspectionLotDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:inspection_lot';

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
        $xmlIds = [];

        // Load all necessary data into memory
        $items = Item::select("id", "custom_id")->get()->pluck("id", "custom_id");
        $prodOrders = ProdOrder::select("id", "custom_id")->get()->pluck("id", "custom_id");

        // Preload all ItemPlant and ProdOrderPos data into maps for quick lookup
        $itemPlants = ItemPlant::select('id', 'item_id', 'plant_id')
            ->with(['item', 'plant'])
            ->get()
            ->mapWithKeys(function ($itemPlant) {
                return ["".$itemPlant->item->custom_id."_".$itemPlant->plant->custom_id => $itemPlant->id];
            });

        $prodOrderPos = ProdOrderPos::select('id', 'prod_order_id', 'item_id')
            ->get()
            ->mapToGroups(function ($pos) {
                return [$pos->prod_order_id => [$pos->item_id => $pos->id]];
            });


        // Process inspection lots in chunks
        while ($chunk = $ds->inspectionLotDtos($skip, $take)) {
            $skip += $take;

            $inspectionLotCustomIds = collect($chunk)->pluck("custom_id");

            // Preload existing InspectionLot records
            $existingInspectionLots = InspectionLot::whereIn('custom_id', $inspectionLotCustomIds)
                ->get()
                ->keyBy('custom_id');

            $newInspectionLots = [];
            foreach ($chunk as $inspectionLot) {
                // Add unique xml_id to $xmlIds
                if (isset($inspectionLot->xml_id) && !in_array($inspectionLot->xml_id, $xmlIds)) {
                    $xmlIds[] = $inspectionLot->xml_id;
                }

                // Check if the inspection lot already exists in memory
                $record = $existingInspectionLots[$inspectionLot->custom_id] ?? new InspectionLot();

                // Update the record attributes
                $record->custom_id = $inspectionLot->custom_id;

                // Map prodOrderPos and itemPlant using preloaded data
                $prodOrderId = $prodOrders->get($inspectionLot->prod_order_id_custom);
                $itemId = $items->get($inspectionLot->item_id_custom);

                if ($prodOrderId && $itemId && isset($prodOrderPos[$prodOrderId][0][$itemId])) {
                    $record->inspectable_id = $prodOrderPos[$prodOrderId][0][$itemId];
                    $record->inspectable_type = ProdOrderPos::class;
                } else {
                    continue;
                }

                if (isset($itemPlants["".$inspectionLot->item_id_custom."_".$inspectionLot->plant_id_custom])) {
                    $record->item_plant_id = $itemPlants["".$inspectionLot->item_id_custom."_".$inspectionLot->plant_id_custom];
                } else {
                    continue;
                }

                // Add the record to batch save if it's new
                if (!$record->exists) {
                    $record->created_at = $record->updated_at = now();
                    $newInspectionLots[] = $record->toArray();
                } else {
                    // Update existing record
                    $record->save();
                }
            }

            // Save all new records in one batch
            if (!empty($newInspectionLots)) {
                InspectionLot::insert($newInspectionLots);
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return Command::SUCCESS;
    }
}

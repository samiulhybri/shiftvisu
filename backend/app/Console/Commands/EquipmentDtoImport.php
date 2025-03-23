<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Equipment;
use App\Models\Item;
use Illuminate\Console\Command;

class EquipmentDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:equipment {serial?} {item?}';

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

        $items = Item::all(['id', 'custom_id'])->pluck('id', 'custom_id');

        $serialFilter = $this->argument('serial');
        $itemFilter = $this->argument('item');

        while ($chunk = $ds->equipmentDtos($skip, $take, $serialFilter, $itemFilter)) {
            $skip += $take;

            $toUpsertSerial = [];
            $toUpsertCustomId = [];

            foreach ($chunk as $equipment) {
                $itemId = $items[$equipment->item_id_custom] ?? null;

                if (!$itemId && $equipment->serial) {
                    $this->warn("Item with custom_id {$equipment->item_id_custom} not found");
                    continue;
                }

                if ($equipment->serial) {
                    $toUpsertSerial[] = [
                        'item_id' => $itemId,
                        'serial' => $equipment->serial,
                        'custom_id' => $equipment->custom_id,
                        'name' => $equipment->name,
                        'is_transport_possible' => $equipment->is_transport_possible,
                        'validity_end' => $equipment->validity_end,
                        'updated_at' => now(),
                        'created_at' => now(), // Needed for inserts
                    ];
                } else {
                    $toUpsertCustomId[] = [
                        'item_id' => $itemId,
                        'serial' => $equipment->serial,
                        'custom_id' => $equipment->custom_id,
                        'name' => $equipment->name,
                        'validity_end' => $equipment->validity_end,
                        'is_transport_possible' => $equipment->is_transport_possible,
                        'updated_at' => now(),
                        'created_at' => now(), // Needed for inserts
                    ];
                }
            }

            if (!empty($toUpsertSerial)) {
                Equipment::query()->upsert(
                    $toUpsertSerial,
                    ['item_id', 'serial'], // Unique columns for conflict resolution
                    ['custom_id', 'name', 'validity_end', 'updated_at'] // Columns to update if record exists
                );
            }

            if (!empty($toUpsertCustomId)) {
                Equipment::query()->upsert(
                    $toUpsertCustomId,
                    ['custom_id'], // Unique columns for conflict resolution
                    ['item_id', 'serial', 'name', 'validity_end', 'updated_at'] // Columns to update if record exists
                );
            }
        }

        return 0;
    }
}

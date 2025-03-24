<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\StorageType;
use App\Models\Warehouse;
use Illuminate\Console\Command;

class WarehouseDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:warehouse';

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

        while ($chunk = $ds->warehouseDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $warehouseDto) {
                $warehouse = Warehouse::where('custom_id', $warehouseDto->custom_id)->first();
                if (!$warehouse) {
                    $warehouse = new Warehouse();
                    $warehouse->custom_id = $warehouseDto->custom_id;
                }
                $warehouse->name = $warehouseDto->name;

                foreach ($warehouseDto->storage_types as $storageTypeDto) {
                    StorageType::updateOrCreate(
                        ['custom_id' => $storageTypeDto->custom_id],
                        ['is_active' => $storageTypeDto->is_active]
                    );
                }

                $warehouse->save();
            }
        }
        return 0;
    }
}

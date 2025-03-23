<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\StorageBin;
use App\Models\StorageType;
use Illuminate\Console\Command;

class StorageBinDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:storage_bin';

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

        $storageTypes = StorageType::all(['id', 'custom_id'])->pluck('id', 'custom_id')->collect();

        while ($chunk = $ds->storageBinDtos($skip, $take)) {
            $skip += $take;

            foreach ($chunk as $storageBin) {
                /**
                 * @var StorageBin $record
                 */
                $record = StorageBin::where('custom_id', $storageBin->custom_id)->first();
                if (!$record) {
                    if (!(isset($storageBin->is_active) && $storageBin->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new StorageBin();
                    $record->custom_id = $storageBin->custom_id;
                    $record->is_active = $storageBin->is_active;
                }

                $record->storage_type_id = $storageTypes->get($storageBin->storage_type_id_custom) ?? null;
                $record->save();
            }
        }
        return 0;
    }
}

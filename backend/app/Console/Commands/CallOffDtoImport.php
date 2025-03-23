<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\CallOff;
use App\Models\Item;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CallOffDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:calloff';

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
        foreach (Item::select('id', 'custom_id')->get() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        CallOff::query()->delete();

        $importedCustomIds = [];
        while ($chunk = $ds->callOffDtos($skip, $take)) {
            $skip += $take;

            $newRecords = [];

            foreach ($chunk as $call_off) {                
                $customId = null;
                if (isset($call_off->custom_id) && !in_array($call_off->custom_id, $importedCustomIds)) {
                    $customId = $call_off->custom_id;
                }

                if ($items->has($call_off->item_id_custom)) {
                    if(!in_array($call_off->custom_id, $importedCustomIds)) {
                        $newRecords[] = [
                            'custom_id'     => $customId,
                            'item_id'       => $items[$call_off->item_id_custom],
                            'date'          => $call_off->date,
                            'quantity'      => $call_off->quantity,
                            'is_internal'   => $call_off->is_internal,
                            'created_at'    => now(),
                            'updated_at'    => now(),
                        ];

                        $importedCustomIds[] = $call_off->custom_id;
                    }
                } else {
                    Log::error("CallOffImport: Item {$call_off->item_id_custom} not found");
                }
            }

            if(count($newRecords)) {
                CallOff::insert($newRecords);
            }
        }

        return 0;
    }
}

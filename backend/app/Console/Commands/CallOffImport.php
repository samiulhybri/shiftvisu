<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\CallOff;
use App\Models\Item;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CallOffImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:calloff';

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

        $call_offs = $ds->callOffs();
        $items = collect();
        foreach (Item::all() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        CallOff::truncate();
        foreach ($call_offs as $call_off) {
            $record = new CallOff();
            if (isset($call_off['custom_id'])) {
                $record->custom_id = $call_off['custom_id'];
            }

            if ($items->has($call_off['custom_item_id'])) {
                $record->item_id = $items[$call_off['custom_item_id']];
                $record->date = $call_off['date'];
                $record->quantity = $call_off['quantity'];
                $record->save();
            } else {
                Log::error("CallOffImport: Item {$call_off['custom_item_id']} not found");
            }
        }

        return 0;
    }
}

<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Item;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\ErrorHandler\Debug;

class StockImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:stock';

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

        $stocks = $ds->stocks();

        $items = collect();
        foreach (Item::all() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        $warehouses = collect();
        foreach (Warehouse::all() as $warehouse) {
            $warehouses[$warehouse->custom_id] = $warehouse->id;
        }

        foreach ($stocks as $stock) {
            if ($items->has($stock['custom_item_id']) && $warehouses->has($stock['custom_warehouse_id'])) {
                $record = Stock::where('item_id', $items[$stock['custom_item_id']])
                    ->where('warehouse_id', $warehouses[$stock['custom_warehouse_id']])
                    ->first();

                if (!$record) {
                    $record = new Stock();
                    $record->item_id = $items[$stock['custom_item_id']];
                    $record->warehouse_id = $warehouses[$stock['custom_warehouse_id']];
                }

                $record->quantity = $stock['quantity'];
                $record->save();
            } else {
                Log::error("Stock import: item: {$stock['custom_item_id']} or warehouse: {$stock['custom_warehouse_id']} not found");
            }
        }

        return 0;
    }
}

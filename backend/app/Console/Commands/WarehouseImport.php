<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Warehouse;
use Illuminate\Console\Command;

class WarehouseImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:warehouse';

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

        $warehouses = $ds->warehouses();

        foreach ($warehouses as $warehouse) {
            $record = Warehouse::where('custom_id', $warehouse['custom_id'])->first();
            if (!$record) {
                $record = new Warehouse();
                $record->custom_id = $warehouse['custom_id'];
            }
            $record->name = $warehouse['name'];
            $record->save();
        }

        return 0;
    }
}

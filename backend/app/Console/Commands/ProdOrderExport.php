<?php

namespace App\Console\Commands;

use App\Http\Controllers\ProdOrderExportController;
use Illuminate\Console\Command;

class ProdOrderExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'prodorder:export';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Putting the data rows that were changed in ProdOrderPosOperation table to the export_data table with name PRODUCTION_ORDER';

    /**
     * Execute the console command.
     *
     * @return bool
     */
    public function handle(): bool
    {
        $controller = new ProdOrderExportController();
        return $controller->export();
    }
}

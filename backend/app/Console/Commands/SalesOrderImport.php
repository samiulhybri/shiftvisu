<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Customer;
use App\Models\SalesOrder;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SalesOrderImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:salesorder';

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
        $salesOrders = $ds->salesOrders();


        $customers = collect();
        foreach (Customer::all() as $customer) {
            $customers[$customer->custom_id] = $customer->id;
        }

        $xmlIds = [];

        foreach ($salesOrders as $salesOrderChunks) {
            foreach ($salesOrderChunks as $salesOrder) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($salesOrder['xml_id']) && !in_array($salesOrder['xml_id'], $xmlIds)) {
                    $xmlIds[] = $salesOrder['xml_id'];
                }

                $record = SalesOrder::where('custom_id', $salesOrder['custom_id'])->first();
                if (!$record) {

                    if (!(isset($salesOrder['custom_id']) && isset($salesOrder['custom_customer_id']) && $customers->has($salesOrder['custom_customer_id']))) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new SalesOrder();
                    $record->custom_id = $salesOrder['custom_id'];
                    $record->customer_id = $customers[$salesOrder['custom_customer_id']];
                }

                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return 0;
    }
}

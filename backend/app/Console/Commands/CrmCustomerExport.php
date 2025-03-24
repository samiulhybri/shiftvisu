<?php

namespace App\Console\Commands;

use App\ExternalDataSource\CRMDataSource;
use App\Models\Customer;
use Illuminate\Console\Command;

class CrmCustomerExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:customer_export';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export Customers to CRM';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $customers = Customer::all();
        $ds = new CRMDataSource();

        $ds->exportCustomers($customers);

        return Command::SUCCESS;
    }
}

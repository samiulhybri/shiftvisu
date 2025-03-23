<?php

namespace App\Console\Commands;

use App\ExternalDataSource\CRMDataSource;
use App\Models\Customer;
use Illuminate\Console\Command;

class HweCrmCustomerImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:hwe_crm_customer';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * @return void
     */
    public function handle()
    {
        $customers = new CRMDataSource();
        $customers->customerImport();
        if ($customers) {
            foreach ($customers as $customer) {
                if ($customer["accountid"] && ($customer["accountnumber"])) {
                    Customer::updateOrCreate([
                        "custom_id" => $customer["accountnumber"]
                    ], [
                        "name" => $customer["name"],
                        "crm_id" => $customer["accountid"],
                    ]);
                }
            }
        }
    }
}

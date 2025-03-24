<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\BaseVisuImport;
use App\Jobs\CustomerSupplierImport;
use App\Models\Country;
use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\DeliveryTerm;
use App\Models\PaymentTerm;
use App\Models\DataImport;
use App\Models\SalesArea;
use App\Models\SalesGroup;
use App\Models\Sector;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use function PHPUnit\Framework\isNull;

class CustomerImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:customer';

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
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();
        $customers = $ds->customers();
        $xmlIds = [];


        $countries = collect();
        foreach (Country::all() as $country) {
            $countries[$country->custom_id] = $country->id;
        }

        $paymentTerms = collect();
        foreach (PaymentTerm::all() as $paymentTerm) {
            $paymentTerms[$paymentTerm->custom_id] = $paymentTerm->id;
        }

        $deliveryTerms = collect();
        foreach (DeliveryTerm::all() as $deliveryTerm) {
            $deliveryTerms[$deliveryTerm->custom_id] = $deliveryTerm->id;
        }

        $salesGroups = collect();
        foreach (SalesGroup::all() as $salesGroup) {
            $salesGroups[$salesGroup->custom_id] = $salesGroup->id;
        }

        $salesAreas = collect();
        foreach (SalesArea::all() as $salesArea) {
            $salesAreas[$salesArea->custom_id] = $salesArea->id;
        }

        $customerGroups = collect();
        foreach (CustomerGroup::all() as $customerGroup) {
            $customerGroups[$customerGroup->custom_id] = $customerGroup->id;
        }

        $sectors = collect();
        foreach (Sector::all() as $sector) {
            $sectors[$sector->custom_id] = $sector->id;
        }

        foreach ($customers as $customerChunks) {
            foreach ($customerChunks as $customer) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($customer['xml_id']) && !in_array($customer['xml_id'], $xmlIds)) {
                    $xmlIds[] = $customer['xml_id'];
                }
                $record = Customer::where('custom_id', $customer['custom_id'])->first();
                if (!$record) {
                    if (isset($customer['is_active']) && !$customer['is_active']) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Customer();
                    $record->custom_id = $customer['custom_id'];
                    $record->is_active = true;
                }
                FieldChecker::setField('name', $record, $customer, $record->name);
                FieldChecker::setField('name2', $record, $customer, $record->name2);
                FieldChecker::setField('address', $record, $customer, $record->address);
                FieldChecker::setField('postal_code', $record, $customer, $record->postal_code);
                FieldChecker::setField('city', $record, $customer, $record->city);

                if (isset($customer['country_custom_id']) && $countries->has($customer['country_custom_id'])) {
                    $record->country_id = $countries[$customer['country_custom_id']];
                }

                if (isset($customer['sales_group_custom_id']) && $salesGroups->has($customer['sales_group_custom_id'])) {
                    $record->sales_group_id = $salesGroups[$customer['sales_group_custom_id']];
                }

                if (isset($customer['sales_area_custom_id']) && $salesAreas->has($customer['sales_area_custom_id'])) {
                    $record->sales_area_id = $salesAreas[$customer['sales_area_custom_id']];
                }

                if (isset($customer['customer_group_custom_id']) && $customerGroups->has($customer['customer_group_custom_id'])) {
                    $record->customer_group_id = $customerGroups[$customer['customer_group_custom_id']];
                }

                if (isset($customer['sector_custom_id']) && $sectors->has($customer['sector_custom_id'])) {
                    $record->sector_id = $sectors[$customer['sector_custom_id']];
                }

                FieldChecker::setField('telephone', $record, $customer, $record->telephone);
                FieldChecker::setField('email', $record, $customer, $record->email);
                FieldChecker::setField('vat', $record, $customer, $record->vat);
                FieldChecker::setField('total_insured', $record, $customer, $record->total_insured);
                FieldChecker::setField('total_production', $record, $customer, $record->total_production);
                FieldChecker::setField('total_outstanding', $record, $customer, $record->total_outstanding);
                FieldChecker::setField('total_revenue', $record, $customer, $record->total_revenue);


                if (isset($customer['delivery_term_custom_id']) && $deliveryTerms->has($customer['delivery_term_custom_id'])) {
                    $record->delivery_term_id = $deliveryTerms[$customer['delivery_term_custom_id']];
                }

                if (isset($customer['payment_term_custom_id']) && $paymentTerms->has($customer['payment_term_custom_id'])) {
                    $record->payment_term_id = $paymentTerms[$customer['payment_term_custom_id']];
                }

                FieldChecker::setField('is_active', $record, $customer, $record->is_active);

                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        // TODO: we should dispatch new job here
        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new CustomerSupplierImport('sd_kunde_lief', 1));
        }
        return 0;
    }
}

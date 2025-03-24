<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
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

class CustomerDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:customer';

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
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
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

        while ($chunk = $ds->customerDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $customer) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($customer->xml_id) && !in_array($customer->xml_id, $xmlIds)) {
                    $xmlIds[] = $customer->xml_id;
                }
                $record = Customer::where('custom_id', $customer->custom_id)->first();
                if (!$record) {
                    if (isset($customer->is_active) && !$customer->is_active) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Customer();
                    $record->custom_id = $customer->custom_id;
                    $record->is_active = true;
                }
                $record->name = $customer->name ?? $record->name;
                $record->name2 = $customer->name2 ?? $record->name2;
                $record->address = $customer->address ?? $record->address;
                $record->postal_code = $customer->postal_code ?? $record->postal_code;
                $record->city = $customer->city ?? $record->city;

                if (isset($customer->country_id_custom) && $countries->has($customer->country_id_custom)) {
                    $record->country_id = $countries[$customer->country_id_custom];
                }

                if (isset($customer->sales_group_id_custom) && $salesGroups->has($customer->sales_group_id_custom)) {
                    $record->sales_group_id = $salesGroups[$customer->sales_group_id_custom];
                }

                if (isset($customer->sales_area_id_custom) && $salesAreas->has($customer->sales_area_id_custom)) {
                    $record->sales_area_id = $salesAreas[$customer->sales_area_id_custom];
                }

                if (isset($customer->customer_group_id_custom) && $customerGroups->has($customer->customer_group_id_custom)) {
                    $record->customer_group_id = $customerGroups[$customer->customer_group_id_custom];
                }

                if (isset($customer->sector_id_custom) && $sectors->has($customer->sector_id_custom)) {
                    $record->sector_id = $sectors[$customer->sector_id_custom];
                }

                $record->telephone = $customer->telephone ?? $record->telephone;
                $record->vat = $customer->vat ?? $record->vat;
                $record->total_insured = $customer->total_insured ?? $record->total_insured;
                $record->total_production = $customer->total_production ?? $record->total_production;
                $record->total_outstanding = $customer->total_outstanding ?? $record->total_outstanding;
                $record->total_revenue = $customer->total_revenue ?? $record->total_revenue;


                if (isset($customer->delivery_term_id_custom) && $deliveryTerms->has($customer->delivery_term_id_custom)) {
                    $record->delivery_term_id = $deliveryTerms[$customer->delivery_term_id_custom];
                }

                if (isset($customer->payment_term_id_custom) && $paymentTerms->has($customer->payment_term_id_custom)) {
                    $record->payment_term_id = $paymentTerms[$customer->payment_term_id_custom];
                }

                $record->is_active = $customer->is_active ?? $record->is_active;

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

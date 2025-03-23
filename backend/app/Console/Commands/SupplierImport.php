<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\CustomerSupplierImport;
use App\Models\Supplier;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SupplierImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:supplier';

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
        $suppliers = $ds->suppliers();
        $xmlIds = [];

        foreach ($suppliers as $supplierChunks) {
            foreach ($supplierChunks as $supplier) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($supplier['xml_id']) && !in_array($supplier['xml_id'], $xmlIds)) {
                    $xmlIds[] = $supplier['xml_id'];
                }
                $record = Supplier::where('custom_id', $supplier['custom_id'])->first();
                if (!$record) {
                    if (isset($supplier['is_active']) && !$supplier['is_active']) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Supplier();
                    $record->custom_id = $supplier['custom_id'];
                    $record->is_active = true;
                }

                FieldChecker::setField('is_active', $record, $supplier, $record->is_active);
                FieldChecker::setField('name', $record, $supplier, $record->name);
                FieldChecker::setField('telephone', $record, $supplier, $record->telephone);
                FieldChecker::setField('email', $record, $supplier, $record->email);

                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        // TODO: we should dispatch new job here
        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new CustomerSupplierImport('sd_kunde_lief', 2));
        }
        return 0;
    }
}

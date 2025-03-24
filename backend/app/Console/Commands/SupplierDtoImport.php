<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\CustomerSupplierImport;
use App\Models\Supplier;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SupplierDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:supplier';

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

        while($chunk = $ds->supplierDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $supplier) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($supplier->xml_id) && !in_array($supplier->xml_id, $xmlIds)) {
                    $xmlIds[] = $supplier->xml_id;
                }
                $record = Supplier::where('custom_id', $supplier->custom_id)->first();
                if (!$record) {
                    if (isset($supplier->is_active) && !$supplier->is_active) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Supplier();
                    $record->custom_id = $supplier->custom_id;
                    $record->is_active = true;
                }

                $record->is_active = $supplier->is_active ?? $record->is_active;
                $record->name = $supplier->name ?? $record->name;

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

<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\ItemImport as JobsItemImport;
use App\Models\Bom;
use App\Models\DataImport;
use App\Models\Hall;
use App\Models\Item;
use App\Models\ItemGroup;
use App\Models\OperationPlan;
use App\Models\ResourceGroup;
use Illuminate\Console\Command;

class ResourceGroupImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:resourcegroup';

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

        $halls = collect();
        foreach (Hall::all() as $hall) {
            $halls[$hall->custom_id] = $hall->id;
        }

        while ($resourceGroups = $ds->resourceGroups($skip, $take)) {
            $skip += $take;
            $xmlIds = [];
            foreach ($resourceGroups as $resourceGroup) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($resourceGroup['xml_id']) && !in_array($resourceGroup['xml_id'], $xmlIds)) {
                    $xmlIds[] = $resourceGroup['xml_id'];
                }

                //Check if item exists
                $record = ResourceGroup::where('custom_id', $resourceGroup['custom_id'])->first();
                if (!$record) {
                    if (!(isset($resourceGroup['is_active']) && $resourceGroup['is_active'])) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new ResourceGroup();
                    $record->custom_id = $resourceGroup['custom_id'];
                    $record->is_active = true;
                }

                FieldChecker::setField('name', $record, $resourceGroup, $record->name);
                FieldChecker::setField('is_active', $record, $resourceGroup, $record->is_active);
                FieldChecker::setField('jpi_factor', $record, $resourceGroup, $record->jpi_factor);

                if (isset($resourceGroup['hall_custom_id']) && $halls->has($resourceGroup['hall_custom_id'])) {
                    $record->hall_id = $halls[$resourceGroup['hall_custom_id']];
                }

                $record->is_imported_from_erp = $resourceGroup['is_imported_from_erp'];
                $record->save();
            }

            // $xmlIds is valid then we will update the xmls table.
            if (count($xmlIds) > 0) {
                DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
            }
        }

        return 0;
    }
}

<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\DataImport;
use App\Models\Hall;
use App\Models\ResourceGroup;
use Illuminate\Console\Command;

class ResourceGroupDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:resourcegroup';

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
        
        $xmlIds = [];
        while ($chunk = $ds->resourceGroupDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $resourceGroup) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($resourceGroup->xml_id) && !in_array($resourceGroup->xml_id, $xmlIds)) {
                    $xmlIds[] = $resourceGroup->xml_id;
                }

                //Check if item exists
                $record = ResourceGroup::where('custom_id', $resourceGroup->custom_id)->first();
                if (!$record) {
                    if (!(isset($resourceGroup->is_active) && $resourceGroup->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new ResourceGroup();
                    $record->custom_id = $resourceGroup->custom_id;
                    $record->is_active = true;
                }

                $record->name = $resourceGroup->name ?? $record->name;
                $record->is_active = $resourceGroup->is_active ?? $record->is_active;
                $record->jpi_factor = $resourceGroup->jpi_factor ?? $record->jpi_factor;

                if (isset($resourceGroup->hall_id_custom) && $halls->has($resourceGroup->hall_id_custom)) {
                    $record->hall_id = $halls[$resourceGroup->hall_id_custom];
                }

                $record->is_imported_from_erp = $resourceGroup->is_imported_from_erp;
                $record->save();
            }
        }
        // $xmlIds is valid then we will update the xmls table.
        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return 0;
    }
}

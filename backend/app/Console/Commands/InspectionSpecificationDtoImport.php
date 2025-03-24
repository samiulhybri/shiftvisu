<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\AttributeSet;
use App\Models\AttributeSetOption;
use App\Models\DataImport;
use App\Models\InspectionSpecification;
use App\Models\InspectionSpecificationImportanceCode;
use App\Models\Plant;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class InspectionSpecificationDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:inspection_specifications';

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
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        $xmlIds = [];
        $plants = Plant::all()->pluck('id', 'custom_id');
        $importanceCodes = InspectionSpecificationImportanceCode::all()->pluck('id', 'custom_id');

        // Process inspection lots in chunks
        while ($chunk = $ds->inspectionSpecificationDtos($skip, $take)) {
            $skip += $take;

            foreach ($chunk as $inspectionSpecificationDto) {
                // Add unique xml_id to $xmlIds
                if (isset($inspectionSpecificationDto->xml_id) && !in_array($inspectionSpecificationDto->xml_id, $xmlIds)) {
                    $xmlIds[] = $inspectionSpecificationDto->xml_id;
                }

                InspectionSpecification::query()->updateOrCreate(
                    [
                        'plant_id' => $plants->get($inspectionSpecificationDto->plant_id_custom, $plants->first()),
                        'custom_id' => $inspectionSpecificationDto->custom_id,
                    ],
                    [
                        'inspection_specification_importance_code_id' => $importanceCodes->get($inspectionSpecificationDto->inspection_specification_importance_code_id_custom),
                    ]
                );
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::query()->whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return $this::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\AttributeSet;
use App\Models\AttributeSetOption;
use App\Models\DataImport;
use App\Models\Plant;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class AttributeSetDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:attribute_sets';

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

        // Process inspection lots in chunks
        while ($chunk = $ds->attributeSetDtos($skip, $take)) {
            $skip += $take;

            foreach ($chunk as $attributeSetDto) {
                // Add unique xml_id to $xmlIds
                if (isset($attributeSetDto->xml_id) && !in_array($attributeSetDto->xml_id, $xmlIds)) {
                    $xmlIds[] = $attributeSetDto->xml_id;
                }

                $attributeSet = AttributeSet::updateOrCreate(
                    [
                        'plant_id' => $plants->get($attributeSetDto->plant_id_custom),
                        'custom_id' => $attributeSetDto->custom_id,
                    ],
                    [
                        'internal_id' => $attributeSetDto->internal_id,
                    ]
                );

                foreach ($attributeSetDto->attributeSetOptions as $attributeSetOption) {

                    AttributeSetOption::updateOrCreate(
                        [
                            'attribute_set_id' => $attributeSet->id,
                            'custom_id' => $attributeSetOption->custom_id,
                        ],
                        [
                            'valuation' => $attributeSetOption->valuation,
                        ]
                    );
                }
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::query()->whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return Command::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Classification;
use App\Models\Item;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ClassificationImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:classification';

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

        $items = collect();
        foreach (Item::all() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        while ($classificationChunk = $ds->classifications($skip, $take)) {
            $skip += $take;
            foreach ($classificationChunk as $classification) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($classification['xml_id']) && !in_array($classification['xml_id'], $xmlIds)) {
                    $xmlIds[] = $classification['xml_id'];
                }

                if ($classification['model_type'] === Item::class && $items->has($classification['custom_id'])) {
                    Classification::updateOrCreate(
                        [
                            'model_type' => $classification['model_type'],
                            'model_id' => $items[$classification['custom_id']],
                            'class' => $classification['class'],
                            'attribute' => $classification['attribute'],
                        ],
                        [
                            'model_type' => $classification['model_type'],
                            'model_id' => $items[$classification['custom_id']],
                            'class' => $classification['class'],
                            'attribute' => $classification['attribute'],
                            'value_string' => $classification['value_string'],
                            'value_double' => $classification['value_double'],
                        ]
                    );
                }
            }

            if (count($xmlIds) > 0) {
                DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
            }
        }


        return 0;
    }
}

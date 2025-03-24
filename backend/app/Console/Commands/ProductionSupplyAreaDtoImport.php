<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Plant;
use App\Models\ProductionSupplyArea;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ProductionSupplyAreaDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:production_supply_area';

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

        $plants = collect();
        foreach (Plant::all() as $plant) {
            $plants[$plant->custom_id] = $plant->id;
        }

        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        while ($areaChunk = $ds->productionSupplyAreaDtos($skip, $take)) {
            $skip += $take;
            foreach ($areaChunk as $areaDto) {
                $area = ProductionSupplyArea::where('custom_id', $areaDto->custom_id)->first();
                if (!$area) {
                    if (!$areaDto->is_active) {
                        continue;
                    }
                    $area = new ProductionSupplyArea();
                    $area->custom_id = $areaDto->custom_id;
                }

                $area->is_active = $areaDto->is_active;
                $area->plant_id = $plants->get($areaDto->plant_id_custom);
                $area->save();
            }
        }

        return 0;
    }
}

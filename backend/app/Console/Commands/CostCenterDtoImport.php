<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\CostCenter;
use App\Models\CostCenterCost;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class CostCenterDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:costcenter';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all cost centers with costs and validity from source system';

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
        while ($chunk = $ds->costCenterDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $costCenter) {
                if (isset($costCenter->xml_id) && !in_array($costCenter->xml_id, $xmlIds)) {
                    $xmlIds[] = $costCenter->xml_id;
                }

                $record = CostCenter::where('custom_id', $costCenter->custom_id)->first();
                if (!$record) {
                    $record = new CostCenter();
                    $record->custom_id = $costCenter->custom_id;
                }

                $record->is_active = $costCenter->is_active ?? $record->is_active;

                $record->save();


                $recordCost = CostCenterCost::where('cost_center_id', $record->id)
                    ->where('valid_from', $costCenter->valid_from)
                    ->where('valid_to', $costCenter->valid_to)
                    ->first();

                if (!$recordCost) {
                    $recordCost = new CostCenterCost();
                    $recordCost->cost_center_id = $record->id;
                    $recordCost->valid_from = $costCenter->valid_from;
                    $recordCost->valid_to = $costCenter->valid_to;
                }

                $recordCost->cost = $costCenter->cost ?? $recordCost->cost;
                $recordCost->cost_type = $costCenter->cost_type ?? $recordCost->cost_type;

                $recordCost->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return 0;
    }
}

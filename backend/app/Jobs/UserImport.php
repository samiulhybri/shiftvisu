<?php

namespace App\Jobs;

use App\ExternalDataSource\LocalQueryDataSource;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class UserImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The table name of base visu where we will insert or update data
     *
     * @var array
     */
    private $baseVisuTable;

    /**
     * Create a new job instance.
     * 
     * @return void
     */
    public function __construct($baseVisuTable)
    {
        $this->baseVisuTable = $baseVisuTable;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $allBaseTableData = LocalQueryDataSource::user();
        foreach ($allBaseTableData as $baseTableData) {
            DB::connection('base_visu')
                ->table($this->baseVisuTable)
                ->upsert(
                    $baseTableData['columns'],
                    $baseTableData['identifiers'],
                    $baseTableData['to_update'],
                );
        }
        if (env('EXTERNAL_DS_TARGET') == 'at') {
            $this->updateOrInsertUserPermission();
        }
        echo "success"; // msg will be changed after testing
    }
    private function updateOrInsertUserPermission()
    {
        $v9Permissions = DB::connection('old_base_visu')
            ->table('t_user_permission')
            ->whereNot('mitarbeiternr', '')
            ->get(['mitarbeiternr', 'user_type', 'basevisu', 'castvisu', 'mesvisu', 'shiftvisu', 'docvisu', 'capacity', 'toolvisu', 'processvisu', 'tpmvisu', 'leanvisu', 'planvisu', 'shopfloor', 'taskvisu', 'qualivisu', 'reportvisu']);

        foreach ($v9Permissions as $data) {
            // Convert the object to an array
            $dataArray = (array) $data;

            // Add the additional fields with default values
            $dataArray['personalvisu'] = 0;
            $dataArray['meltvisu'] = 0;
            $dataArray['enervisu'] = 0;
            $dataArray['shopfloorboard'] = 0;
            $dataArray['cmmvisu'] = 0;

            DB::connection('base_visu')
                ->table('t_user_permission')
                ->upsert(
                    $dataArray,
                    ['mitarbeiternr'], // Unique column
                    ['user_type', 'basevisu', 'castvisu', 'mesvisu', 'shiftvisu', 'docvisu', 'capacity', 'toolvisu', 'processvisu', 'tpmvisu', 'leanvisu', 'planvisu', 'shopfloor', 'taskvisu', 'qualivisu', 'reportvisu', 'personalvisu', 'meltvisu', 'enervisu', 'shopfloorboard', 'cmmvisu'] // Columns to update
                );
        }
    }
}

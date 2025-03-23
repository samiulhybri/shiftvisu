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

class HallImport implements ShouldQueue
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
        $allBaseTableData = LocalQueryDataSource::hall();
        foreach ($allBaseTableData as $baseTableData) {
            DB::connection('base_visu')
                ->table($this->baseVisuTable)
                ->upsert(
                    $baseTableData['columns'],
                    $baseTableData['identifiers'],
                    $baseTableData['to_update'],
                );
        }
        echo "success"; // msg will be changed after testing
    }
}

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

class TpmSubGroupImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The table name of base visu where we will insert or update data
     *
     * @var array
     */
    private $baseVisuTable;
    private $sourceCustomIds;
    private $shouldDeleteWhenSync;

    /**
     * Create a new job instance.
     * 
     * @return void
     */
    public function __construct($baseVisuTable, $shouldDeleteWhenSync = false, $sourceCustomIds = [])
    {
        $this->baseVisuTable = $baseVisuTable;
        $this->sourceCustomIds = $sourceCustomIds;
        $this->shouldDeleteWhenSync = $shouldDeleteWhenSync;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $baseTableData = LocalQueryDataSource::tpmSubGroups();
        $baseVisuTable = DB::connection('base_visu')
            ->table($this->baseVisuTable);
        $baseVisuTable->upsert(
            $baseTableData['columns'],
            $baseTableData['identifiers'],
            $baseTableData['to_update'],
        );

        // now delete the records that are not exist in ERP
        if ($this->shouldDeleteWhenSync) {
            $baseVisuTable
            ->whereNotIn('custom_id', $this->sourceCustomIds)
            ->where('type', '=', 3)
            ->where('is_erp_', '=', 1)
            ->delete();
        }
        echo "success"; // msg will be changed after testing
    }
}

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

class MachineGroupImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The table name of base visu where we will insert or update data
     *
     * @var array
     */
    private $baseVisuTable;

    /**
     * The identification of machine group in t_base_combo
     * TODO: later we will make one single method for all t_base_combo
     * then it will help us for identification.
     *
     * @var int
     */
    private $type;

    /**
     * Create a new job instance.
     * 
     * @return void
     */
    public function __construct($baseVisuTable, $type)
    {
        $this->baseVisuTable = $baseVisuTable;
        $this->type = $type;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $baseTableData = LocalQueryDataSource::machineGroup($this->type);
        DB::connection('base_visu')
            ->table($this->baseVisuTable)
            ->upsert(
                $baseTableData['columns'],
                $baseTableData['identifiers'],
                $baseTableData['to_update'],
            );
        echo "success"; // msg will be changed after testing
    }
}

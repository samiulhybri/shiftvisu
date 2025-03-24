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
use function PHPUnit\Framework\isNull;

class MachineImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The table name of base visu where we will insert or update data
     *
     * @var array
     */
    private $baseVisuTable;
    private $toUpdate;
    private $sourceCustomIds;
    private $shouldDeleteWhenSync;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($baseVisuTable, $toUpdate, $shouldDeleteWhenSync = false, $sourceCustomIds = [])
    {
        $this->baseVisuTable = $baseVisuTable;
        $this->toUpdate = $toUpdate;
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
        $baseTableData = LocalQueryDataSource::machine();

        $baseVisuTable = DB::connection('base_visu')
            ->table($this->baseVisuTable);

        foreach ($baseTableData['columns'] as $value) {
            $query = $baseVisuTable->clone();
            foreach ($baseTableData['identifiers'] as $identifier) {
                $query->where($identifier, '=', $value[$identifier]);
            }
            $exists = $query->exists();
            if ($exists) {
                $updates = [];
                if ($this->toUpdate == null) {
                    $updates = $value;
                } else {
                    foreach ($this->toUpdate as $key) {
                        $updates[$key] = $value[$key];
                    }
                }

                $query->update($updates);
            } else {
                $baseVisuTable->insert($value);
            }
        }


        if ($this->shouldDeleteWhenSync) {
            $baseVisuTable
                ->whereNotIn('maschinenr', $this->sourceCustomIds)
                ->where('is_erp', '=', 1)
                ->delete();
        }
        echo "success"; //TODO: msg will be changed after testing
    }
}

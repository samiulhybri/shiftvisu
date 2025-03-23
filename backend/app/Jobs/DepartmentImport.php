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

class DepartmentImport implements ShouldQueue
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
    private $sourceCustomIds;
    private $shouldDeleteWhenSync;

    /**
     * Create a new job instance.
     * 
     * @return void
     */
    public function __construct($baseVisuTable, $type, $shouldDeleteWhenSync = false, $sourceCustomIds = [])
    {
        $this->baseVisuTable = $baseVisuTable;
        $this->type = $type;
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
        $baseTableData = LocalQueryDataSource::departments($this->type);
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
                ->where('type', '=', $this->type)
                ->where('is_erp_', '=', 1)
                ->delete();
        }

        // To adjust exist data for Autotest shift visu data update ht Halle/Department with V10 DB data;
        if (env('EXTERNAL_DS_TARGET') == 'at') {
            $this->updateTBaseComboDeptId();
            $this->updateTBaseComboValue();
        }

        echo "success"; // msg will be changed after testing
    }

    public function updateTBaseComboValue()
    {
        $records = DB::connection('base_visu')
            ->table('t_base_combo')
            ->where('type', 19)
            ->get(['id', 'value', 'custom_id']);


        foreach ($records as $record) {
            if ($record) {
                $info = DB::connection('old_base_visu')
                    ->table('t_base_combo')
                    ->where('id', $record->custom_id)
                    ->first(['value']);

                if ($info) {
                    DB::connection('base_visu')
                        ->table('t_base_combo')
                        ->where('id', $record->id)
                        ->update(['value' => $info->value]);
                }
            }
        }
    }

    public function updateTBaseComboDeptId()
    {
        $rows = DB::connection('base_visu')
            ->table('t_base_combo')
            ->where('type', 19)
            ->get(['id', 'dept_id']);

        $rows->each(function ($row) {
            $newHalleIds = collect(explode(',', $row->dept_id))
                ->map(function ($halleId) {
                    $halleId = trim($halleId);

                    $customId = DB::connection()
                        ->table('halls')
                        ->where('id', $halleId)
                        ->value('custom_id');

                    if ($customId) {
                        return $this->getNewHalleId($customId, $halleId);
                    }

                    return $halleId;
                })
                ->implode(',');

            DB::connection('base_visu')
                ->table('t_base_combo')
                ->where('id', $row->id)
                ->update(['dept_id' => $newHalleIds]);
        });
    }

    private function getNewHalleId($customId, $defaultId)
    {
        $tempHalleId = DB::connection('base_visu')
            ->table('sd_halle')
            ->where('hallenr', $customId)
            ->value('id');

        return $tempHalleId ?: $defaultId;
    }
}

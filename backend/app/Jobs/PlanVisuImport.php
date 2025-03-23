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

class PlanVisuImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The tables name of Plan visu where we will insert or update data
     *
     * @var array
     */
    private $planVisuTable;

    /**
     * Create a new job instance.
     * 
     * @return void
     */
    public function __construct($planVisuTable = ['t_auftrag', 't_auftrag_teile'])
    {
        $this->planVisuTable = $planVisuTable;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $allBaseTableData = LocalQueryDataSource::order();
        foreach ($allBaseTableData as $baseTableData) {
            $t_auftrag_info = $baseTableData['t_auftrag_info'];
            $t_auftrag_teile_info = $baseTableData['t_auftrag_teile_info'];

            foreach (collect($t_auftrag_info['columns'])->chunk(env("DATA_CHUNK_SIZE")) as $columnsChunk) {
                DB::connection('plan_visu')
                    ->table($this->planVisuTable[0])
                    ->upsert(
                        $columnsChunk->toArray(),
                        $t_auftrag_info['identifiers'],
                        $t_auftrag_info['to_update'],
                    );
            }

            foreach (collect($t_auftrag_teile_info['columns'])->chunk(env("DATA_CHUNK_SIZE")) as $columnsChunk) {
                DB::connection('plan_visu')
                    ->table($this->planVisuTable[1])
                    ->upsert(
                        $columnsChunk->toArray(),
                        $t_auftrag_teile_info['identifiers'],
                        $t_auftrag_teile_info['to_update'],
                    );
            }
        }

        /**
         * remove order from diecast->t_location table data if order is closed or deleted
         * update bde_auftrag.t_rusten_info table data if order is closed or deleted
         */
        foreach ($allBaseTableData as $baseTableData) {
            $t_auftrag_info = $baseTableData['t_auftrag_info'];
            foreach (collect($t_auftrag_info['columns'])->chunk(env("DATA_CHUNK_SIZE")) as $columnsChunk) {
                $mappeedOrders = $columnsChunk->toArray();
                foreach ($mappeedOrders as $orderData) {
                    if($orderData["status"] == 99) {
                        // remove order from diecast->t_location table data if order is closed or deleted
                        $this->removeClosedOrder($orderData["auf_nr"]);

                        // update bde_auftrag.t_rusten_info table data if order is closed or deleted
                        $this->updateRustenInfo($orderData["auf_nr"]);
                    }
                }
            }
        }
    }

    /**
     * remove order from diecast->t_location table data if order is closed or deleted
     */
    private function removeClosedOrder($searchedValue) {

        // Step 1: Fetch all rows where auf_list contains the searched value
        $locations = DB::connection('diecast')
                    ->table('t_location')
                    ->where('auf_list', 'LIKE', '%' . $searchedValue . '%')
                    ->get();

        // Check if any rows were found
        if ($locations->isNotEmpty()) {
            foreach ($locations as $location) {

                // Step 2: Split auf_list and cavity into arrays
                $aufListArray = explode(',', $location->auf_list);
                $cavityArray = explode(',', $location->cavity);

                // Step 3: Find the index of the searched value in auf_list
                $index = array_search($searchedValue, $aufListArray);

                if ($index !== false) {
                    // Step 4: Remove the value from both auf_list and cavity arrays
                    array_splice($aufListArray, $index, 1);
                    array_splice($cavityArray, $index, 1);

                    // Step 5: Convert the arrays back into comma-separated strings
                    $newAufList = implode(',', $aufListArray);
                    $newCavity = implode(',', $cavityArray);

                    // Step 6: Update the database row with the modified auf_list and cavity values
                    DB::connection('diecast')
                        ->table('t_location')
                        ->where('id_machine', $location->id_machine) // Ensure updating the correct row
                        ->update([
                            'auf_list' => $newAufList ? $newAufList : 0,
                            'cavity' => $newCavity,
                        ]);
                }
            }
        }
    }

    /**
     * update bde_auftrag.t_rusten_info table data if order is closed or deleted
     */
    private function updateRustenInfo($orderCustomId) {
        // Step 1: Fetch row where order is InPreparation
        $rustenInfo = DB::connection('bde_auftrag')
            ->table('t_rusten_info')
            ->where('auftrag_nr', 'LIKE', '%' . $orderCustomId . '%')
            ->whereNull('ende_zeit')
            ->first();

        if ($rustenInfo) {
            // Step 2: Update the row with the current timestamp
            DB::connection('bde_auftrag')
                ->table('t_rusten_info')
                ->where('id', $rustenInfo->id)
                ->update([
                    'ende_zeit' => now()
                ]);
        }

        
    }
}

<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Tool;
use App\Models\ToolGroup;
use Illuminate\Console\Command;
use App\Jobs\ToolImport as JobsToolImport;
use App\Models\Item;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ToolDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:tool';

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

        $toolGroups = ToolGroup::all()->pluck('id', 'custom_id');

        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        while ($chunk = $ds->toolDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $tool) {
                $record = Tool::where('custom_id', $tool->custom_id)->first();
                if (!$record) {
                    if (!$tool->is_active) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Tool();
                    $record->custom_id = $tool->custom_id;
                    $record->construction_year = null;
                    $record->cavity = null;
                }

                $record->name =  $tool->name ?? $record->name;
                $record->is_active =  $tool->is_active ?? $record->is_active;
                $record->construction_year =  $tool->construction_year ?? $record->construction_year;
                $record->cavity =  $tool->cavity ?? $record->cavity;
                $record->guaranteed_quantity =  $tool->guaranteed_quantity ?? $record->guaranteed_quantity;
                $record->storage_shelf =  $tool->storage_shelf ?? $record->storage_shelf;
                $record->storage_level =  $tool->storage_level ?? $record->storage_level;
                $record->storage_compartment =  $tool->storage_compartment ?? $record->storage_compartment;
                $record->storage_location =  $tool->storage_location ?? $record->storage_location;
                if ($tool->tool_group_custom_ids !== null) {
                    $record->toolGroups()->sync($toolGroups->only($tool->tool_group_custom_ids));
                }

                $record->save();
                $mainToolId =  $tool->main_tool_id ?? null;

                # Insert tools data into Items table
                $this->insertToolsDataIntoItemsTable($record, $mainToolId);
            }
        }
        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch((new JobsToolImport('sd_werkzeuge')));
        }
        return 0;
    }

    /**
     * INSERT TOOLS TABLE DATA INTO ITEMS TABLE
     * 
     * @param $tool
     */
    private function insertToolsDataIntoItemsTable($tool, $mainToolId =null)
    {
        $record = Item::where('custom_id', $tool['custom_id'])->first();
        if (!$record) {
            if ((isset($tool['is_active']) && $tool['is_active'] == 1)) {
                $record = new Item();
                $record->custom_id = $tool['custom_id'];
                $record->is_tool = 1;
            }
        } else {
            if ($tool['is_active']) {
                $record->is_tool = 1;
            } else {
                $record->is_tool = 0;
            }
        }

        if($record) {
            FieldChecker::setField('name', $record, $tool, $record->name);
            FieldChecker::setField('custom_id', $record, $tool, $record->custom_id);
            FieldChecker::setField('is_active', $record, $tool, $record->is_active);
            $record->main_tool_id = $mainToolId;
            $record->save();
        }
    }
}

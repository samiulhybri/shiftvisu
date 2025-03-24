<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Tool;
use Illuminate\Console\Command;
use App\Jobs\ToolImport as JobsToolImport;
use App\Models\Item;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ToolImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:tool';

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

        $tools = $ds->tools();
        foreach ($tools as $toolChunks) {
            foreach ($toolChunks as $tool) {
                $record = Tool::where('custom_id', $tool['custom_id'])->first();
                if (!$record) {
                    if (!(isset($tool['is_active']) && $tool['is_active'])) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new Tool();
                    $record->custom_id = $tool['custom_id'];
                    $record->construction_year = null;
                    $record->cavity = null;
                }

                FieldChecker::setField('name', $record, $tool, $record->name);
                FieldChecker::setField('custom_id', $record, $tool, $record->custom_id);
                FieldChecker::setField('is_active', $record, $tool, $record->is_active);
                FieldChecker::setField('construction_year', $record, $tool, $record->construction_year);
                FieldChecker::setField('cavity', $record, $tool, $record->cavity);
                $record->save();
                $record->height = $tool['height'];
                $record->length = $tool['length'];
                $record->width = $tool['width'];
                $record->total_weight = $tool['total_weight'];
                $this->insertTool($record);
            }
        }
        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch((new JobsToolImport('sd_werkzeuge')));
        }
        return 0;
    }

    private function insertTool($tool)
    {
        $record = Item::where('custom_id', $tool['custom_id'])->first();
        if (!$record) {
            if ((isset($tool['is_active']) && $tool['is_active'] == 1)) {
                $record = new Item();
                $record->custom_id = $tool['custom_id'];
                $record->is_tool = 1;
            }
        }
        if ($tool['is_active']) {
            $record->is_tool = 1;
        } else {
            $record->is_tool = 0;
        }

        FieldChecker::setField('name', $record, $tool, $record->name);
        FieldChecker::setField('custom_id', $record, $tool, $record->custom_id);
        FieldChecker::setField('is_active', $record, $tool, $record->is_active);
        FieldChecker::setField('height', $record, $tool, $record->height);
        FieldChecker::setField('width', $record, $tool, $record->width);
        FieldChecker::setField('length', $record, $tool, $record->length);
        FieldChecker::setField('total_weight', $record, $tool, $record->total_weight);
        $record->save();
    }
}

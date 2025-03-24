<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\BaseTableImport;
use App\Models\ItemState;
use App\Jobs\ItemStateImport as JobsItemStateImport;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ItemStateImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:item_states';

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
        $itemStates = $ds->itemStates();
        $xmlIds = [];

        foreach ($itemStates as $itemState) {
            // we will update one xml id only one time
            // keep unique ids
            if (isset($itemState['xml_id']) && !in_array($itemState['xml_id'], $xmlIds)) {
                $xmlIds[] = $itemState['xml_id'];
            }
            $record = ItemState::where('custom_id', $itemState['custom_id'])->first();
            if (!$record) {
                if (!(isset($itemState['is_active']) && $itemState['is_active'])) {
                    //Do not create new records if they are anyways not active
                    continue;
                }

                $record = new ItemState();
                $record->custom_id = $itemState['custom_id'];
                $record->is_active = true;
            }

            FieldChecker::setField('name', $record, $itemState, $record->name);
            FieldChecker::setField('is_active', $record, $itemState, $record->is_active);
            $record->save();
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new JobsItemStateImport('t_base_combo', 21));
        }
        return 0;
    }
}

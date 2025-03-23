<?php

namespace App\Jobs;

use App\ExternalDataSource\BaseVisuComboDataSource;
use App\Models\ItemState;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class BaseTableImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * combo data type is need to retrive the combo data from base
     *
     * @var integer
     */
    private $comboDataType;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($comboDataType)
    {
        $this->comboDataType = $comboDataType;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $dataSource = new BaseVisuComboDataSource($this->comboDataType);
        $itemStateInfos = $dataSource->getData();

        foreach ($itemStateInfos as $itemStateInfo) {
            try {
                $itemState = ItemState::UpdateOrCreate(
                    ['custom_id' => $itemStateInfo->id],
                    ['name' => $itemStateInfo->name]
                );
                $halls = !$itemStateInfo->dept_id ? [] : explode(',', $itemStateInfo->dept_id);
                $itemState->halls()->sync($halls);
            } catch (Exception $exception) {
                print_r($exception);
            }
        }
    }
}

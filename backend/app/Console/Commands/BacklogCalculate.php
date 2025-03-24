<?php

namespace App\Console\Commands;

use App\Http\Controllers\BacklogCalculationController;
use App\Jobs\BacklogCalculation;
use App\Models\BacklogItem;
use App\Models\BacklogItemWeek;
use App\Models\CallOff;
use App\Models\Item;
use App\Models\ProdOrderPos;
use App\Models\SimCallOff;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class BacklogCalculate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backlog:calculate {item_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate the item backlog';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $item_id = $this->argument('item_id');

        if(env('EXTERNAL_DS_TARGET') == 'vop') {
            if($item_id) {
                $controller = new BacklogCalculation([$item_id]);
            } else {
                $controller = new BacklogCalculation();
            }
        } else {
            if($item_id) {
                $controller = new BacklogCalculationController([$item_id]);
            } else {
                $controller = new BacklogCalculationController();
            }
        }

        $controller->handle();

        return 0;
    }
}

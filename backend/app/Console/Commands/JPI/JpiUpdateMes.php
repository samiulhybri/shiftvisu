<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUpdateMes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:update_mes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates start, end in prod_order_pos and start, end, machineId, userId in prod_order_pos_operation from the jpi tables. Starts V10 Synchro Job';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->updateMes();

        return Command::SUCCESS;
    }
}

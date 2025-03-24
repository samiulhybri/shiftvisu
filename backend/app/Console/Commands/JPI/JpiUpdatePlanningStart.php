<?php

namespace App\Console\Commands\JPI;

use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUpdatePlanningStart extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:update-planning-start';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->updatePlanningStart();
    }
}

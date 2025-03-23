<?php

namespace App\Console\Commands\JPI;

use App\Contracts\JpiImportStrategy;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class JpiImportProdOrderJobTasks extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:import_prod_orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes prod_orders with pos and operations and generates jpi_jobs, jpi_tasks, jpi_job_tasks, jpi_task_resource_group_constraints and jpi_task_predecessors';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        resolve(JpiImportStrategy::class)->importJpiJobs();
    }
}

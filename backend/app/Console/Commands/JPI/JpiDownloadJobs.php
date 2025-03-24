<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiDownloadJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:download_jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates planned_start, planned_end in jpi_jobs and planned_start, planned_end, assigned_resource1, assigned_resource2 in jpi_tasks from the cloud';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->cloudDownloadJobsWithTasks();

        return Command::SUCCESS;
    }
}

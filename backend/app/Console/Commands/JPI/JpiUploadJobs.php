<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUploadJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:upload_jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes jpi_jobs with tasks and constraints and uploads them to the cloud';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->cloudUploadJobsWithTasks();

        return Command::SUCCESS;
    }
}

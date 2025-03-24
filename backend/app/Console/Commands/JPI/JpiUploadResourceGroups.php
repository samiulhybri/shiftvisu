<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUploadResourceGroups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:upload_resource_groups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes jpi_resource_groups and uploads them to the cloud';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->cloudUploadResourceGroups();

        return Command::SUCCESS;
    }
}

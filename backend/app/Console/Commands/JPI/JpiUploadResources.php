<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUploadResources extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:upload_resources';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes jpi_resources and uploads them to the cloud';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->cloudUploadResources();

        return Command::SUCCESS;
    }
}

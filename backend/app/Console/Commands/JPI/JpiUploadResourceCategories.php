<?php

namespace App\Console\Commands\JPI;


use App\Http\Controllers\JpiController;
use Illuminate\Console\Command;

class JpiUploadResourceCategories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:upload_resource_categories';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes jpi_resource_categories and uploads them to the cloud';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $controller = new JpiController();

        $controller->cloudUploadResourceCategories();

        return Command::SUCCESS;
    }
}

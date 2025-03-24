<?php

namespace App\Console\Commands\JPI;

use App\Models\Hall;
use App\Models\Model\JpiResourceCategory;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class JpiImportHallResourceCategories extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:import_halls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes halls and generates jpi_resource_categories';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $halls = env("EXTERNAL_DS_TARGET") == "sct" ?
            Hall::where('is_active', true)->lazyById(env('DATA_CHUNK_SIZE')) :
            (
                env("EXTERNAL_DS_TARGET") == "ict" ?
                Hall::whereIn('custom_id', ['BK-HYDRAULISCH', 'BK-HYDRAULISCH-MA'])
                    ->where('is_active', true)->lazyById(env('DATA_CHUNK_SIZE')) :
                Hall::whereIn('custom_id', ['BK-ISOLIERT', 'BK-ISOLIERT-MA', 'BK-HYDRAULISCH', 'BK-HYDRAULISCH-MA'])
                    ->where('is_active', true)->lazyById(env('DATA_CHUNK_SIZE'))
            );

        foreach ($halls as $hall) {
            JpiResourceCategory::updateOrCreate([
                'model_id' => $hall->id,
                'model_type' => Hall::class
            ], [
                'model_type' => Hall::class,
                'model_id' => $hall->id,
                'name' => $hall->name,
                'is_deleted' => !($hall->is_active),
            ]);
        }

        return Command::SUCCESS;
    }
}

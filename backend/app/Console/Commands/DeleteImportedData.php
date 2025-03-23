<?php

namespace App\Console\Commands;

use App\Models\DataImport;
use Illuminate\Console\Command;

class DeleteImportedData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data-imports:delete-imported {start?}';

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
        $start = $this->argument("start") ?? now()->subMonth();
        DataImport::query()
            ->where("is_imported", 1)
            ->where("created_at", "<", $start)
            ->delete();
    }
}

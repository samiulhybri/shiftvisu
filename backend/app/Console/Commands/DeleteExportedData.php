<?php

namespace App\Console\Commands;

use App\Models\DataExport;
use Illuminate\Console\Command;

class DeleteExportedData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data-exports:delete-exported {start?}';

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
        DataExport::query()
            ->where("is_exported", 1)
            ->where("created_at", "<", $start)
            ->delete();
    }
}

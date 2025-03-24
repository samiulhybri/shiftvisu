<?php

namespace App\Console\Commands;

use App\Models\MpOffer;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MPOfferFilterUnsavedEntires extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'filter:unsaved-entries';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Filter out entries with is_saved=0';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        MpOffer::where('is_saved', 0)
            ->where('custom_id', null)
            ->delete();

        Log::info('Entries with is_saved=0 have been filtered out.');
    }
}

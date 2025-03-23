<?php

namespace App\Console\Commands;

use App\Models\FcmToken;
use Illuminate\Console\Command;

class FcmTokenCleanup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fcm_tokens:cleanup_stale {stale_days=60}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete stale FCM tokens';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $stale_days = $this->argument('stale_days');

        FcmToken::where('updated_at', '<', now()->subDays($stale_days))
            ->delete();

        return 0;
    }
}

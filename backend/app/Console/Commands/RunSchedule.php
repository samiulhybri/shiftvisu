<?php

namespace App\Console\Commands;

use App\Http\Controllers\CommandController;
use App\Models\CommandSchedule;
use Cron\CronExpression;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Throwable;

class RunSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command-schedule:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run commands based on the custom command_schedules table';

    /**
     * Execute the console command.
     */
    public function handle(CommandController $commandController): void
    {
        $commands = CommandSchedule::where('is_active', true)
            ->orderBy('priority', 'asc')
            ->get();

        foreach ($commands as $command) {
            $cronExpression = new CronExpression($command->cron_expression);

            $shouldRun = $cronExpression->isDue() ||
                $command->last_run_at === null ||
                Carbon::parse($cronExpression->getPreviousRunDate(timeZone: env('APP_TIMEZONE')))
                    ->isAfter($command->last_run_at);

            if ($shouldRun) {
                $this->info('Running command: ' . $command->command);
                try {
                    $commandController->runCommand($command);
                }
                catch (Throwable $e) {
                    Log::error($e->getMessage());
                }
            }
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\MachineUserTime;
use App\Models\Shift;
use Illuminate\Console\Command;
use Carbon\Carbon;

class AutoClockOut extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:machine_user_times';

    public function handle()
    {

        // Get current time
        $currentTime = Carbon::now();

        // Get all records where end time is null and shift_id is not null, with the related shift loaded
        $machineUserTimes = MachineUserTime::whereNull('end')
            ->whereNotNull('shift_id')
            ->with('shift')
            ->get();

        foreach ($machineUserTimes as $time) {

            // Get the associated shift
            $shift = $time->shift;

            if ($shift) {
                $shiftEndTime = Carbon::parse($shift->end_time);

                // Check if the current time is greater than the shift's end time
                if ($currentTime->greaterThanOrEqualTo($shiftEndTime)) {
                    // Update the end time in machine_user_times table
                    $time->end = $shiftEndTime;
                    $time->save();
                }
            }
        }
    }
}

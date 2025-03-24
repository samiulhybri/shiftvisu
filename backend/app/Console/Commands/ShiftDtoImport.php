<?php

namespace App\Console\Commands;

use App\Enums\DateToConsider;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Shift;
use App\Models\ShiftModel;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ShiftDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:shift';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        while ($chunk = $ds->shiftDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $shiftDto) {
                $shift = Shift::where('custom_id', $shiftDto->custom_id)->first();
                if (!$shift) {
                    $shift = new Shift();
                    $shift->custom_id = $shiftDto->custom_id;
                }
                $shift->name = $shiftDto->name;
                $shift->start_time = $shiftDto->start_time;
                $shift->end_time = $shiftDto->end_time;
                $shift->date_to_consider = $shiftDto->date_to_consider ?? DateToConsider::SHIFT_START();
                $shift->break_minutes = $shiftDto->break_minutes;
                $shift->save();
            }
        }
        return 0;
    }
}

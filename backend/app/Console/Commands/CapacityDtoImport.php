<?php

namespace App\Console\Commands;

use App\Enums\DateToConsider;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Capacity;
use App\Models\Hall;
use App\Models\Machine;
use App\Models\Setting;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class CapacityDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:capacity';

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

        $halls = Hall::all()->pluck('id', 'custom_id');
        $machines = Machine::all()->pluck('id', 'custom_id');
        $shifts = Shift::all()->mapWithKeys(fn($shift) => [$shift->custom_id => $shift]);
        $setting = Setting::first();

        $importedIds = [];

        $importStart = now()->addDay()->toDateString();

        $hasImportedCapacities = false;

        while ($capacityChunks = $ds->capacityDtos($skip, $take)) {
            $hasImportedCapacities = true;
            $skip += $take;

            foreach ($capacityChunks as $capacityDto) {
                $date = Carbon::parse($capacityDto->date);

                if ($date->isBefore($importStart)) {
                    continue;
                }

                if ($capacityDto->machine_id_custom) {
                    if (!isset($machines[$capacityDto->machine_id_custom])) {
                        continue;
                    }

                    $model = Machine::class;
                    $modelId = $machines[$capacityDto->machine_id_custom];
                } elseif ($capacityDto->hall_id_custom) {
                    if (!isset($halls[$capacityDto->hall_id_custom])) {
                        continue;
                    }

                    $model = Hall::class;
                    $modelId = $halls[$capacityDto->hall_id_custom];
                } else {
                    $model = Setting::class;
                    $modelId = $setting->id;
                }

                $data = [
                    'date' => $date->toDateString(),
                    'capacitable_id' => $modelId,
                    'capacitable_type' => $model,
                ];

                if ($capacityDto->shift) {
                    $shift = Shift::updateOrCreate(
                        [
                            'custom_id' => $capacityDto->shift->custom_id,
                        ],
                        [
                            'name' => $capacityDto->shift->name,
                            'start_time' => $capacityDto->shift->start_time,
                            'end_time' => $capacityDto->shift->end_time,
                            'break_minutes' => $capacityDto->shift->break_minutes,
                            'date_to_consider' => $capacityDto->shift->date_to_consider,
                        ]
                    );

                    $data['shift_id'] = $shift->id;
                    $data['start_time'] = $shift->start_time;
                    $data['end_time'] = $shift->end_time;
                    $data['break_minutes'] = $shift->break_minutes;
                    $data['date_to_consider'] = $shift->date_to_consider;
                } else if ($shift = $shifts->get($capacityDto->shift_id_custom)) {
                    $data['shift_id'] = $shift->id;
                    $data['start_time'] = $shift->start_time;
                    $data['end_time'] = $shift->end_time;
                    $data['break_minutes'] = $shift->break_minutes;
                    $data['date_to_consider'] = $shift->date_to_consider;
                } else {
                    $data['start_time'] = $capacityDto->start_time;
                    $data['end_time'] = $capacityDto->end_time;
                    $data['break_minutes'] = $capacityDto->break_minutes;
                    $data['date_to_consider'] = $capacityDto->date_to_consider;
                }

                $capacity = Capacity::updateOrCreate(
                    $data
                );

                $importedIds[] = $capacity->id;
            }

        }

        if ($hasImportedCapacities) {
            Capacity::query()
                ->whereNotIn('id', $importedIds)
                ->whereIn('capacitable_type', [Machine::class, Hall::class, Setting::class])
                ->where('date', '>=', $importStart)
                ->delete();
        }

        return 0;
    }
}

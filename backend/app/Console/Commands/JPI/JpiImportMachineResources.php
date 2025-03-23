<?php

namespace App\Console\Commands\JPI;

use App\Enums\DateToConsider;
use App\Models\Capacity;
use App\Models\Hall;
use App\Models\JpiCalendarException;
use App\Models\JpiWorkTimePerWeekday;
use App\Models\Model\JpiResourceCategory;
use App\Models\Model\JpiResourceGroup;
use App\Models\Machine;
use App\Models\Model\JpiResource;
use App\Models\ResourceGroup;
use App\Models\ShiftModel;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Database\Eloquent\Collection;


class JpiImportMachineResources extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:import_machines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes machines with associated resource groups and generates jpi_resources and jpi_resource_groups';

    public static function calculateWorktimePerWeekday(int $jpiResourceId, ?ShiftModel $shiftModel): array
    {
        $workTimePerWeekdays = [];

        if ($shiftModel) {
            foreach ($shiftModel->shifts as $shift) {
                $weekday = $shift->pivot->day_of_week;
                $weekdayBefore = ($shift->pivot->day_of_week + 6) % 7;
                $weekdayAfter = ($shift->pivot->day_of_week + 1) % 7;

                if ($shift->start_time > $shift->end_time) {
                    if ($shift->date_to_consider == DateToConsider::SHIFT_START()) {
                        $workTimePerWeekdays[$weekday][] = $shift->start_time . " - 24:00";
                        $workTimePerWeekdays[$weekdayAfter][] = "00:00 - " . $shift->end_time;
                    } else {
                        $workTimePerWeekdays[$weekdayBefore][] = $shift->start_time . " - 24:00";
                        $workTimePerWeekdays[$weekday][] = "00:00 - " . $shift->end_time;
                    }
                } else {
                    $workTimePerWeekdays[$weekday][] = $shift->start_time . " - " . $shift->end_time;
                }
            }
        }

        $weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        $dataToInsert = [];
        foreach ($workTimePerWeekdays as $weekday => $workTimes) {
            sort($workTimes);
            $dataToInsert[] = [
                'jpi_resource_id' => $jpiResourceId,
                'weekday' => $weekdays[$weekday - 1],
                'work_time' => implode(" ", $workTimes)
            ];
        }

        return $dataToInsert;
    }

    public static function calculateCalendarExceptions(mixed $capacitable, int $jpiResourceId, array $workTimePerWeekdays): array
    {

        $tentativeExceptions = [];

        $capacities = Capacity::query()
            ->where('capacitable_id', $capacitable->id)
            ->where('capacitable_type', get_class($capacitable))
            ->orderBy('date')
            ->get();

        if (!$capacities->count())
            return [];

        // check all days at least for the current year
        $endDate = Carbon::parse($capacities->last()->date)
            ->lastOfYear()
            ->max(Carbon::now()->lastOfYear());

        foreach (Carbon::now()->setTime(0, 0)->daysUntil($endDate) as $date) {
            $tentativeExceptions[$date->toDateString()] = [];
            foreach ($capacities as $capacity) {
                if ($capacity->date == $date->toDateString()) {
                    $dateBefore = $date->copy()->subDay();
                    $dateAfter = $date->copy()->addDay();

                    if ($capacity->start_time > $capacity->end_time) {
                        if ($capacity->date_to_consider == DateToConsider::SHIFT_START()) {
                            $tentativeExceptions[$date->toDateString()][] = $capacity->start_time . " - 24:00";
                            $tentativeExceptions[$dateAfter->toDateString()][] = "00:00 - " . $capacity->end_time;
                        } else {
                            $tentativeExceptions[$dateBefore->toDateString()][] = $capacity->start_time . " - 24:00";
                            $tentativeExceptions[$date->toDateString()][] = "00:00 - " . $capacity->end_time;
                        }
                    } else {
                        $tentativeExceptions[$date->toDateString()][] = $capacity->start_time . " - " . $capacity->end_time;
                    }
                }
            }
        }
        $weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        $dataToInsert = [];
        foreach ($tentativeExceptions as $date => $workTimes) {
            sort($workTimes);
            $weekDay = $weekdays[(Carbon::parse($date)->dayOfWeek + 6) % 7];

            $defaultWorkTime = collect($workTimePerWeekdays)->where('weekday', $weekDay)->first()['work_time'] ?? "";

            $workTimeString = implode(" ", $workTimes);

            if ($workTimeString != $defaultWorkTime) {
                $dataToInsert[] = [
                    'jpi_resource_id' => $jpiResourceId,
                    'date' => $date,
                    'work_time' => $workTimeString
                ];
            }
        }

        return $dataToInsert;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $importedResourceIds = [];

        $jpiResourceCategories = collect();
        foreach (JpiResourceCategory::where('model_type', Hall::class)->get() as $jpiResourceCategory) {
            $jpiResourceCategories[$jpiResourceCategory->model_id] = $jpiResourceCategory->id;
        }

        ResourceGroup::chunk(env('DATA_CHUNK_SIZE'), function (Collection $resGroups) use ($jpiResourceCategories, &$importedResourceIds) {

            foreach ($resGroups as $resGroup) {
                if (isset($resGroup->hall_id) && $jpiResourceCategories->has($resGroup->hall_id)) {
                    $jpiResourceGroup = JpiResourceGroup::updateOrCreate([
                        'model_id' => $resGroup->id,
                        'model_type' => ResourceGroup::class
                    ], [
                        'model_type' => ResourceGroup::class,
                        'model_id' => $resGroup->id,
                        'name' => $resGroup->name,
                        'is_deleted' => !($resGroup->is_active),
                        'jpi_resource_category_id' => $jpiResourceCategories[$resGroup->hall_id],
                    ]);

                    $resourceIds = [];
                    foreach ($resGroup->machines as $machine) {
                        $resource = JpiResource::updateOrCreate([
                            'model_id' => $machine->id,
                            'model_type' => Machine::class
                        ], [
                            'name' => "{$machine->custom_id} {$machine->name}",
                            'is_deleted' => !($machine->is_active),
                            'capacity' => $machine->usage_factor,
                            'disabled' => !$machine->is_active
                        ]);

                        $workTime = self::calculateWorktimePerWeekday($resource->id, $machine->shiftModel);
                        $resource->workTimePerWeekdays()->delete();
                        JpiWorkTimePerWeekday::query()->insert($workTime);

                        $exceptions = self::calculateCalendarExceptions($machine, $resource->id, $workTime);
                        $resource
                            ->calendarExceptions()
                            ->where('date', '>=', Carbon::now()->toDateString())
                            ->delete();
                        JpiCalendarException::query()->insert($exceptions);

                        $importedResourceIds[] = $resource->id;
                        $resourceIds[] = $resource->id;
                    }

                    $jpiResourceGroup->jpiResources()->sync($resourceIds);
                } else {
                    //TODO: For now exclude resource groups that are not associated with hall
                    //                    $jpiResourceGroup = JpiResourceGroup::updateOrCreate([
                    //                        'model_id' => $resGroup->id,
                    //                        'model_type' => ResourceGroup::class
                    //                    ], [
                    //                        'model_type' => ResourceGroup::class,
                    //                        'model_id' => $resGroup->id,
                    //                        'name' => $resGroup->name,
                    //                        'is_deleted' => !($resGroup->is_active),
                    //                    ]);
                }
            }
        });

        JpiResource::query()
            ->whereNotIn('id', $importedResourceIds)
            ->where('model_type', Machine::class)
            ->update(["is_deleted" => true]);

        return Command::SUCCESS;
    }
}

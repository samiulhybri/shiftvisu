<?php

namespace App\Console\Commands;

use App\Enums\ProdOrderPosOperationStatus;
use App\Models\MachineRegisteredTime;
use App\Models\Setting;
use App\Models\UserRegisteredTime;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class BuildUserRegisteredTimesTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user-registered-times:build {start?} {end?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Build user_registered_times from machine_user_times, machine_machine_state_times, machine_prod_order_pos_operation_times';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $maxExportedTimeStr = UserRegisteredTime::where('is_exported', true)->max('end');
        $maxExportedTime = $maxExportedTimeStr ? Carbon::parse($maxExportedTimeStr) : null;
        $importBegin = $this->argument('start') ? Carbon::parse($this->argument('start')) : null;
        $importBegin = max($importBegin, $maxExportedTime);

        $importEnd = $this->argument('end') ? Carbon::parse($this->argument('end')) : now();

        UserRegisteredTime::query()
            ->where('is_generated', true)
            ->when($importBegin, fn($query) => $query->where('start', '>=', $importBegin))
            ->when($importEnd, fn($query) => $query->where('end', '<=', $importEnd))
            ->delete();

        $shifts = Shift::all()->mapWithKeys(fn($shift) => [$shift->id => $shift]);

        $intermediateQuery = DB::query()
            ->from('machine_user_times AS user_times')
            ->leftJoin('machine_machine_state_times AS state_times',
                'state_times.machine_id', '=', 'user_times.machine_id')
            ->join('machine_prod_order_pos_operation_times AS operation_times',
                'operation_times.machine_id', '=', 'state_times.machine_id')
            ->join('prod_order_pos_operations AS operations',
                'operations.id', '=', 'operation_times.prod_order_pos_operation_id');

        $intermediateQuery->where(function ($query) {
            $query->where('operation_times.status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                ->orWhere('operation_times.status', ProdOrderPosOperationStatus::IN_SETUP())
                ->orWhere('operation_times.status', ProdOrderPosOperationStatus::IN_TEARDOWN());
        });

        $tables = collect([
            'operation_times',
            'state_times',
            'user_times',
        ]);

        foreach ($tables as $table) {
            if ($importBegin) {
                $intermediateQuery->where(function ($query) use ($table, $importBegin) {
                    $query->where("$table.end", '>', $importBegin)
                        ->orWhereNull("$table.end");
                });
            }
            if ($importEnd) {
                $intermediateQuery->where("$table.start", '<', $importEnd);
            }
            $intermediateQuery->where(function ($query) use ($table) {
                $query->whereColumn("$table.end", '>', "$table.start")
                    ->orWhereNull("$table.end");
            });
            foreach ($tables as $table2) {
                if ($table === $table2) {
                    continue;
                }
                $intermediateQuery->where(function ($query) use ($table, $table2) {
                    $query->whereColumn("$table.start", '<', "$table2.end")
                        ->orWhereNull("$table2.end");
                });
            }
        }

        $intermediateQuery->select([
            'operations.id as operations_id',
            'operation_times.machine_id as machine_id',
            'user_times.user_id as user_id',
            'user_times.shift_id as shift_id',
            'user_times.standard_value_key_activity_type_id as svk_at_id',
            DB::raw('GREATEST(operation_times.start, state_times.start, user_times.start) as start'),
            DB::raw('LEAST(COALESCE(operation_times.end, now()), COALESCE(state_times.end, now()), COALESCE(user_times.end, now())) as "end"'),
            'operation_times.status as status',
            'state_times.machine_state_id as machine_state_id',
        ]);

        $records = $intermediateQuery->get();

        $dataToInsert = [];

        foreach ($records as $record) {
            $windowStart = Carbon::parse($record->start);
            $windowEnd = Carbon::parse($record->end);

            if ($importBegin && $windowStart->isBefore($importBegin)) {
                $windowStart = $importBegin;
            }

            if ($importEnd && $windowEnd->isAfter($importEnd)) {
                $windowEnd = $importEnd;
            }

            $parallelMachineOps = collect();
            $splitBoundaries = collect();

            foreach ($records as $userMachineOp) {
                if ($userMachineOp->user_id !== $record->user_id
                    || $userMachineOp->start >= $windowEnd
                    || $userMachineOp->end <= $windowStart
                ) {
                    continue;
                }
                $start = (new Carbon($userMachineOp->start))
                    ->max($windowStart);
                $end = (new Carbon($userMachineOp->end))
                    ->min($windowEnd);
                $splitBoundaries->push($start, $end);
                $parallelMachineOps->push([
                    'start' => $start,
                    'end' => $end
                ]);
            }
            $splitBoundaries = $splitBoundaries->unique();
            $splitBoundaries = $splitBoundaries->sort()->values();
            $splitIntervals = collect();
            for ($i = 0; $i < $splitBoundaries->count() - 1; $i++) {
                $splitIntervals[] = [
                    'start' => $splitBoundaries[$i],
                    'end' => $splitBoundaries[$i + 1]
                ];
            }

            foreach ($splitIntervals as ['start' => $windowStart, 'end' => $windowEnd]) {
                $durationHours = $windowStart->diffInHours($windowEnd);
                $splitDivisor = $parallelMachineOps
                    ->filter(fn($op) => $op['start'] < $windowEnd && $op['end'] > $windowStart)
                    ->count();

                // Calculate date
                $windowMidPoint = $windowStart->copy()->addHours($durationHours / 2);
                $windowDate = $windowMidPoint;
                if ($shifts->has($record->shift_id)) {
                    /** @var Shift $shift */
                    $shift = $shifts->get($record->shift_id);

                    [$shiftStart, $shiftEnd] = $shift->shiftStartEndForDate($windowMidPoint);
                    [, $shiftEndPrev] = $shift->shiftStartEndForDate($windowMidPoint->copy()->subDay());
                    [$shiftStartNext,] = $shift->shiftStartEndForDate($windowMidPoint->copy()->addDay());

                    if (
                        $windowMidPoint->diffInHours($shiftEndPrev, absolute: true)
                        < $windowMidPoint->diffInHours($shiftStart, absolute: true)
                    ) {
                        $windowDate = $windowMidPoint->copy()->subDay();
                    }
                    if (
                        $windowMidPoint->diffInHours($shiftStartNext, absolute: true)
                        < $windowMidPoint->diffInHours($shiftEnd, absolute: true)
                    ) {
                        $windowDate = $windowMidPoint->copy()->addDay();
                    }
                }

                $dataToInsert[] = [
                    'prod_order_pos_operation_id' => $record->operations_id ?? null,
                    'user_id' => $record->user_id,
                    'machine_id' => $record->machine_id,
                    'hours_split' => $durationHours / $splitDivisor,
                    'shift_id' => $record->shift_id ?? null,
                    'start' => $windowStart,
                    'end' => $windowEnd,
                    'date' => $windowDate,
                    'is_generated' => true,
                    'status_operation' => $record->status,
                    'machine_state_id' => $record->machine_state_id,
                    'standard_value_key_activity_type_id' => $record->svk_at_id,
                    'created_at' => DB::raw("now()"),
                    'updated_at' => DB::raw("now()"),
                ];
            }
        }
        Collection::make($dataToInsert)
            ->chunk(env('DATA_CHUNK_SIZE', 200))
            ->each(function ($chunk) {
                UserRegisteredTime::insert($chunk->toArray());
            });

        return self::SUCCESS;
    }
}

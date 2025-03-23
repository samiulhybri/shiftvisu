<?php

namespace App\Console\Commands;

use App\Enums\ProdOrderPosOperationStatus;
use App\Models\Capacity;
use App\Models\Machine;
use App\Models\MachineRegisteredTime;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BuildMachineRegisteredTimesTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'machine-registered-times:build {start?} {end?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Build machine_registered_times from machine_machine_state_times, machine_prod_order_pos_operation_times';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $maxExportedTimeStr = MachineRegisteredTime::where('is_exported', true)->max('end');
        $maxExportedTime = $maxExportedTimeStr ? Carbon::parse($maxExportedTimeStr) : null;
        $importBegin = $this->argument('start') ? Carbon::parse($this->argument('start')) : null;
        $importBegin = max($importBegin, $maxExportedTime);

        $importEnd = $this->argument('end') ? Carbon::parse($this->argument('end')) : now();

        // Delete previous generated data within the given range
        MachineRegisteredTime::where('is_generated', true)
            ->when($importBegin, fn($query) => $query->where('start', '>=', $importBegin))
            ->when($importEnd, fn($query) => $query->where('end', '<=', $importEnd))
            ->delete();

        // Retrieve capacities and group them by machine ID
        $capacities = Capacity::where("capacitable_type", Machine::class)
            ->when($importBegin, fn($query) => $query->where('date', '>=', $importBegin->toDateString()))
            ->when($importEnd, fn($query) => $query->where('date', '<=', $importEnd->toDateString()))
            ->get()
            ->mapToGroups(fn($capacity) => [$capacity->capacitable_id => $capacity]);

        // Intermediate query to fetch necessary data
        $intermediateQuery = DB::table('machine_machine_state_times AS state_times')
            ->join('machine_prod_order_pos_operation_times AS operation_times', 'operation_times.machine_id', '=', 'state_times.machine_id')
            ->join('prod_order_pos_operations AS operations', 'operations.id', '=', 'operation_times.prod_order_pos_operation_id')
            ->leftjoin('machine_machine_states AS states', function ($join) {
                $join->on('states.machine_id', '=', 'state_times.machine_id')
                    ->on('states.machine_state_id', '=', 'state_times.machine_state_id');
            })
            ->when($importBegin, function ($query) use ($importBegin) {
                $query->where(function ($q) use ($importBegin) {
                    $q->where("state_times.end", '>=', $importBegin)
                        ->orWhereNull("state_times.end");
                })->where(function ($q) use ($importBegin) {
                    $q->where("operation_times.end", '>=', $importBegin)
                        ->orWhereNull("operation_times.end");
                });
            })
            ->when($importEnd, function ($query) use ($importEnd) {
                $query->where("state_times.start", '<', $importEnd)
                    ->where("operation_times.start", '<', $importEnd);
            })
            ->where(function ($query) {
                $query->whereColumn("state_times.start", '<', "operation_times.end")
                    ->orWhereNull("operation_times.end");
            })
            ->where(function ($query) {
                $query->whereColumn("operation_times.start", '<', "state_times.end")
                    ->orWhereNull("state_times.end")
                    ->orWhereNull("operation_times.start");
            })
            ->whereIn('operation_times.status', [
                ProdOrderPosOperationStatus::IN_PRODUCTION(),
                ProdOrderPosOperationStatus::IN_SETUP(),
                ProdOrderPosOperationStatus::IN_TEARDOWN(),
            ])
            ->select([
                'operations.id AS operations_id',
                'operation_times.machine_id AS machine_id',
                'operation_times.status AS status',
                'states.standard_value_key_activity_type_id AS svk_at',
                DB::raw('GREATEST(operation_times.start, state_times.start) as start'),
                DB::raw('LEAST(COALESCE(operation_times.end, now()), COALESCE(state_times.end, now())) as "end"'),
                'state_times.machine_state_id as machine_state_id',
                'operation_times.id as operation_time_id',
                'state_times.id as state_time_id',
            ])
            ->orderBy('state_times.id');

        // Process the query in chunks
        $intermediateQuery->chunk(200, function ($records) use ($capacities, $importBegin, $importEnd) {
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

                foreach ($records as $machineOp) {
                    if ($machineOp->machine_id !== $record->machine_id
                        || $machineOp->start >= $windowEnd
                        || $machineOp->end <= $windowStart
                    ) {
                        continue;
                    }

                    $start = Carbon::parse($machineOp->start)->max($windowStart);
                    $end = Carbon::parse($machineOp->end)->min($windowEnd);
                    $splitBoundaries->push($start, $end);
                    $parallelMachineOps->push([
                        'start' => $start,
                        'end' => $end
                    ]);
                }

                $splitBoundaries = $splitBoundaries->unique()->sort()->values();
                $splitIntervals = collect();

                for ($i = 0; $i < $splitBoundaries->count() - 1; $i++) {
                    $splitIntervals[] = [
                        'start' => $splitBoundaries[$i],
                        'end' => $splitBoundaries[$i + 1]
                    ];
                }

                foreach ($splitIntervals as ['start' => $windowStart, 'end' => $windowEnd]) {
                    $splitDivisor = $parallelMachineOps
                        ->filter(fn($op) => $op['start'] < $windowEnd && $op['end'] > $windowStart)
                        ->count() ?: 1;

                    $capacity = $capacities->get($record->machine_id)
                        ?->where(fn(Capacity $cap) => $cap->startDateTime() <= $windowEnd && $cap->endDateTime() >= $windowStart)
                        ?->first();

                    $date = $capacity ? $capacity->date : $windowStart->copy()->addHours($windowStart->diffInHours($windowEnd) / 2);
                    $shift_id = $capacity?->shift_id ?? null;

                    $dataToInsert[] = [
                        'prod_order_pos_operation_id' => $record->operations_id,
                        'machine_id' => $record->machine_id,
                        'hours_split' => $windowStart->diffInHours($windowEnd) / $splitDivisor,
                        'start' => $windowStart,
                        'end' => $windowEnd,
                        'date' => $date,
                        'shift_id' => $shift_id,
                        'status_operation' => $record->status,
                        'is_generated' => true,
                        'standard_value_key_activity_type_id' => $record->svk_at,
                        'machine_state_id' => $record->machine_state_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                // Insert in chunks of 200
                if (count($dataToInsert) >= 200) {
                    MachineRegisteredTime::insert($dataToInsert);
                    $dataToInsert = [];
                }
            }

            // Insert remaining records
            if (!empty($dataToInsert)) {
                MachineRegisteredTime::insert($dataToInsert);
            }
        });

        return self::SUCCESS;
    }

}

<?php

namespace App\Services;

use App\Models\Capacity;
use App\Models\Machine;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CapacityPlanService
{
    public function __construct()
    {
        // 
    }

    public function calculateEndTime($start, int $duration, $machineId)
    {
        $machine = Machine::find($machineId);

        $start = Carbon::parse($start);

        if (!$machine) {
            return [
                'start' => $start,
                'end' => $start
            ];
        }
        $runningShift = $this->getMachineShiftsByTime($machine->id, $start, 0);

        $end = $start->copy();
        $end = $end->addSeconds($duration);
        $end = $end->add(100, 'days');

        $capacities = $machine->capacities()
            ->orderBy("date", "asc")
            ->orderBy("start_time", "asc")
            ->whereDate("date", ">=", $start)
            ->whereDate("date", "<", $end)
            ->get();

        if (count($runningShift) > 0) {
            $currentShift = $runningShift[0];
            foreach ($runningShift as $shift) {
                if ($this->checkCurrentShift($shift, $start)) {
                    $currentShift = $shift;

                    $actualStart = $this->setActualStart($start, $currentShift);
                    break;
                }
            }

            $elasped = $this->calculateElapsedDuration($currentShift, $duration, $start);

            if ($elasped == 0) {
                return [
                    'start' => $actualStart ?? $start,
                    'end' => $this->finalEndDateTime($start, $duration),
                ];
            } else {
                $duration -= $elasped;
            }
        }

        foreach ($capacities as $index => $capacity) {
            if (count($runningShift) > 0 && $this->checkOldShifts($capacity, $start)) {
                // SKIPPING SAME SHIFT 
            } else {
                if ($this->isOldShift($capacity, $start)) {
                    continue;
                }

                $elasped = $this->calculateElapsedDuration($capacity, $duration);
                if (!isset($actualStart)) {
                    $actualStart = $this->setActualStart($start, $capacity);
                }
                if ($elasped == 0) {
                    return [
                        'start' => $actualStart,
                        'end' => $this->finalEndDateTime($capacity, $duration, true)
                    ];
                } else {
                    $duration -= $elasped;
                }
            }
        }

        return [
            'start' => $start,
            'end' => $start
        ];
    }

    private function isOldShift($shift, $start)
    {
        $shiftStart = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
        $shiftEnd = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);
        if ($shiftStart->gt($shiftEnd)) {
            $shiftEnd = $shiftEnd->addDay();
        }

        if ($start->gt($shiftEnd)) {
            return true;
        } else {
            return false;
        }
    }

    private function setActualStart($start, $currentShift)
    {

        $currentShiftStart = Carbon::parse($currentShift['date'] . ' ' . $currentShift['start_time']);


        if ($start->gt($currentShiftStart)) {
            return $start->copy();
        } else {
            return $currentShiftStart;
        }
    }

    private function getMachineShiftsByTime($machineId, $currTime, $additionalMinute = 0)
    {
        $now = $currTime;
        $nowWithTolerance = $now->addMinutes((int)$additionalMinute);

        return Capacity::query()
            ->with('shift')
            // Get the capacities of today, yesterday and tomorrow
            ->where(function ($query) use ($now) {
                $query->where('date', $now->format('Y-m-d'))
                    ->orWhere('date', $now->clone()->addDay()->format('Y-m-d'))
                    ->orWhere('date', $now->clone()->subDay()->format('Y-m-d'));
            })
            ->where('capacitable_id', $machineId)
            ->where('capacitable_type', Machine::class)
            ->get()
            // Filter the capacities that are currently active
            ->filter(function ($capacity) use ($now, $nowWithTolerance) {
                return ($capacity->startDateTime() <= $now && $capacity->endDateTime() >= $now) ||
                    ($capacity->startDateTime() >= $now && $capacity->startDateTime() <= $nowWithTolerance);
            })
            ->flatMap(function ($capacity) {
                return $capacity->shift ? [$capacity] : [];
            })
            ->toArray();
    }

    private function checkCurrentShift($shift, $start)
    {
        $compareStart = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
        $compareEnd = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);

        if ($compareEnd < $compareStart) {
            $compareEnd = $compareEnd->add('day', 1);
        }

        if ($compareStart <= $start && $compareEnd > $start) {
            return true;
        }

        return false;
    }

    private function calculateElapsedDuration($shift, int $remaing_duration, $possibleStart = null)
    {
        $compare = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);

        if ($possibleStart) {
            $compare = Carbon::parse($possibleStart);
        }

        $comapreEnd = Carbon::parse($shift['date'] . ' ' . $shift['end_time'])->sub(1, 'seconds');

        if ($comapreEnd < $compare) {
            $comapreEnd = $comapreEnd->add(1, 'day');
        }

        $elapsed_duration = $compare->diffInSeconds($comapreEnd);
        $available_duration = $elapsed_duration - $remaing_duration;

        if ($available_duration > 0) {
            return 0;
        }

        return ($elapsed_duration + 1) - ($shift['break_minutes'] * 60);
    }

    private function finalEndDateTime($shift, int $duration, $needParse = false)
    {
        if ($needParse) {
            return Carbon::parse($shift['date'] . ' ' . $shift['start_time'])->addSeconds($duration);
        }

        return $shift->addSeconds($duration);
    }

    private function checkOldShifts($shift, $start)
    {
        $compare = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
        if ($compare <= $start) {
            return true;
        }
        return false;
    }


    public function calculateStartTime($end, int $duration, $machineId)
    {
        $machine = Machine::find($machineId);

        $end = Carbon::parse($end);

        if (!$machine) {
            return [
                'start' => $end,
                'end' => $end
            ];
        }

        $runningShift = $this->getMachineShiftsByTimeForStart($machine->id, $end, 0);

        $start = $end->copy();
        $start = $start->subSeconds($duration);
        $start = $start->sub(100, 'days');

        $capacities = $machine->capacities()
            ->orderBy("date", "desc")
            ->orderBy("start_time", "desc")
            ->whereDate("date", "<=", $end)
            ->whereDate("date", ">", $start)
            ->get();

        if (count($runningShift) > 0) {
            $currentShift = $runningShift[0];
            foreach ($runningShift as $shift) {
                if ($this->checkCurrentShift($shift, $end)) {
                    $currentShift = $shift;

                    $actualEnd = $this->setActualEnd($end, $currentShift);
                    break;
                }
            }

            $elapsed = $this->calculateElapsedDurationBackward($currentShift, $duration, $end);


            if ($elapsed == 0) {
                return [
                    'start' => $this->finalStartDateTime($end, $duration),
                    'end' => $actualEnd ?? $end,
                ];
            } else {
                $duration -= $elapsed;
            }
        }

        foreach ($capacities as $index => $capacity) {
            if (count($runningShift) > 0 && $this->checkNewShifts($capacity, $end)) {
                // SKIPPING SAME SHIFT 
            } else {
                if ($this->isFutureShift($capacity, $end)) {
                    continue;
                }

                $elapsed = $this->calculateElapsedDurationBackward($capacity, $duration);
                if (!isset($actualEnd)) {
                    $actualEnd = $this->setActualEnd($end, $capacity);
                }
                if ((int) $elapsed == 0) {
                    return [
                        'start' => $this->finalStartDateTime($capacity, $duration, true),
                        'end' => $actualEnd,
                    ];
                } else {
                    $duration -= $elapsed;
                }
            }
        }

        return [
            'start' => $end,
            'end' => $end
        ];
    }

    private function checkNewShifts($shift, $end)
    {
        $compare = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);
        $shiftStart = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
        if ($shiftStart > $compare) {
            $compare = $compare->addDay();
        }
        if ($compare >= $end) {
            return true;
        }
        return false;
    }

    private function getMachineShiftsByTimeForStart($machineId, $currTime, $additionalMinute = 0)
    {
        $now = $currTime;
        $nowWithTolerance = $now->subMinutes((int) $additionalMinute); // Subtract minutes for backward calculation

        return Capacity::query()
            ->with('shift')
            // Get the capacities of today, yesterday, and tomorrow
            ->where(function ($query) use ($now) {
                $query->where('date', $now->format('Y-m-d'))
                    ->orWhere('date', $now->clone()->addDay()->format('Y-m-d'))
                    ->orWhere('date', $now->clone()->subDay()->format('Y-m-d'));
            })
            ->where('capacitable_id', $machineId)
            ->where('capacitable_type', Machine::class)
            ->get()
            // Filter the capacities that are currently active or just ended
            ->filter(function ($capacity) use ($now, $nowWithTolerance) {
                return ($capacity->startDateTime() >= $now && $capacity->endDateTime() <= $now) ||
                    ($capacity->startDateTime() <= $now && $capacity->startDateTime() <= $nowWithTolerance);
            })
            ->flatMap(function ($capacity) {
                return $capacity->shift ? [$capacity] : [];
            })
            ->toArray();
    }

    private function isFutureShift($shift, $end)
    {
        $shiftStart = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
        $shiftEnd = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);
        if ($shiftStart->gt($shiftEnd)) {
            $shiftEnd = $shiftEnd->addDay();
        }

        if ($end->lt($shiftStart)) {
            return true;
        } else {
            return false;
        }
    }

    private function setActualEnd($end, $currentShift)
    {
        $currentShiftEnd = Carbon::parse($currentShift['date'] . ' ' . $currentShift['end_time']);
        $currentShiftStart = Carbon::parse($currentShift['date'] . ' ' . $currentShift['start_time']);

        if ($currentShiftStart > $currentShiftEnd) {
            $currentShiftEnd = $currentShiftEnd->add(1, 'day');
        }


        if ($end->lt($currentShiftEnd)) {
            return $end->copy();
        } else {
            return $currentShiftEnd;
        }
    }

    private function calculateElapsedDurationBackward($shift, int $remaining_duration, $possibleEnd = null)
    {
        $compare = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);

        if ($possibleEnd) {
            $compare = Carbon::parse($possibleEnd);
        }

        $compareStart = Carbon::parse($shift['date'] . ' ' . $shift['start_time'])->add(1, 'seconds');

        if ($compareStart > $compare) {
            $compare = $compare->add(1, 'day');
        }

        $elapsed_duration = $compareStart->diffInSeconds($compare);
        $available_duration = $elapsed_duration - $remaining_duration;

        if ($available_duration > 0) {
            return 0;
        }

        return (($elapsed_duration + 1) - ($shift['break_minutes'] * 60));
    }

    private function finalStartDateTime($shift, int $duration, $needParse = false)
    {
        if ($needParse) {
            $start = Carbon::parse($shift['date'] . ' ' . $shift['start_time']);
            $end = Carbon::parse($shift['date'] . ' ' . $shift['end_time']);

            if ($start > $end) {
                $end = $end->addDay();
            }
            return $end->subSeconds($duration);
        }

        return $shift->subSeconds($duration);
    }

    public function getMachineCapacity(Machine $machine, $start, $end)
    {
        return Capacity::where('capacitable_type', Machine::class)
            ->where('capacitable_id', $machine->id)
            ->where(DB::raw("STR_TO_DATE(CONCAT(date, ' ', end_time), '%Y-%m-%d %H:%i:%s')"), '>=', Carbon::parse($start)->toDateTimeString())
            ->where(DB::raw("STR_TO_DATE(CONCAT(date, ' ', start_time), '%Y-%m-%d %H:%i:%s')"), '<=', Carbon::parse($end)->toDateTimeString())
            ->orderBy('date', 'ASC')
            ->get();
    }

    public function calculateShiftAvailabilityToProduceQuantity($capacities, $requiredTimeToProduceSingleQuantity, $order, $startShiftTime, $endShiftTime, $totalQuantityToProduce)
    {
        $results = [];
        $totalProduced = 0; // Track cumulative quantity

        $capacities = collect($capacities); // Ensure it's a collection
        $firstIndex = 0;
        $lastIndex = $capacities->count() - 1;

        foreach ($capacities as $key => $capacity) {
            // Determine start time
            if ($key === $firstIndex) {
                $start = Carbon::parse($startShiftTime);
            } else {
                $start = Carbon::parse($capacity->date . ' ' . $capacity->start_time);
            }

            // Determine end time
            if ($key === $lastIndex) {
                $end = Carbon::parse($endShiftTime);
            } else {
                $end = Carbon::parse($capacity->date . ' ' . $capacity->end_time);
            }

            // Handle crossing midnight
            if ($end->isBefore($start)) {
                $end->addDay();
            }

            $timeDifferenceInSeconds = $start->diffInSeconds($end);

            // Ignore the break-time for shifts (except last shift)
            if ($key !== $lastIndex) {
                $timeDifferenceInSeconds -= ($capacity->break_minutes * 60);
            }

            $operation_tr_time = 0;
            $operation_teardown_time = 0;

            // Apply first and last item adjustments
            if ($key === $firstIndex) {
                $timeDifferenceInSeconds -= $order['tr'];
                $operation_tr_time = $order['tr'];
            }

            if ($key === $lastIndex) {
                $timeDifferenceInSeconds -= $order['teardown_time'];
                $operation_teardown_time = $order['teardown_time'];
            }

            // Calculate production quantity for this shift
            if ($requiredTimeToProduceSingleQuantity > 0) {
                $possibleQuantity = round($timeDifferenceInSeconds / $requiredTimeToProduceSingleQuantity, 1);

                if ($key === $firstIndex && $possibleQuantity < 0) {
                    $possibleQuantity = 0;
                }

                // Ensure we do not exceed the required total quantity
                if ($totalProduced + $possibleQuantity > $totalQuantityToProduce) {
                    $possibleQuantity = $totalQuantityToProduce - $totalProduced;
                }

                $totalProduced += $possibleQuantity; // Update total produced

                // Duplicating this logic, if the targeted quanity produced before the last iteration, so we must have the teardown_time
                if ($totalProduced >= $totalQuantityToProduce) {
                    $operation_teardown_time = $order['teardown_time'];
                }

                // Store results
                $results[] = [
                    'requiredTimeToProduceSingleQuantity' => $requiredTimeToProduceSingleQuantity,
                    'actual_date' => $capacity->date,
                    'tr' => $operation_tr_time,
                    'teardown_time' => $operation_teardown_time,
                    'shift_id' => $capacity->shift_id,
                    'week_number' => Carbon::parse($capacity->date)->weekOfYear,
                    'month' => Carbon::parse($capacity->date)->month,
                    'year' => Carbon::parse($capacity->date)->year,
                    'total_available_seconds' => $timeDifferenceInSeconds,
                    'quantity' => $possibleQuantity,
                ];

                // Stop iteration if we have produced enough
                if ($totalProduced >= $totalQuantityToProduce) {
                    break;
                }
            }
        }

        return collect($results);
    }
}

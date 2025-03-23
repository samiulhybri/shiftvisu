<?php

namespace App\Http\Controllers;

use App\Http\Requests\CapacityPlan\StoreCapacityPlanRequest;
use App\Models\Capacity;
use App\Models\Hall;
use App\Models\Machine;
use App\Models\Shift;
use App\Models\ShiftModelShift;
use App\Models\User;
use App\Models\ProdOrderPosOperation;
use App\Services\CapacityPlanService;
use App\Enums\ProdOrderPosOperationStatus;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use DateInterval;
use DatePeriod;
use DateTime;
use Exception;

class CapacityPlanController extends Controller
{
    protected CapacityPlanService $capacityPlanService;

    public function __construct(CapacityPlanService $capacityPlanService) {
        $this->capacityPlanService = $capacityPlanService;
    }

    /**
     * @param StoreCapacityPlanRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreCapacityPlanRequest $request)
    {
        try {
            $periods = CarbonPeriod::create("{$request->year}-01-01", "{$request->year}-12-31");
            $capacities = [];
            $capacitableId = $request->hall_id ?? $request->machine_id;
            $capacitableType = $this->getClass($request);
            $possibleOffDates = $request->get('possible_off_dates', []);

            // If hall_id is provided, generate capacities for all machines under the hall
            if ($request->hall_id) {
                Machine::where('hall_id', $request->hall_id)
                    ->get()
                    ->each(function ($machine) use ($periods, $request, $possibleOffDates, &$capacities) {
                        foreach ($periods as $date) {
                            $capacities[] = $this->generateCapacityData($date, $request, $machine->id, Machine::class, $possibleOffDates);
                        }
                    });
            }

            // Generate capacities for hall or machine
            foreach ($periods as $date) {
                $capacities[] = $this->generateCapacityData($date, $request, $capacitableId, $capacitableType, $possibleOffDates);
            }

            Capacity::insert($capacities);

            return response()->json(['success' => true]);
        } catch (\Exception $exception) {
            Log::error($exception->getMessage());
            return response()->json(['success' => false]);
        }
    }

    private function generateCapacityData($date, $request, $capacitableId, $capacitableType, $possibleOffDates)
    {
        $isDayOff = $this->getDayOff($date, $request->working_day, $possibleOffDates);

        return [
            "date" => $date->format('Y-m-d'),
            "shift_model_id" => $request->shift_model_id,
            "capacitable_type" => $capacitableType,
            "capacitable_id" => $capacitableId,
            "created_at" => Carbon::now(),
            "updated_at" => Carbon::now(),
        ];
    }

    private function getCapacities($hallId, $machineId)
    {
        if ($hallId) {
            $hall = Hall::with('capacities')->find($hallId);
            if ($hall) {
                $capacities = $hall->capacities;

                // Get capacities of all machines under the hall
                $machineCapacities = Machine::where('hall_id', $hallId)
                    ->with('capacities')
                    ->get()
                    ->flatMap(fn($machine) => $machine->capacities);

                return $capacities->merge($machineCapacities);
            }
        }

        if ($machineId && !$hallId) {
            $machine = Machine::with('capacities')->find($machineId);
            if ($machine) {
                return $machine->capacities;
            }
        }

        return collect();
    }

    private function extractDatesFromRequest(Request $request, $year)
    {
        $dateToUpdate = $request->dates_to_update;

        if (!isset($dateToUpdate)) {
            return [];
        }

        if (!empty($dateToUpdate['date'])) {
            return $dateToUpdate['date'];
        }

        if (!empty($dateToUpdate['dates'])) {
            return $dateToUpdate['dates'];
        }

        if (!empty($dateToUpdate['date_range'])) {
            return $this->generateDatesForYear($year, $dateToUpdate['date_range'][0], $dateToUpdate['date_range'][1]);
        }

        return [];
    }

    private function generateDatesForYear($year, $from = null, $to = null)
    {
        $startDate = !$from ? new DateTime("$year-01-01") : new DateTime($from);
        $endDate = !$to ? new DateTime("$year-12-31") : new DateTime($to);

        $interval = new DateInterval('P1D'); // 1 day interval
        $period = new DatePeriod($startDate, $interval, $endDate->modify('+1 day'));

        $dates = array();

        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }

        return $dates;
    }
    // TODO: check if needed:

    //    public function updateDefaultShift(Request $request)
//    {
//        try {
//            $hallId = isset($request->hall_id) ? $request->hall_id : null;
//            $machineId = isset($request->machine_id) ? $request->machine_id : null;
//            $year = $request->year;
//            $weekday = isset($request->weekday) ? $request->weekday : null;
//            $newShiftModelId = $request->new_shift_model_id;
//
//            if ($hallId) {
//                $hall = Hall::where('id', $hallId)->with('capacities')->first();
//
//                if ($hall) {
//                    $hall->capacities->each(function (Capacity $capacity) use ($newShiftModelId, $year, $weekday) {
//                        $this->updateCapacitiesForDefaultShift($newShiftModelId, $capacity, $year, $weekday);
//                    });
//                }
//
//                Machine::where('hall_id', $hallId)
//                    ->with('capacities')
//                    ->get()
//                    ->each(function ($machine) use ($newShiftModelId, $year, $weekday) {
//                        $machine->capacities->each(function (Capacity $capacity) use ($newShiftModelId, $year, $weekday) {
//                            $this->updateCapacitiesForDefaultShift($newShiftModelId, $capacity, $year, $weekday);
//                        });
//                    });
//            }
//
//            if ($machineId && !$hallId) {
//                $machine = Machine::where('id', $machineId)->with('capacities')->first();
//
//                if ($machine) {
//                    $machine->capacities->each(function (Capacity $capacity) use ($newShiftModelId, $year, $weekday) {
//                        $this->updateCapacitiesForDefaultShift($newShiftModelId, $capacity, $year, $weekday);
//                    });
//                }
//            }
//            return response()->json(['success' => true]);
//        } catch (\Throwable $th) {
//            return response()->json(['success' => false]);
//        }
//    }

    //    private function updateCapacitiesForDefaultShift($newShiftModelId, $capacity, $year, $weekday)
//    {
//        $dateTime = new DateTime($capacity->date);
//        if (substr($capacity->date, 0, 4) == $year) {
//            if ($weekday) {
//                if ($dateTime->format('N') == $weekday) {
//                    $capacity->update(['shift_model_id' => $newShiftModelId]);
//                }
//            } else {
//                $capacity->update(['shift_model_id' => $newShiftModelId]);
//            }
//        }
//    }

    private function getDayOff($date, $workingDay, $offDates)
    {
        $day = Carbon::parse($date)->weekday();

        $isOffDay = in_array($day, $workingDay) ? 0 : 1;
        if ($isOffDay) {
            return $isOffDay;
        }
        $formattedDate = Carbon::parse($date)->format('Y-m-d');
        if (count($offDates)) {
            return in_array($formattedDate, $offDates) ? 1 : 0;
        }
        return $isOffDay;
    }

    private function getClass($request)
    {
        return $request->user_id ? User::class : ($request->machine_id ? Machine::class : Hall::class);
    }

    // get shift list for machine clock-in clock-out
    function getMachineClockInShift($machineId, $additionalMinute = 0)
    {
        $currentMachineShifts = $this->getCurrentShiftsByMachineId($machineId, $additionalMinute);

        $currentMachineShiftIds = array_map(function ($shift) {
            return $shift['id'];
        }, $currentMachineShifts);

        $allShift = $this->getAllCurrentShift($currentMachineShiftIds);

        return response()->json(['allShift' => $allShift, 'machineCurrentShiftList' => $currentMachineShifts]);
    }

    // get current shift by machine id
    function getCurrentShiftsByMachineId($machineId, $additionalMinute = 0)
    {
        $timeZone = config('app.timezone');
        $now = now()->timezone($timeZone ?? env("APP_TIME_ZONE"));
        $nowWithTolerance = now()->timezone($timeZone ?? env("APP_TIME_ZONE"))->addMinutes((int) $additionalMinute);

        return Capacity::query()
            ->with('shift')
            // Get the capacities of today, yesterday and tomorrow
            ->where(function ($query) {
                $query->where('date', now()->format('Y-m-d'))
                    ->orWhere('date', now()->clone()->addDay()->format('Y-m-d'))
                    ->orWhere('date', now()->clone()->subDay()->format('Y-m-d'));
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
                return $capacity->shift ? [$capacity->shift] : [];
            })
            ->toArray();
    }

    // get all current shift
    function getAllCurrentShift($excludedShiftIds = [])
    {
        $timeZone = config('app.timezone');
        $now = now()->timezone($timeZone ?? env("APP_TIME_ZONE"))->format('H:i:s');
        $allShift = Shift::whereNotIn('id', $excludedShiftIds)
            ->where(function ($query) use ($now) {
                $query->where(function ($query) use ($now) {
                    $query->where('start_time', '>=', $now)
                        ->where('end_time', '>=', $now)
                        ->whereRaw('start_time > end_time');
                })
                    ->orWhere(function ($query) use ($now) {
                        $query->where('start_time', '<=', $now)
                            ->where('end_time', '<=', $now)
                            ->whereRaw('start_time > end_time');
                    })
                    ->orWhere(function ($query) use ($now) {
                        $query->where('start_time', '<=', $now)
                            ->where('end_time', '>=', $now)
                            ->whereRaw('end_time > start_time');
                    });
            })
            ->get();

        return $allShift;
    }

    function createCapacityForShiftModel(Request $request)
    {
        $shift_model_id = $request->shift_model_id;
        $shift_model_shift = ShiftModelShift::where('shift_model_id', $shift_model_id)->with('shift')->get();
        $holidays = $request->holidays;
        $year = $request->year;
        $excludedDates = [];
        $daysOfWeeks = [];
        $assignedShifts = [];

        foreach ($shift_model_shift as $shiftModelShift) {
            array_push($daysOfWeeks, $shiftModelShift->day_of_week);
            array_push($assignedShifts, $shiftModelShift->shift_id);
        }

        $allDayOfWeekValues = array_unique($daysOfWeeks);

        foreach ($holidays as $holiday) {
            array_push($excludedDates, Carbon::create($holiday));
        }

        $startDate = Carbon::create($year, 1, 1);
        $endDate = Carbon::create($year, 12, 31);

        $dates = $this->removeHolidayFromDates($startDate, $endDate, $excludedDates);
        $allWorkingDays = $this->getAllWorkingDays($dates, $allDayOfWeekValues);
        $capacitable_id = $this->getClass($request) == Machine::class ? $request->machine_id : ($this->getClass($request) == User::class ? $request->user_id : $request->hall_id);

        // Delete all previous machine data 
        if ($this->getClass($request) === Hall::class) {
            $assignedMachines = Hall::where('id', $capacitable_id)->with('machines')->first();
            if (!empty($assignedMachines)) {
                foreach ($assignedMachines->machines as $machine) {
                    Capacity::whereYear('date', $year)->where('capacitable_type', Machine::class)->where('capacitable_id', $machine->id)->delete();
                }
            }
        }

        $capacity = $this->createCapacity($allWorkingDays, $capacitable_id, $this->getClass($request), $shift_model_id);

        $response = response()->json(['success' => $capacity == 1 ? true : $capacity]);
        return $response;
    }

    private function removeHolidayFromDates($startDate, $endDate, $excludedDates)
    {
        $dates = [];
        for ($date = $startDate; $date <= $endDate; $date->addDay()) {
            $isExcluded = false;
            foreach ($excludedDates as $excludedDate) {
                if ($date->isSameDay($excludedDate)) {
                    $isExcluded = true;
                    break;
                }
            }
            if (!$isExcluded) {
                $dates[] = [
                    'date' => $date->toDateString(),
                    'day' => $date->format('w'),
                ];
            }
        }
        return $dates;
    }

    function createCapacity($allWorkingDays, $capacitable_id, $class, $shift_model_id)
    {
        for ($i = 0; $i <= 6; $i++) {
            $shiftModelShift = ShiftModelShift::where('shift_model_id', $shift_model_id)->where('day_of_week', $i)->with('shift')->get();
            foreach ($shiftModelShift as $shiftModel) {
                foreach ($allWorkingDays as $days) {
                    if ($days['day'] == $shiftModel->day_of_week) {
                        $date = $days['date'];
                        switch ($class) {
                            case Machine::class:
                                try {
                                    Capacity::create([
                                        'date' => $date,
                                        'capacitable_type' => $class,
                                        'capacitable_id' => $capacitable_id,
                                        'shift_id' => $shiftModel->shift_id,
                                        'date_to_consider' => $shiftModel->shift->date_to_consider,
                                        'start_time' => $shiftModel->shift->start_time,
                                        'end_time' => $shiftModel->shift->end_time,
                                        'break_minutes' => $shiftModel->shift->break_minutes,
                                    ]);
                                } catch (Exception $e) {
                                    return $e->getMessage();
                                }
                                break;
                            case User::class:
                                try {
                                    Capacity::create([
                                        'date' => $date,
                                        'capacitable_type' => $class,
                                        'capacitable_id' => $capacitable_id,
                                        'shift_id' => $shiftModel->shift_id,
                                        'date_to_consider' => $shiftModel->shift->date_to_consider,
                                        'start_time' => $shiftModel->shift->start_time,
                                        'end_time' => $shiftModel->shift->end_time,
                                        'break_minutes' => $shiftModel->shift->break_minutes,
                                    ]);
                                } catch (Exception $e) {
                                    return $e->getMessage();
                                }
                                break;
                            case Hall::class:
                                try {
                                    Capacity::create([
                                        'date' => $date,
                                        'capacitable_type' => Hall::class,
                                        'capacitable_id' => $capacitable_id,
                                        'shift_id' => $shiftModel->shift_id,
                                        'date_to_consider' => $shiftModel->shift->date_to_consider,
                                        'start_time' => $shiftModel->shift->start_time,
                                        'end_time' => $shiftModel->shift->end_time,
                                        'break_minutes' => $shiftModel->shift->break_minutes,

                                    ]);
                                    $assignedMachines = Hall::where('id', $capacitable_id)->with('machines')->first();
                                    if (!empty($assignedMachines)) {
                                        foreach ($assignedMachines->machines as $machine) {
                                            try {
                                                Capacity::create([
                                                    'date' => $date,
                                                    'capacitable_type' => Machine::class,
                                                    'capacitable_id' => $machine->id,
                                                    'shift_id' => $shiftModel->shift_id,
                                                    'date_to_consider' => $shiftModel->shift->date_to_consider,
                                                    'start_time' => $shiftModel->shift->start_time,
                                                    'end_time' => $shiftModel->shift->end_time,
                                                    'break_minutes' => $shiftModel->shift->break_minutes,
                                                ]);
                                            } catch (Exception $e) {
                                                return $e->getMessage();
                                            }
                                        }

                                    }
                                } catch (Exception $e) {
                                    return $e->getMessage();
                                }
                                break;
                        }
                    }
                }
            }
        }
        return true;
    }

    public function updateCapacityForShiftModel(Request $request)
    {
        try {
            $year = $request->year;
            $hallId = isset($request->hall_id) ? $request->hall_id : null;
            $machineId = isset($request->machine_id) ? $request->machine_id : null;
            $userId = isset($request->user_id) ? $request->user_id : null;

            if ($hallId) {
                $hall = Hall::where('id', $hallId)->with([
                    'capacities' => function ($query) use ($year) {
                        $query->whereBetween('date', ["$year-01-01", "$year-12-31"]);
                    },
                    'machines.capacities' => function ($query) use ($year) {
                        $query->whereBetween('date', ["$year-01-01", "$year-12-31"]);
                    }
                ])->first();

                if ($hall) {
                    // Delete capacities for the hall
                    $hall->capacities()->whereBetween('date', ["$year-01-01", "$year-12-31"])->delete();

                    // Delete capacities for each machine associated with the hall
                    foreach ($hall->machines as $machine) {
                        $machine->capacities()->whereBetween('date', ["$year-01-01", "$year-12-31"])->delete();
                    }
                }
            } else if ($machineId) {
                $machine = Machine::where('id', $machineId)->with([
                    'capacities' => function ($query) use ($year) {
                        $query->whereBetween('date', ["$year-01-01", "$year-12-31"]);
                    }
                ])->first();

                $machine->capacities()->whereBetween('date', ["$year-01-01", "$year-12-31"])->delete();
            } else if ($userId) {
                Capacity::whereYear('date', $year)->where('capacitable_type', User::class)->where('capacitable_id', $userId)->delete();
            }

            $this->createCapacityForShiftModel($request);

            return response()->json(['success' => true]);
        } catch (\Throwable $th) {
            return response()->json(['success' => false]);
        }
    }

    private function getAllWorkingDays($dates, $allDayOfWeekValues)
    {
        $days = [];
        foreach ($dates as $date) {
            foreach ($allDayOfWeekValues as $workingDay) {
                if ($date['day'] == $workingDay) {
                    array_push($days, $date);
                }
            }
        }
        return $days;
    }

    public function getCapacity($type, $id, $year): \Illuminate\Http\JsonResponse
    {
        // Map type strings to class names
        $typeClassMap = [
            'machine' => Machine::class,
            'hall' => Hall::class,
            'user' => User::class,
        ];

        // Validate and resolve the class type
        if (!array_key_exists($type, $typeClassMap)) {
            return response()->json(['error' => 'Invalid type specified.'], 400);
        }

        $capacities = Capacity::with('shift')
            ->where('capacitable_id', $id)
            ->where('capacitable_type', $typeClassMap[$type])
            ->whereYear('date', $year)
            ->get();

        return response()->json(['capacities' => $capacities]);
    }

    /**
     * from the start and duration we are getting the end date
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Machine $machine
     * @return mixed
     */
    public function getCapacityForOperation(Request $request, Machine $machine)
    {
        return $this->capacityPlanService->calculateEndTime($request->input('start'), $request->input('duration'), $machine->id);
    }

    public function getCapacityForOperationEndTime(Request $request, Machine $machine)
    {
        return $this->capacityPlanService->calculateStartTime($request->input('end'), $request->input('duration'), $machine->id);
    }

    public function getCapacityForAllOperations(Request $request, Machine $machine) {
        $ids = $request->query('operations');
        $startTime = $request->query('start');
        $groups = json_decode($request->query('groups', '[]'), true);
    
        if (!$ids) {
            return response()->json(['message' => 'Missing operation IDs'], 400);
        }
    
        $operationsIds = explode(',', $ids);
        $operations = ProdOrderPosOperation::whereIn('id', $operationsIds)->with('prodOrderPos')->get()->keyBy('id');
        foreach ($operationsIds as $id) {
            if (!$operations->has($id)) {
                return response()->json(['message' => "Operation with ID $id not found"], 404);
            }
        }
    
        $maxEndTime = Carbon::parse($startTime);
        $results = [];
        $processedIds = [];
    
        foreach ($operationsIds as $id) {
            foreach ($groups as $group) {
                if (in_array($id, $group) && !in_array($id, $processedIds)) {
                    $groupStartTime = $maxEndTime;
                    $groupMaxEndTime = $groupStartTime;
    
                    foreach ($group as $groupId) {
                        if (!isset($operations[$groupId])) continue;
                        
                        $operation = $operations[$groupId];
                        if ($operation->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                            $results[$groupId] = [
                                'id' => $operation->id,
                                'start' => $groupStartTime,
                                'end' => $groupStartTime,
                            ];
                        } else {
                            $duration = $this->calculateOperationDurationTime($operation, $machine->usage_factor);
                            $calculatedTime = $this->capacityPlanService->calculateEndTime($groupStartTime, $duration, $machine->id);
                            
                            $start = $groupStartTime;
                            $end = Carbon::parse($calculatedTime['end']);
                            $groupMaxEndTime = max($groupMaxEndTime, $end);
    
                            $results[$groupId] = [
                                'id' => $operation->id,
                                'start' => $start,
                                'end' => $end,
                            ];
                        }
                        $processedIds[] = $groupId;
                    }
    
                    $maxEndTime = $groupMaxEndTime->copy()->addMinute();
                }
            }
    
            if (!in_array($id, $processedIds)) {
                $operation = $operations->get($id);
                if ($operation->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                    $results[$id] = [
                        'id' => $operation->id,
                        'start' => $maxEndTime,
                        'end' => $maxEndTime,
                    ];
                } else {
                    $duration = $this->calculateOperationDurationTime($operation, $machine->usage_factor);
                    $calculatedTime = $this->capacityPlanService->calculateEndTime($maxEndTime, $duration, $machine->id);
                    
                    $start = $maxEndTime;
                    $end = Carbon::parse($calculatedTime['end']);
                    $maxEndTime = $end->copy()->addMinute();
    
                    $results[$id] = [
                        'id' => $operation->id,
                        'start' => $start,
                        'end' => $end,
                    ];
                }
                $processedIds[] = $id;
            }
        }
    
        $orderedResponse = array_map(fn($id) => $results[$id], $operationsIds);
    
        return response()->json($orderedResponse);
    }

    private function calculateOperationDurationTime($operation, $usageFactor) {
        $te = isset($operation->te) ? floatval($operation->te) : 0;
        $cavity = isset($operation->cavity) && floatval($operation->cavity) > 0 ? floatval($operation->cavity) : 1;
        $quantity = isset($operation->prodOrderPos->quantity) ? floatval($operation->prodOrderPos->quantity) : 0;
        $tr = isset($operation->tr) ? floatval($operation->tr) : 0;
        $teardownTime = isset($operation->teardown_time) ? floatval($operation->teardown_time) : 0;
    
        $timePerQuantity = $te / $cavity;
    
        $duration = ($timePerQuantity * $quantity) + $tr + $teardownTime;
    
        if (!empty($usageFactor) && $usageFactor > 0) {
            $duration /= $usageFactor;
        }
    
        return $duration;
    }    
}

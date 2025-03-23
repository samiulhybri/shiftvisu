<?php

namespace App\Http\Controllers;

use App\Console\Commands\MachineOutputCalculate as CommandsMachineOutputCalculate;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\Enums\SectionActivatableTypes;
use App\Jobs\BacklogCalculation;
use App\Models\BacklogItemWeek;
use App\Models\CallOff;
use App\Models\CallOffSimulation;
use App\Models\Capacity;
use App\Models\Hall;
use App\Models\Item;
use App\Models\ItemBomChild;
use App\Models\Machine;
use App\Models\MachineDailyExpectedQuantity;
use App\Models\MachineUserPlanTime;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
use App\Models\SimCallOff;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use PDO;

class PlanVisuController extends Controller
{
    use DispatchesJobs;

    public function calculateBacklog()
    {
        if(env('EXTERNAL_DS_TARGET') == 'vop') {
            $this->dispatch(new BacklogCalculation());
        } else {
            $this->dispatch(new BacklogCalculationController());
        }
    }

    public function exportProdOrders()
    {
        $controller = new ProdOrderExportController();
        if ($controller->export()) {
            return response()->json(['success' => true], 200);
        }
        return response('Error', 409);
    }

    public function getBacklog(Request $request, Hall $hall, bool $simulation = false)
    {
        //Find items that are produced in this hall
        $items_query = DB::table('items')
            ->selectRaw('items.id as id,
                items.custom_id as custom_id,
                items.name as name,
                items.is_sales_item as is_sales_item,
                backlog_items.qty_backlog as qty_backlog')
            ->join('operation_plans', 'items.operation_plan_id', '=', 'operation_plans.id')
            ->join('operation_plan_pos', 'operation_plans.id', '=', 'operation_plan_pos.operation_plan_id')
            ->join('machines', 'machines.id', '=', 'operation_plan_pos.machine_id')
            ->join('backlog_items', 'backlog_items.item_id', 'items.id')
            ->where('machines.hall_id', '=', $hall->id)
            //Custom filter for IHI
            ->where('items.custom_id', '>=', '1000')
            ->groupBy(['items.id', 'backlog_items.qty_backlog']);

        if ($simulation) {
            if ($request->query('type', 'critical') == 'all') {
                $items = $items_query->get();
            } else if ($request->query('type', 'critical') == 'not_critical') {
                $items = $items_query->where('backlog_items.is_critical_sim', false)
                    ->get();
            } else {
                $items = $items_query->where('backlog_items.is_critical_sim', true)
                    ->get();
            }
        } else {
            if ($request->query('type', 'critical') == 'all') {
                $items = $items_query->get();
            } else if ($request->query('type', 'critical') == 'not_critical') {
                $items = $items_query->where('backlog_items.is_critical', false)
                    ->get();
            } else {
                $items = $items_query->where('backlog_items.is_critical', true)
                    ->get();
            }
        }

        $backlog_item_sales_values = array();
        foreach ($items as $item) {
            if ($item->is_sales_item) {
                $backlog_item_sales_values[$item->id][$item->id] = [
                    'id' => $item->id,
                    'custom_id' => $item->custom_id,
                    'name' => $item->name,
                    'qty_for_one_parent' => 1,
                ];
            }
        }


        $item_ids = $items->map(function ($item) {
            return $item->id;
        });

        //Get all the sales items and the respective quantities
        $item_bom_parents = ItemBomChild::select([
            'item_bom_children.child_item_id',
            'item_bom_children.item_id',
            'items.custom_id',
            'items.name',
            'item_bom_children.qty_child_for_one_parent'
        ])
            ->join('items', 'items.id', 'item_bom_children.item_id')
            ->where('items.is_sales_item', true)
            ->whereIn('item_bom_children.child_item_id', $item_ids)
            ->get();


        foreach ($item_bom_parents as $item_bom_parent) {
            $backlog_item_sales_values[$item_bom_parent->child_item_id][$item_bom_parent->item_id] = [
                'id' => $item_bom_parent->item_id,
                'custom_id' => $item_bom_parent->custom_id,
                'name' => $item_bom_parent->name,
                'qty_for_one_parent' => $item_bom_parent->qty_child_for_one_parent,
            ];
        }

        //Get all the backlog quantities
        $backlog_item_weeks = BacklogItemWeek::select(['backlog_item_weeks.*', 'backlog_items.item_id'])
            ->join('backlog_items', 'backlog_items.id', 'backlog_item_weeks.backlog_item_id')
            ->whereIn('backlog_items.item_id', $item_ids)
            ->orderBy('backlog_item_weeks.year')
            ->orderBy('backlog_item_weeks.week')
            ->get();

        $backlog_item_week_values = array();
        foreach ($backlog_item_weeks as $backlog_item_week) {
            $week = "" . $backlog_item_week->year . "_" . sprintf('%02d', $backlog_item_week->week);
            if (!$simulation) {
                $backlog_item_week_values[$backlog_item_week->item_id][$week] = [
                    'year' => $backlog_item_week->year,
                    'week' => $backlog_item_week->week,
                    'qty_prod_order' => $backlog_item_week->qty_prod_order,
                    'qty_call_off' => $backlog_item_week->qty_call_off,
                    'qty_stock' => max($backlog_item_week->qty_stock, 0),
                    'qty_backlog' => $backlog_item_week->qty_backlog,
                ];
            } else {

                $backlog_item_week_values[$backlog_item_week->item_id][$week] = [
                    'year' => $backlog_item_week->year,
                    'week' => $backlog_item_week->week,
                    'qty_prod_order' => $backlog_item_week->qty_prod_order,
                    'qty_call_off' => $backlog_item_week->qty_call_off_sim,
                    'qty_stock' => max($backlog_item_week->qty_stock_sim, 0),
                    'qty_backlog' => $backlog_item_week->qty_backlog_sim,
                ];
            }
        }

        $res = collect();
        foreach ($items as $item) {

            $sales_items = [];
            if (isset($backlog_item_sales_values[$item->id])) {
                $sales_items = $backlog_item_sales_values[$item->id];
            }

            $backlog_item_resource = [
                'id' => $item->id,
                'custom_id' => $item->custom_id,
                'name' => $item->name,
                'sales_items' => $sales_items,
                'weeks' => array_key_exists($item->id, $backlog_item_week_values) ? $backlog_item_week_values[$item->id] : [],
                'backlog' => $item->qty_backlog,
                'qty_backlog' => $item->qty_backlog,
                'qty_stock' => $item->qty_backlog,
                'qty_call_off' => $item->qty_backlog,
            ];

            $res->add($backlog_item_resource);
        }

        return $res;
    }

    public function getSimulationBacklog(Request $request, Hall $hall)
    {
        return $this->getBacklog($request, $hall, true);
    }

    public function getCapacity(Request $request, Hall $hall)
    {
        $is_monthly = $request->input('type', 'monthly') != 'weekly';
        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        if ($is_monthly) {
            $select = 'machines.custom_id as machine_custom_id,
                    machines.name as machine_name,
                    machine_groups.custom_id as machine_group_custom_id,
                    machine_groups.name as machine_group_name,
                    YEAR(capacities.date) as year,
                    MONTH(capacities.date) as month,
                    sum(shifts.hours) * machines.usage_factor as hours_capacity';

            $group_by = [
                'machines.custom_id',
                'machines.name',
                'machine_groups.custom_id',
                'machine_groups.name',
                'year',
                'month'
            ];
        } else {
            $select = 'machines.id as machine_id,
                    machines.custom_id as machine_custom_id,
                    machines.name as machine_name,
                    machine_groups.id as machine_group_id,
                    machine_groups.custom_id as machine_group_custom_id,
                    machine_groups.name as machine_group_name,
                    YEAR(capacities.date) as year,
                    WEEK(capacities.date, 1) as week,
                    sum(shifts.hours) * machines.usage_factor as hours_capacity';

            $group_by = [
                'machines.id',
                'machines.custom_id',
                'machines.name',
                'machine_groups.id',
                'machine_groups.custom_id',
                'machine_groups.name',
                'year',
                'week'
            ];
        }

        $capa = DB::table('capacities')
            ->select(DB::raw($select))
            ->join('shifts', 'shifts.id', 'capacities.shift_id')
            ->join('machines', 'machines.id', 'capacities.capacitable_id')
            ->leftJoin('machine_groups', 'machine_groups.id', 'machines.machine_group_id')
            ->where('machines.hall_id', $hall->id)
            ->where('capacities.date', '>=', $start_date->toDateString())
            ->where('capacities.date', '<=', $end_date->toDateString())
            ->where('capacities.capacitable_type', Machine::class)
            ->groupBy($group_by)
            ->get();

        return $capa;
    }

    private function calculateActualUserDemand($demand, $distributionTime)
    {
        $extra_demand = ($distributionTime > 0) ? $demand * ($distributionTime / 100) : 0;
        return $demand + $extra_demand;
    }
    private function calculateActualMachineCapacity($capacity, $distributionTime)
    {
        return ($distributionTime > 0) ? $capacity * ($distributionTime / 100) : 0;
    }

    private function calculateActualUserCapacity($capacity, $userUtilizationPercentage, $overtimeFactor = 0, $addedHour = 0)
    {
        $adjustedCapacity = $capacity + $addedHour;
        $overtimeContribution = ($overtimeFactor > 0) ? $adjustedCapacity * ($overtimeFactor / 100) : 0;
        $totalCapacity = $adjustedCapacity + $overtimeContribution;
        return $totalCapacity * ($userUtilizationPercentage / 100);
    }

    public function getUserCapacity(Request $request, Hall $hall)
    {
        $is_monthly = $request->input('type', 'monthly') != 'weekly';
        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        $startOfWeek = Carbon::parse($start_date)->startOfWeek();

        // Detect the current database driver
        $driver = DB::connection()->getPDO()->getAttribute(PDO::ATTR_DRIVER_NAME);

        $group_by = [
            'capacities.capacitable_id',
            'capacities.date',
            'capacities.start_time',
            'capacities.end_time',
            'capacities.break_minutes',
            'users.name',
            'users.custom_id',
            'halls.id',
            'halls.name'
        ];

        $capacities = DB::table('capacities')
            ->selectRaw("
        capacities.date,
        " . ($driver === 'pgsql'
                ? "DATE_PART('week', capacities.date) AS week, 
               DATE_PART('month', capacities.date) AS month, 
               DATE_PART('year', capacities.date) AS year"
                : "WEEK(capacities.date, 3) AS week, 
               MONTH(capacities.date) AS month, 
               YEAR(capacities.date) AS year") . ",
        " . ($driver === 'pgsql'
                ? "CONCAT(DATE_PART('year', capacities.date), '-', 
                     LPAD(DATE_PART('week', capacities.date)::TEXT, 2, '0')) AS year_week_combo"
                : "CONCAT(YEAR(capacities.date), '-', 
                     LPAD(WEEK(capacities.date, 3), 2, '0')) AS year_week_combo") . ",
        capacities.start_time,
        capacities.end_time,
        capacities.break_minutes,
        capacities.capacitable_id AS user_id,
        users.name AS user_name,
        users.custom_id AS user_custom_id,
        halls.id AS hall_id,
        halls.name AS hall_name
    ")
            ->join('users', 'users.id', '=', 'capacities.capacitable_id')
            ->leftJoin('halls', 'halls.id', '=', 'users.hall_id')
            ->where('capacities.capacitable_type', User::class)
            ->whereBetween('capacities.date', [$start_date->toDateString(), $end_date->toDateString()])
            ->where('halls.is_enabled_plan_visu', true)
            ->groupBy($group_by)
            ->get();


        $aggregatedData = [];

        foreach ($capacities as $key => $capacity) {
            $start = Carbon::parse($capacity->date . ' ' . $capacity->start_time);
            $end = Carbon::parse($capacity->date . ' ' . $capacity->end_time);

            // Handle crossing midnight
            if ($end->isBefore($start)) {
                $end->addDay();
            }

            $hours_capacity = $start->diffInMinutes($end) / 60;
            if (isset($capacity->break_minutes)) {
                $hours_capacity -= ($capacity->break_minutes / 60);
            }
            $key = $capacity->week . '_' . $capacity->hall_id;

            if (!isset($aggregatedData[$key])) {
                $aggregatedData[$key] = [
                    'week' => $capacity->week,
                    'month' => $capacity->month,
                    'year' => $capacity->year,
                    'user_id' => $capacity->user_id,
                    'user_name' => $capacity->user_name,
                    'user_custom_id' => $capacity->user_custom_id,
                    'hall_id' => $capacity->hall_id,
                    'hall_name' => $capacity->hall_name,
                    'year_week_combo' => $capacity->year_week_combo,
                    'hours_capacity' => 0,
                ];
            }
            $aggregatedData[$key]['hours_capacity'] += $hours_capacity;
        }
        $capacitySettings = DB::table('hall_capacity_settings')
            ->join('halls', 'hall_capacity_settings.hall_id', '=', 'halls.id') // Join to get hall name
            ->selectRaw(
                "
        hall_capacity_settings.hall_id,
        halls.name as hall_name,
        machine_usage, 
        employee_usage, 
        overtime_factor, 
        distribution_factor, 
        additional_hours,
        " . ($driver === 'pgsql'
                    ? "EXTRACT(YEAR FROM hall_capacity_settings.date) || '-' || LPAD(EXTRACT(WEEK FROM hall_capacity_settings.date)::TEXT, 2, '0') AS year_week_combo, 
               EXTRACT(WEEK FROM hall_capacity_settings.date) AS week"
                    : "CONCAT(YEAR(hall_capacity_settings.date), '-', LPAD(WEEK(hall_capacity_settings.date, 3), 2, '0')) AS year_week_combo, 
               WEEK(hall_capacity_settings.date, 3) AS week"
                )
            )
            ->where('hall_capacity_settings.date', '>=', $startOfWeek->toDateString())
            ->get();


        foreach ($aggregatedData as $outerKey => &$data) {
            // Store the original value of hours_capacity in actual_hours_capacity
            $aggregatedData[$outerKey]['actual_hours_capacity'] = $data['hours_capacity'];

            foreach ($capacitySettings as $innerKey => $capacity) {
                if ($data['hall_id'] == $capacity->hall_id && $data['week'] == $capacity->week) {
                    $data['hours_capacity'] = $this->calculateActualUserCapacity($data['hours_capacity'], $capacity->employee_usage, $capacity->overtime_factor, $capacity->additional_hours);
                }
            }
        }
        unset($data);


        // Return aggregated data as an array
        return response()->json([
            'mainData' => array_values($aggregatedData),
            'capacitySettings' => $capacitySettings,
        ]);
    }

    public function getMachineCapacity(Request $request)
    {
        $hall_filter = $request->query('hall_filter', '');
        $machine_group_filter = $request->query('machine_group_filter', '');
        $machine_filter = $request->query('machine_filter', '');

        $hall_filter_query = !empty($hall_filter) ? explode(',', $hall_filter) : [];
        $machine_group_query = !empty($machine_group_filter) ? explode(',', $machine_group_filter) : [];
        $machine_query = !empty($machine_filter) ? explode(',', $machine_filter) : [];

        $is_monthly = $request->input('type', 'monthly') != 'weekly';
        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        $startOfWeek = Carbon::parse($start_date)->startOfWeek();

        // Detect the current database driver
        $driver = DB::connection()->getPDO()->getAttribute(PDO::ATTR_DRIVER_NAME);

        // Prepare query
        $capacities = DB::table('capacities')
            ->selectRaw("
            capacities.date,
            " . ($driver === 'pgsql'
                ? "EXTRACT(WEEK FROM capacities.date) AS week, EXTRACT(MONTH FROM capacities.date) AS month, EXTRACT(YEAR FROM capacities.date) AS year"
                : "WEEK(capacities.date, 3) AS week, MONTH(capacities.date) AS month, YEAR(capacities.date) AS year") . ",
            " . ($driver === 'pgsql'
                ? "CONCAT(DATE_PART('year', capacities.date), '-', LPAD(DATE_PART('week', capacities.date)::TEXT, 2, '0')) as year_week_combo"
                : "CONCAT(YEAR(capacities.date), '-', LPAD(WEEK(capacities.date, 3), 2, '0')) as year_week_combo") . ",
            capacities.start_time,
            capacities.end_time,
            capacities.break_minutes,
            capacities.capacitable_id AS machine_id,
            machines.name AS machine_name,
            machines.custom_id AS machine_custom_id,
            machines.usage_factor * 100 AS usage_factor,
            halls.id AS hall_id,
            halls.name AS hall_name
        ")
            ->join('machines', 'machines.id', '=', 'capacities.capacitable_id')
            ->join('section_activatables', 'section_activatables.activatable_id', '=', 'machines.id')
            ->join('halls', 'halls.id', 'machines.hall_id')
            ->where('capacities.capacitable_type', Machine::class)
            ->where('section_activatables.activatable_type', Machine::class)
            ->where('section_activatables.section', SectionActivatableTypes::PLANVISU())
            ->where('section_activatables.is_active', true)
            ->where('halls.is_enabled_plan_visu', '=', true)
            ->where('capacities.date', '>=', $start_date->toDateString())
            ->where('capacities.date', '<=', $end_date->toDateString());

        if (sizeof($hall_filter_query) > 0) {
            $capacities->whereIn('halls.id', $hall_filter_query);
        }
        if (sizeof($machine_group_query) > 0) {
            $capacities->whereIn('machines.machine_group_id', $machine_group_query);
        }

        if (sizeof($machine_query) > 0) {
            $capacities->whereIn('machines.id', $machine_query);
        }

        $capacities = $capacities->get();

        $aggregatedData = [];

        foreach ($capacities as $capacity) {
            $start = Carbon::parse($capacity->date . ' ' . $capacity->start_time);
            $end = Carbon::parse($capacity->date . ' ' . $capacity->end_time);

            // Handle crossing midnight
            if ($end->isBefore($start)) {
                $end->addDay();
            }

            $hours_capacity = $start->diffInMinutes($end) / 60;

            if (isset($capacity->break_minutes)) {
                $hours_capacity -= ($capacity->break_minutes / 60);
            }

            // Create a unique key to group data by week and machine_id
            $key = $capacity->week . '_' . $capacity->machine_id;

            if (!isset($aggregatedData[$key])) {
                $aggregatedData[$key] = [
                    'week' => $capacity->week,
                    'month' => $capacity->month,
                    'year' => $capacity->year,
                    'machine_id' => $capacity->machine_id,
                    'machine_custom_id' => $capacity->machine_custom_id,
                    'machine_name' => $capacity->machine_custom_id . " - " . $capacity->machine_name,
                    'usage_factor' => $capacity->usage_factor,
                    'hall_id' => $capacity->hall_id,
                    'year_week_combo' => $capacity->year_week_combo,
                    'hours_capacity' => 0
                ];
            }
            $aggregatedData[$key]['hours_capacity'] += $hours_capacity;
        }

        $capacitySettings = DB::table('hall_capacity_settings')
            ->join('halls', 'hall_capacity_settings.hall_id', '=', 'halls.id') // Join to get hall name
            ->selectRaw(
                "
        hall_capacity_settings.hall_id,
        halls.name as hall_name,  -- Get hall name
        machine_usage, 
        employee_usage, 
        overtime_factor, 
        distribution_factor, 
        additional_hours,
        " . ($driver === 'pgsql'
                    ? "EXTRACT(YEAR FROM hall_capacity_settings.date) || '-' || LPAD(EXTRACT(WEEK FROM hall_capacity_settings.date)::TEXT, 2, '0') AS year_week_combo, 
               EXTRACT(WEEK FROM hall_capacity_settings.date) AS week"
                    : "CONCAT(YEAR(hall_capacity_settings.date), '-', LPAD(WEEK(hall_capacity_settings.date, 3), 2, '0')) AS year_week_combo, 
               WEEK(hall_capacity_settings.date, 3) AS week"
                )
            )
            ->where('hall_capacity_settings.date', '>=', $startOfWeek->toDateString())
            ->get();


        foreach ($aggregatedData as &$data) {
            $data['actual_hours_capacity'] = $data['hours_capacity'];

            foreach ($capacitySettings as $capacity) {
                if ($data['hall_id'] == $capacity->hall_id && $data['week'] == $capacity->week) {
                    $data['hours_capacity'] = $this->calculateActualMachineCapacity($data['hours_capacity'], $capacity->machine_usage);
                }
            }
        }
        unset($data);

        $capacitySettings = DB::table('hall_capacity_settings')
            ->join('halls', 'hall_capacity_settings.hall_id', '=', 'halls.id') // Join to get hall name
            ->selectRaw(
                "
        hall_capacity_settings.hall_id,
        halls.name as hall_name,  -- Get hall name
        machine_usage, 
        employee_usage, 
        overtime_factor, 
        distribution_factor, 
        additional_hours,
        " . ($driver === 'pgsql'
                    ? "EXTRACT(YEAR FROM hall_capacity_settings.date) || '-' || LPAD(EXTRACT(WEEK FROM hall_capacity_settings.date)::TEXT, 2, '0') AS year_week_combo, 
               EXTRACT(WEEK FROM hall_capacity_settings.date) AS week"
                    : "CONCAT(YEAR(hall_capacity_settings.date), '-', LPAD(WEEK(hall_capacity_settings.date, 3), 2, '0')) AS year_week_combo, 
               WEEK(hall_capacity_settings.date, 3) AS week"
                )
            )
            ->where('hall_capacity_settings.date', '>=', $startOfWeek->toDateString())
            ->get();

        return response()->json([
            'mainData' => array_values($aggregatedData),
            'capacitySettings' => $capacitySettings,
        ]);
    }


    //Get demanded machine hours of call offs anticipated by the lead time to the relative machines
    public function getDemand(Request $request, Hall $hall)
    {
        //TODO: IS Monthly not supported anymore
        $is_monthly = $request->query('type', 'monthly') != 'weekly';

        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        $select = 'machines.id as machine_id,
            machines.custom_id as machine_custom_id,
            machines.name as machine_name,
            machine_groups.id as machine_group_id,
            machine_groups.custom_id as machine_group_custom_id,
            machine_groups.name as machine_group_name,
            items.id as item_id,
            items.custom_id as item_custom_id,
            items.name as item_name,
            backlog_item_weeks.year,
            backlog_item_weeks.week,
            ((sum(backlog_item_weeks.qty_call_off) * operation_plan_pos.te + machines.tr)/ 3600) as hours_demand';
        //            ((sum(backlog_item_weeks.qty_prod_order + GREATEST(GREATEST(backlog_item_weeks.qty_call_off - backlog_item_weeks.qty_prod_order, 0) - GREATEST(backlog_item_weeks.qty_stock, 0), 0))
        //             * operation_plan_pos.te + machines.tr)/ 3600) as hours_demand';

        $group_by = [
            'machines.id',
            'machines.custom_id',
            'machines.name',
            'machine_groups.id',
            'machine_groups.custom_id',
            'machine_groups.name',
            'items.id',
            'items.custom_id',
            'items.name',
            'operation_plan_pos.id',
            'operation_plan_pos.te',
            'machines.tr',
            'backlog_item_weeks.year',
            'backlog_item_weeks.week'
        ];


        $demand = DB::table('backlog_item_weeks')
            ->select(DB::raw($select))
            ->join('backlog_items', 'backlog_item_weeks.backlog_item_id', 'backlog_items.id')
            ->join('items', 'items.id', 'backlog_items.item_id')
            ->join('operation_plans', 'operation_plans.id', 'items.operation_plan_id')
            ->join('operation_plan_pos', 'operation_plan_pos.operation_plan_id', 'operation_plans.id')
            ->join('machines', 'machines.id', 'operation_plan_pos.machine_id')
            ->join('halls', 'halls.id', 'machines.hall_id')
            ->leftJoin('machine_groups', 'machine_groups.id', 'machines.machine_group_id')
            ->whereRaw(
                'halls.id = ? and
                items.use_for_capacity_planning = true and
                (backlog_item_weeks.qty_call_off > 0 or backlog_item_weeks.qty_prod_order > 0) and
                (backlog_item_weeks.year < ? or
                (backlog_item_weeks.year = ? and backlog_item_weeks.week <= ?))',
                [$hall->id, $end_date->weekYear, $end_date->weekYear, $end_date->isoWeek]
            )
            ->groupBy($group_by)
            ->get();

        return $demand;
    }

    //Get demanded machine hours of call offs anticipated by the lead time to the relative machines
    public function getSimulationDemand(Request $request, Hall $hall, CallOffSimulation $simulation)
    {
        $is_monthly = $request->query('type', 'monthly') != 'weekly';

        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();


        $select = 'machines.id as machine_id,
            machines.custom_id as machine_custom_id,
            machines.name as machine_name,
            machine_groups.id as machine_group_id,
            machine_groups.custom_id as machine_group_custom_id,
            machine_groups.name as machine_group_name,
            items.id as item_id,
            items.custom_id as item_custom_id,
            items.name as item_name,
            backlog_item_weeks.year,
            backlog_item_weeks.week,
            ((sum(backlog_item_weeks.qty_call_off_sim) * operation_plan_pos.te + machines.tr)/ 3600) as hours_demand';
        //            backlog_item_weeks.qty_prod_order + GREATEST(GREATEST(backlog_item_weeks.qty_call_off_sim - backlog_item_weeks.qty_prod_order, 0) - GREATEST(backlog_item_weeks.qty_stock_sim, 0), 0))
        //             * operation_plan_pos.te + machines.tr)/ 3600) as hours_demand';

        $group_by = [
            'machines.id',
            'machines.custom_id',
            'machines.name',
            'machine_groups.id',
            'machine_groups.custom_id',
            'machine_groups.name',
            'items.id',
            'items.custom_id',
            'items.name',
            'operation_plan_pos.id',
            'backlog_item_weeks.year',
            'backlog_item_weeks.week'
        ];

        $demand = DB::table('backlog_item_weeks')
            ->select(DB::raw($select))
            ->join('backlog_items', 'backlog_item_weeks.backlog_item_id', 'backlog_items.id')
            ->join('items', 'items.id', 'backlog_items.item_id')
            ->join('operation_plans', 'operation_plans.id', 'items.operation_plan_id')
            ->join('operation_plan_pos', 'operation_plan_pos.operation_plan_id', 'operation_plans.id')
            ->join('machines', 'machines.id', 'operation_plan_pos.machine_id')
            ->join('halls', 'halls.id', 'machines.hall_id')
            ->leftJoin('machine_groups', 'machine_groups.id', 'machines.machine_group_id')
            ->whereRaw(
                'halls.id = ? and
                items.use_for_capacity_planning = true and
                (backlog_item_weeks.qty_call_off_sim > 0) and
                (backlog_item_weeks.year < ? or
                (backlog_item_weeks.year = ? and backlog_item_weeks.week <= ?))',
                [$hall->id, $end_date->weekYear, $end_date->weekYear, $end_date->isoWeek]
            )
            ->groupBy($group_by)
            ->get();

        return $demand;
    }

    public function getCallOffs(Request $request)
    {
        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        if ($request->has('item_id')) {
            $call_offs = CallOff::getCallOffsForItemIdBetween($request->query('item_id'), $start_date, $end_date, $request->query('child_item_id'));
        } else {
            $call_offs = CallOff::getCallOffsBetween($start_date, $end_date);
        }

        return $call_offs;
    }

    public function getBomStock(Request $request)
    {
        $select = 'item_bom_children.child_item_id as item_id,
            items.custom_id as custom_id,
            items.name as name,
            item_bom_children.pos as pos,
            item_bom_children.qty_child_for_one_parent as qty,
            sum(coalesce(stocks.quantity, 0)) as stock';

        $groupBy = 'item_id,
            custom_id,
            name,
            pos,
            qty';

        $item_bom_children = DB::table('item_bom_children')
            ->select(DB::raw($select))
            ->join('items', 'items.id', 'item_bom_children.child_item_id')
            ->leftJoin('stocks', 'stocks.item_id', 'items.id')
            ->where('item_bom_children.item_id', $request->query('item_id'))
            ->groupByRaw($groupBy)
            ->get();

        $select = 'items.id as item_id,
            items.custom_id as custom_id,
            items.name as name,
            "" as pos,
            1 as qty,
            sum(coalesce(stocks.quantity, 0)) as stock';

        $item = DB::table('items')
            ->select(DB::raw($select))
            ->leftJoin('stocks', 'stocks.item_id', 'items.id')
            ->where('items.id', $request->query('item_id'))
            ->groupByRaw($groupBy)
            ->first();

        $item_bom_children->add($item);

        return $item_bom_children->sortBy('pos')->values();
    }

    public function getSimCallOffs(Request $request, CallOffSimulation $callOffSimulation)
    {
        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();


        if ($request->has('item_id')) {
            $sim_call_offs = SimCallOff::select(['year', 'week'])
                ->where('call_off_simulation_id', $callOffSimulation->id)
                ->where('item_id', $request->query('item_id'))
                ->where('date_monday', '>=', $start_date->subDays($start_date->dayOfWeek - 1)->toDateString())
                ->where('date_monday', '<=', $end_date->toDateString())
                ->groupBy(['year', 'week'])
                ->get();

            for ($date = $start_date->copy(); $date <= $end_date; $date->addWeek()) {
                //Check if already exists
                $contains = $sim_call_offs->contains(function ($value, $key) use ($date) {
                    return $value->year == $date->weekYear && $value->week == $date->isoWeek;
                });

                if (!$contains) {
                    $sim_call_off = new SimCallOff();
                    $sim_call_off->call_off_simulation_id = $callOffSimulation->id;
                    $sim_call_off->item_id = $request->query('item_id');
                    $sim_call_off->year = $date->weekYear;
                    $sim_call_off->week = $date->isoWeek;

                    $date_monday = now();
                    $date_monday->setISODate($sim_call_off->year, $sim_call_off->week);

                    $sim_call_off->date_monday = $date_monday->toDateString();
                    $sim_call_off->quantity = 0;
                    $sim_call_off->save();
                }
            }


            if ($request->has('child_item_id')) {
                $select = 'sim_call_offs.id as id,
                    items.id as item_id,
                    items.custom_id as item_custom_id,
                    items.name as item_name,
                    YEAR(DATE_SUB(sim_call_offs.date_monday, INTERVAL item_bom_children.lead_time_days DAY)) as year,
                    WEEK(DATE_SUB(sim_call_offs.date_monday, INTERVAL item_bom_children.lead_time_days DAY), 1) as week,
                    sim_call_offs.quantity as quantity';

                $sim_call_offs = DB::table('sim_call_offs')
                    ->selectRaw($select)
                    ->join('items', 'items.id', 'sim_call_offs.item_id')
                    ->join('item_bom_children', 'item_bom_children.item_id', 'items.id')
                    ->whereRaw(
                        'items.id = ? and
                        item_bom_children.child_item_id = ? and
                        sim_call_offs.call_off_simulation_id = ? and
                        sim_call_offs.date_monday >= ? and
                        sim_call_offs.date_monday <= ?',
                        [
                            $request->query('item_id'),
                            $request->query('child_item_id'),
                            $callOffSimulation->id,
                            $start_date->toDateString(),
                            $end_date->toDateString()
                        ]
                    )
                    ->get();
            } else {
                $select = 'sim_call_offs.id as id,
                    items.id as item_id,
                    items.custom_id as item_custom_id,
                    items.name as item_name,
                    YEAR(sim_call_offs.date_monday) as year,
                    WEEK(sim_call_offs.date_monday, 1) as week,
                    sim_call_offs.quantity as quantity';

                $sim_call_offs = DB::table('sim_call_offs')
                    ->selectRaw($select)
                    ->join('items', 'items.id', 'sim_call_offs.item_id')
                    ->whereRaw(
                        'items.id = ? and
                        sim_call_offs.call_off_simulation_id = ? and
                        sim_call_offs.date_monday >= ? and
                        sim_call_offs.date_monday <= ?',
                        [
                            $request->query('item_id'),
                            $callOffSimulation->id,
                            $start_date->toDateString(),
                            $end_date->toDateString()
                        ]
                    )
                    ->get();
            }
        } else {
            $select = 'sim_call_offs.id as id,
                items.id as item_id,
                items.custom_id as item_custom_id,
                items.name as item_name,
                YEAR(sim_call_offs.date_monday) as year,
                WEEK(sim_call_offs.date_monday, 1) as week,
                sim_call_offs.quantity as quantity';

            $sim_call_offs = DB::table('sim_call_offs')
                ->selectRaw($select)
                ->join('items', 'items.id', 'sim_call_offs.item_id')
                ->whereRaw(
                    'sim_call_offs.call_off_simulation_id = ? and
                    sim_call_offs.date_monday >= ? and
                    sim_call_offs.date_monday <= ?',
                    [$callOffSimulation->id, $start_date->toDateString(), $end_date->toDateString()]
                )
                ->get();
        }

        return $sim_call_offs;
    }

    public function updateSimCallOff(Request $request, SimCallOff $simCallOff)
    {
        $simCallOff->quantity = $request->input('quantity', $simCallOff->quantity);
        $simCallOff->save();

        $prod_items = DB::table('item_bom_children')
            ->select('child_item_id')
            ->where('item_id', $simCallOff->item_id)
            ->get();

        $prod_item_ids = $prod_items->map(function ($prod_item) {
            return $prod_item->child_item_id;
        });

        return $simCallOff;
    }

    public function storeSimCallOff(Request $request)
    {

        //TODO: Error handling if not all params are ok
        $count = SimCallOff::where('call_off_simulation_id', $request->input('call_off_simulation_id'))
            ->where('item_id', $request->input('item_id'))
            ->where('year', $request->input('year'))
            ->where('week', $request->input('week'))
            ->count();

        if ($count)
            abort(409);

        $simCallOff = new SimCallOff();
        $simCallOff->call_off_simulation_id = $request->input('call_off_simulation_id');
        $simCallOff->item_id = $request->input('item_id');
        $simCallOff->year = $request->input('year');
        $simCallOff->week = $request->input('week');

        $date_monday = now();
        $date_monday->setISODate($simCallOff->year, $simCallOff->week);

        $simCallOff->date_monday = $date_monday->toDateString();
        $simCallOff->quantity = $request->input('quantity', 0);
        $simCallOff->save();

        $prod_items = DB::table('item_bom_children')
            ->select('child_item_id')
            ->where('item_id', $simCallOff->item_id)
            ->get();

        $prod_item_ids = $prod_items->map(function ($prod_item) {
            return $prod_item->child_item_id;
        });

        return $simCallOff;
    }

    public function calculateEndDate(Request $request)
    {
        $start_datetime = Carbon::parse($request->start_date);
        $start_date = $start_datetime->format('Y-m-d');
        $previous_start_date = $start_datetime->copy()->subDay()->format('Y-m-d');
        $start_time = $start_datetime->format('H:i:s');
        $total_minutes = $request->total_minutes;
        $machine_id = $request->machine_id;
        $end_datetime = Carbon::parse($request->end_date);
        $capacity_with_shifts = Capacity::with(['shift' => function ($query) {
            $query->selectRaw("id, start_time, end_time, CASE WHEN start_time > end_time THEN TIME_TO_SEC(TIMEDIFF(TIMESTAMP(CONCAT(CURDATE(), ' ', end_time)), TIMESTAMP(CONCAT(DATE_ADD(CURDATE(), INTERVAL -1 DAY), ' ', start_time)))) / 60  ELSE TIME_TO_SEC(TIMEDIFF(TIMESTAMP(CONCAT(CURDATE(), ' ', end_time)), TIMESTAMP(CONCAT(CURDATE(), ' ', start_time)))) / 60    END AS time_difference_minutes");
        }])
            ->where('capacitable_id', $machine_id)
            ->where('capacitable_type', Machine::class)
            ->where('date', '>=', $previous_start_date)
            ->get();
        foreach ($capacity_with_shifts as $capacity) {
            $shift = $capacity->shift;
            // format the shift start and end datetime. if end time falls into tomorrow, add day.
            $shift_start_date_time = new Carbon($capacity->date . " " . $shift->start_time);
            $shift_end_date_time = new Carbon($capacity->date . " " . $shift->end_time);
            if ($shift_start_date_time > $shift_end_date_time) {
                $shift_end_date_time->addDay();
            }
            if ($total_minutes > 0) {
                if ($shift_end_date_time <= $start_datetime) {
                    // if start_time falls into next shift
                    // start_time = 15:01:00, shifts end_time=14:00:00
                    continue;
                } else if ($shift_start_date_time < $start_datetime && $shift_end_date_time > $start_datetime) {
                    // if start_time falls into current shift
                    // start_time = 15:01:00, shifts start_time=14:00:00shifts end_time=22:00:00
                    $diff_time = $start_datetime->diffInMinutes($shift_end_date_time);
                    if ($total_minutes < $shift->time_difference_minutes && $diff_time > $total_minutes) {
                        $end_datetime = $start_datetime->addMinutes($total_minutes);
                        break;
                    } else {
                        $total_minutes -= $diff_time;
                    }
                } else {
                    // every other case
                    // start_time = 15:01:00, shifts start_time=22:00:00shifts end_time=06:00:00
                    if ($total_minutes > $shift->time_difference_minutes) {
                        $total_minutes -= $shift->time_difference_minutes;
                    } else if ($total_minutes < $shift->time_difference_minutes) {
                        $end_datetime = $shift_start_date_time->addMinutes($total_minutes);
                        break;
                    } else {
                        $end_datetime = $shift_end_date_time;
                        break;
                    }
                }
            }
        }
        return $end_datetime->format("Y-m-d H:i:s");
    }

    public function getDemandProdOrder(Request $request)
    {
        //TODO: IS Monthly not supported anymore
        $is_monthly = $request->query('type', 'monthly') != 'weekly';

        $hall_filter = $request->query('hall_filter', '');
        $machine_group_filter = $request->query('machine_group_filter', '');
        $machine_filter = $request->query('machine_filter', '');

        $hall_filter_query = !empty($hall_filter) ? explode(',', $hall_filter) : [];
        $machine_group_query = !empty($machine_group_filter) ? explode(',', $machine_group_filter) : [];
        $machine_query = !empty($machine_filter) ? explode(',', $machine_filter) : [];

        $report_type = $request->query('report_type');

        $start_date = strtotime($request->query('start_date')) ?
            Date::createFromTimestamp(strtotime($request->query('start_date'))) :
            now();

        $end_date = strtotime($request->query('end_date')) ?
            Date::createFromTimestamp(strtotime($request->query('end_date'))) :
            now()->addYear();

        $startOfWeek = Carbon::parse($start_date)->startOfWeek();

        $driver = DB::connection()->getPDO()->getAttribute(PDO::ATTR_DRIVER_NAME);

        DB::statement("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))");


        // dd($demand);

        if ($report_type == 'Machine') {

            $demand = MachineDailyExpectedQuantity::select(
                'machine_daily_expected_quantities.machine_id',
                'machine_daily_expected_quantities.date',
                'machine_daily_expected_quantities.quantity',
                'machine_daily_expected_quantities.te',
                'machine_daily_expected_quantities.tr',
                'machine_daily_expected_quantities.teardown_time',
                'machines.custom_id as machine_custom_id',
                'machines.hall_id as hall_id',
                DB::raw('machines.usage_factor * 100 AS usage_factor'),
                DB::raw($driver === 'pgsql'
                    ? "machines.custom_id || ' - ' || machines.name AS machine_name"
                    : "CONCAT(machines.custom_id, ' - ', machines.name) AS machine_name"),
                DB::raw($driver === 'pgsql' ? 'DATE_PART(\'year\', machine_daily_expected_quantities.date) as year' : 'YEAR(machine_daily_expected_quantities.date) as year'),
                DB::raw($driver === 'pgsql' ? 'DATE_PART(\'week\', machine_daily_expected_quantities.date) as week' : 'WEEK(machine_daily_expected_quantities.date, 3) as week'),
                DB::raw(
                    $driver === 'pgsql'
                        ? "CONCAT(DATE_PART('year', machine_daily_expected_quantities.date), '-', LPAD(DATE_PART('week', machine_daily_expected_quantities.date)::TEXT, 2, '0')) as year_week_combo"
                        : "CONCAT(YEAR(machine_daily_expected_quantities.date), '-', LPAD(WEEK(machine_daily_expected_quantities.date, 3), 2, '0')) as year_week_combo"
                ),
                DB::raw('ROUND(((machine_daily_expected_quantities.quantity * machine_daily_expected_quantities.te /  machine_daily_expected_quantities.cavity) + machine_daily_expected_quantities.tr + machine_daily_expected_quantities.teardown_time ) / 3600, 2) as hours_demand')
            )->join('machines', 'machines.id', '=', 'machine_daily_expected_quantities.machine_id')
                ->join('halls', 'halls.id', '=', 'machines.hall_id');

            $demand->where('machine_daily_expected_quantities.workloadable_type', ProdOrderPosOperation::class);
            $demand->where('machine_daily_expected_quantities.date', '>=', $start_date->format('Y-m-d'));

            if (sizeof($hall_filter_query) > 0) {
                $demand->whereIn('halls.id', $hall_filter_query);
            }
            if (sizeof($machine_group_query) > 0) {
                $demand->whereIn('machines.machine_group_id', $machine_group_query);
            }
            if (sizeof($machine_query) > 0) {
                $demand->whereIn('machines.id', $machine_query);
            }
            $demandData = $demand->get();

            // Aggregate the data by machine_custom_id and year_week_combo while keeping all keys
            $demand = $demandData->groupBy(function ($item) {
                return $item->machine_custom_id . '_' . $item->year_week_combo;
            })->map(function ($group) {
                $result = new \stdClass(); // Use the global stdClass
                $result->hall_id = $group->first()->hall_id;
                $result->machine_id = $group->first()->machine_id;
                $result->usage_factor = $group->first()->usage_factor;
                $result->machine_custom_id = $group->first()->machine_custom_id;
                $result->machine_name = $group->first()->machine_name;
                $result->year = $group->first()->year;
                $result->week = $group->first()->week;
                $result->year_week_combo = $group->first()->year_week_combo;
                $result->hours_demand = $group->sum('hours_demand');
                $result->actual_hours_demand = $group->sum('actual_hours_demand');
                return $result; // Return the object
            })->values();
        } else {
            $demand = MachineDailyExpectedQuantity::select(
                'machine_daily_expected_quantities.machine_id',
                'machine_daily_expected_quantities.date',
                'machine_daily_expected_quantities.quantity',
                'machine_daily_expected_quantities.te',
                'machine_daily_expected_quantities.tr',
                'machine_daily_expected_quantities.teardown_time',
                'machines.custom_id as machine_custom_id',
                'machines.hall_id as hall_id',
                'halls.name as hall_name',
                DB::raw('machines.usage_factor * 100 AS usage_factor'),
                DB::raw($driver === 'pgsql'
                    ? "machines.custom_id || ' - ' || machines.name AS machine_name"
                    : "CONCAT(machines.custom_id, ' - ', machines.name) AS machine_name"),
                DB::raw($driver === 'pgsql' ? 'DATE_PART(\'year\', machine_daily_expected_quantities.date) as year' : 'YEAR(machine_daily_expected_quantities.date) as year'),
                DB::raw($driver === 'pgsql' ? 'DATE_PART(\'week\', machine_daily_expected_quantities.date) as week' : 'WEEK(machine_daily_expected_quantities.date, 3) as week'),
                DB::raw(
                    $driver === 'pgsql'
                        ? "CONCAT(DATE_PART('year', machine_daily_expected_quantities.date), '-', LPAD(DATE_PART('week', machine_daily_expected_quantities.date)::TEXT, 2, '0')) as year_week_combo"
                        : "CONCAT(YEAR(machine_daily_expected_quantities.date), '-', LPAD(WEEK(machine_daily_expected_quantities.date, 3), 2, '0')) as year_week_combo"
                ),
                DB::raw('ROUND(((machine_daily_expected_quantities.quantity * machine_daily_expected_quantities.te /  machine_daily_expected_quantities.cavity) + machine_daily_expected_quantities.tr + machine_daily_expected_quantities.teardown_time ) / 3600, 2) as hours_demand')
            )->join('machines', 'machines.id', '=', 'machine_daily_expected_quantities.machine_id')
                ->join('halls', 'halls.id', '=', 'machines.hall_id');

            $demand->where('machine_daily_expected_quantities.workloadable_type', ProdOrderPosOperation::class);
            $demand->where('machine_daily_expected_quantities.date', '>=', $start_date->format('Y-m-d'));

            if (sizeof($hall_filter_query) > 0) {
                $demand->whereIn('halls.id', $hall_filter_query);
            }
            if (sizeof($machine_group_query) > 0) {
                $demand->whereIn('machines.machine_group_id', $machine_group_query);
            }
            if (sizeof($machine_query) > 0) {
                $demand->whereIn('machines.id', $machine_query);
            }
            $demandData = $demand->get();

            // Aggregate the data by machine_custom_id and year_week_combo while keeping all keys
            $demand = $demandData->groupBy(function ($item) {
                return $item->hall_id . '_' . $item->year_week_combo;
            })->map(function ($group) {
                $result = new \stdClass(); // Use the global stdClass
                $result->hall_id = $group->first()->hall_id;
                $result->hall_name = $group->first()->hall_name;
                $result->year = $group->first()->year;
                $result->week = $group->first()->week;
                $result->year_week_combo = $group->first()->year_week_combo;
                $result->hours_demand = $group->sum('hours_demand');
                $result->actual_hours_demand = $group->sum('actual_hours_demand');
                return $result; // Return the object
            })->values();

        }

        $capacitySettings = DB::table('hall_capacity_settings')
            ->join('halls', 'hall_capacity_settings.hall_id', '=', 'halls.id') // Join to get hall name
            ->selectRaw(
                "
        hall_capacity_settings.hall_id,
        halls.name as hall_name,  -- Get hall name
        machine_usage, 
        employee_usage, 
        overtime_factor, 
        distribution_factor, 
        additional_hours,
        " . ($driver === 'pgsql'
                    ? "EXTRACT(YEAR FROM hall_capacity_settings.date) || '-' || LPAD(EXTRACT(WEEK FROM hall_capacity_settings.date)::TEXT, 2, '0') AS year_week_combo, 
               EXTRACT(WEEK FROM hall_capacity_settings.date) AS week"
                    : "CONCAT(YEAR(hall_capacity_settings.date), '-', LPAD(WEEK(hall_capacity_settings.date, 3), 2, '0')) AS year_week_combo, 
               WEEK(hall_capacity_settings.date, 3) AS week"
                )
            )
            ->where('hall_capacity_settings.date', '>=', $startOfWeek->toDateString())
            ->get();


        foreach ($demand as $key => $data) {
            // Store the original hours_demand in actual_hours_demand before modifying it
            $demand[$key]->actual_hours_demand = $data->hours_demand;

            foreach ($capacitySettings as $capacity) {
                if ($data->hall_id == $capacity->hall_id && $data->week == $capacity->week) {
                    if (method_exists($this, 'calculateActualUserDemand')) {
                        if ($report_type != 'Machine') {
                            $demand[$key]->hours_demand = $this->calculateActualUserDemand($data->hours_demand, $capacity->distribution_factor);
                        }
                    }
                }
            }
        }

        return response()->json([
            'mainData' => $demand,
            'capacitySettings' => $capacitySettings,
        ]);
    }
    public function createNewOrders(Request $request)
    {
        try {
            DB::beginTransaction();
            $mainData =  $request->all();
            foreach ($mainData as $data) {
                $prodOrderId = DB::table('prod_orders')->insertGetId([
                    'custom_id' => $data['custom_id'],
                    'call_off_id'=>$data['call_off_id'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'order_type' => ProdOrderType::PRODUCTION(),
                ]);
                foreach ($data['prodOrderPos'] as $prodOrderPosSingle) {
                    $prodOrderPosId = DB::table('prod_order_pos')->insertGetId([
                        'prod_order_id' => $prodOrderId,
                        'pos' => $prodOrderPosSingle['pos'],
                        'item_id' => $prodOrderPosSingle['item']['id'],
                        'quantity' => $prodOrderPosSingle['quantity'],
                        'status' => $prodOrderPosSingle['status'],
                        'status_plan' => $prodOrderPosSingle['status'],
                        'due_date' => Carbon::createFromFormat('d.m.Y', $prodOrderPosSingle['due_date'])->format('Y-m-d'),
                    ]);
                    foreach ($prodOrderPosSingle['prodOrderPosOperations'] as $operation) {
                        DB::table('prod_order_pos_operations')->insert([
                            'prod_order_pos_id' => $prodOrderPosId,
                            'pos' => $operation['pos'],
                            'name' => $operation['name'],
                            'te' => $operation['te'],
                            'tr' => $operation['tr'],
                            'cavity' => $operation['cavity'],
                            'machine_id' => $operation['machine']['id'],
                            'status' => $operation['status'],
                            'status_plan' => $operation['status_plan'],
                            'start' => Carbon::createFromFormat('d.m.Y H:i', $operation['start'])->format('Y-m-d H:i:s'),
                            'end' => Carbon::createFromFormat('d.m.Y H:i', $operation['end'])->format('Y-m-d H:i:s'),
                            'registered_quantity' => 0,
                            'lead_time_days' => $operation['lead_time_days'],
                            'send_ahead_quantity' => $operation['send_ahead_quantity'],
                            'constraint_type' => $operation['constraint_type']
                        ]);
                    }
                }
            }
            DB::commit();
            return response()->json(['success' => 'Data inserted successfully!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Transaction failed!', 'details' => $e->getMessage()]);
        }
    }

    public function getUserWithCapacity(Request $request)
    {
        $driver = DB::connection()->getPDO()->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'pgsql') {
            $starDateQuery = 'to_char(capacities.start_time, "HH:MI:SS")';
            $endDateQuery = 'to_char(capacities.end_time, "HH:MI:SS")';
        } else {
            $starDateQuery = 'DATE_FORMAT(capacities.start_time, "%H:%i:%s")';
            $endDateQuery = 'DATE_FORMAT(capacities.end_time, "%H:%i:%s")';
        }

        try {
            $users = Capacity::join('users', function ($join) {
                $join->on('capacities.capacitable_id', 'users.id')
                    ->where('capacities.capacitable_type', User::class);
            })
                ->leftJoin('machine_user_plan_times', 'capacities.id', 'machine_user_plan_times.capacity_id')
                ->orderBy('capacities.date')
                ->whereIn('users.hall_id', $request->hallIds)
                ->whereBetween('capacities.date', [$request->start_date, $request->end_date])
                ->select([
                    'users.id as user_id',
                    'capacities.id as capacity_id',
                    'capacities.date',
                    DB::raw("COALESCE(machine_user_plan_times.start_time, $starDateQuery) as `start_time`"),
                    DB::raw("COALESCE(machine_user_plan_times.end_time, $endDateQuery) as `end_time`"),
                    'machine_user_plan_times.machine_id',
                    'machine_user_plan_times.id as machine_user_plan_time_id',
                    'capacities.start_time as capacity_start_time',
                    'capacities.end_time as capacity_end_time',
                    'users.name',
                    'users.hall_id',
                    DB::raw('ROW_NUMBER() OVER () as id')
                ])
                ->get();
        } catch (\Exception $e) {
            $users = collect();
        }

        return response()->json([
            'success' => $users->isNotEmpty(),
            'users' => $users
        ]);
    }
    public function userSchedulerCalendar(Request $request)
    {

        try{
            $calendars = collect([]);
            $machineCapacities = [];
            $machines =  Machine::where('is_active', true)
                ->when(!empty($request->hallIds), function($q) use ($request){
                    $q->whereIn('hall_id', $request->hallIds);
                })
                ->when(!empty($request->machineIds), function($q) use ($request){
                    $q->whereIn('id', $request->machineIds);
                })
                ->with(['capacities' => function ($query) use ($request) {
                    $query->whereBetween('date', [$request->start_date, $request->end_date])
                        ->orderBy('date');
                }])
                ->select('id', 'custom_id')
                ->get();
            $timezone = $request->timeZone ?? 'UTC';
            foreach ($machines as $machine) {
                $calendar = [];
                $calendar['id'] = $machine->custom_id;
                $calendar['name'] = $machine->id;
                $calendar['unspecifiedTimeIsWorking'] = false;
                $calendar['intervals'] = [];
                $capacities = $machine->capacities;
    
                $capacityCount = $capacities->count() ?? 0;
                for ($i = 0; $i < $capacityCount; $i++) {
                    $interval = collect([]);
                    $isMultiPleCapacity = true;
                    $date = $capacities[$i]->date;
                    $start_time = $capacities[$i]->start_time;
    
                    $startDateTime = Carbon::parse("$date $start_time", 'UTC')->setTimezone($timezone);
                    while ($isMultiPleCapacity) {
                        if (
                            $i < $capacityCount - 1
                            && $capacities[$i + 1]->date == $date
                            && $capacities[$i + 1]->start_time == $capacities[$i]->end_time
                        ) {
                            $end_time = $capacities[$i + 1]->end_time;
                            $i += 1;
                        } else {
                            $end_time = $capacities[$i]->end_time;
                            $isMultiPleCapacity = false;
                        }
                    }
                    $duration = $this->getDurationMin($startDateTime, $date . ' ' . $end_time);
                    $endDateTime = Carbon::parse("{$date} {$end_time}", 'UTC')->setTimezone($timezone);
                    if ($duration <= 0) {
                        $endDateTime = $endDateTime->addDay();
                    }
                    $interval['startDate'] = $startDateTime->toIso8601String();
                    $interval['capacityStartDate'] = $startDateTime->toIso8601String();
                    $interval['endDate'] =  $endDateTime->toIso8601String();
                    $interval['capacityEndDate'] =  $endDateTime->toIso8601String();
                    $interval['isWorking'] = true;
                    $calendar['intervals'][] = $interval;
                }
                $machineCapacities[$machine->custom_id] = $calendar['intervals'];
                $calendars->push($calendar);
            }
          return response()->json(compact('calendars', 'machineCapacities'));
        }catch(Exeption $e){
            return response(json($e->getMessage()), 500);
        }
    }

    public function getDurationMin($start, $end)
    {
        $startTime = Carbon::parse($start);
        $endTime = Carbon::parse($end);

        return $startTime->diffInMinutes($endTime);
    }

    public function deleteUserPlanTime(MachineUserPlanTime $planTime)
    {
        try {
            $before = MachineUserPlanTime::where('capacity_id', $planTime->capacity_id)
                ->where('id', '<', $planTime->id)
                ->first();
            $before?->update([
                'end_time' => $planTime->end_time
            ]);
            if (!$before) {
                $after = MachineUserPlanTime::where('capacity_id', $planTime->capacity_id)
                    ->where('id', '>', $planTime->id)
                    ->first();
                $after?->update([
                    'start_time' => $planTime->start_time
                ]);
            }
            $planTime->delete();
            return response()->json([], 200);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }
    public function getItemsWithCustomer(Request $request)
    {
        $search = $request->query('search', '');
        $sortBy = $request->query('sortBy', 'custom_id');
        $sortOrder = $request->query('sortOrder', 'asc');

        $perPage = $request->query('perPage', 30);
        $page = $request->query('page', 1);

        $items = Item::with(['customer', 'operationPlan.operationPlanPos', 'operationPlan.operationPlanPos.machine'])
            ->where(function ($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('name2', 'LIKE', "%{$search}%")
                    ->orWhere('custom_id', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', function ($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%");
                    });
            })
            ->orderBy($sortBy, $sortOrder)
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json($items);
    }

    public function getCallOffsWithCustomer(Request $request)
    {
        $search = $request->query('search', '');
        $sortBy = $request->query('sortBy', 'custom_id');
        $sortOrder = $request->query('sortOrder', 'asc');
        $startDate = $request->query('startDate', '1975-01-01');
        $endDate = $request->query('endDate', '2575-01-01');
        $callOfType = $request->query('call_of_type', 'unused');
        $internalFilterType = $request->query('internal_filter_type', 'all');
        $perPage = $request->query('perPage', 20);
        $page = $request->query('page', 1);

        $callOffs = CallOff::with([
            'item',
            'item.customer',
            'item.operationPlan',
            'item.operationPlan.operationPlanPos',
            'item.operationPlan.operationPlanPos.machine',
            'prodOrders'
        ])  
            ->whereBetween('date', [$startDate, $endDate])
            ->where(function ($query) use ($search) {
                $query->where('custom_id', 'LIKE', "%{$search}%")
                    ->orWhere('quantity', $search)
                    ->orWhereHas('item', function ($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('name2', 'LIKE', "%{$search}%")
                            ->orWhere('custom_id', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('item.customer', function ($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%");
                    });
            });
            if ($callOfType === 'used') {
                $callOffs->whereHas('prodOrders'); // Only fetch callOffs that have related prodOrders
            }else{
                $callOffs->whereDoesntHave('prodOrders');
            }

            if ($internalFilterType === 'internal') {
                $callOffs->where('is_internal', true);
            } elseif ($internalFilterType === 'not_internal') {
                $callOffs->where('is_internal', false);
            }
        
            $callOffs = $callOffs->orderBy($sortBy, $sortOrder)
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

        return response()->json($callOffs);
    }

    public function getCurrentRunningTasks() {
        return Http::get('https://app.schertech.com/task_visu_dev/php/task_time_data_service.php?service=get_all_user_status_angular');
    }

    public function getMachineUserPlanTimes(Request $request) {
        $start = Carbon::parse($request->start);
        $end = Carbon::parse($request->end);
        $hallIds = $request->hall_ids;
        $userIds = $request->user_ids;
        $machineIds = $request->machine_ids;

        $query = User::where(function ($query) use ($hallIds, $userIds) {
            $query->when(!empty($hallIds),function($q) use ($hallIds){
                return $q->whereIn('hall_id', $hallIds);
            });

            $query->when(!empty($userIds), function ($q) use ($userIds) {
                return $q->whereIn('id', $userIds);
            });
        })
        ->with(['machineUserPlanTimes' => function ($query) use ($start, $end, $machineIds) {
            $query->where('start_time', '>=',$start)
                  ->where('end_time', '<=', $end)
                  ->with(['machine', 'capacity'])
                  ->when(!empty($machineIds),function($q) use ($machineIds){
                     return $q->whereIn('machine_id', $machineIds);
                  });
        }]);

        $users = $query->get();

        return response()->json($users);
    }
}

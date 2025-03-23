<?php

namespace App\Http\Controllers;

use App\Models\BacklogItemWeek;
use App\Models\Hall;
use App\Models\Item;
use App\Models\Machine;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\ProdOrderPosOperation;
use Illuminate\Support\Facades\DB;
use App\Models\ProdOrderPo;
use App\Models\SectionActivatable;
use Carbon\Carbon;

class RangeOverViewController extends Controller
{
    // will be removed later
    /*public function getRangeOverview(Request $request)
    {
        $top = $request->input('$top');
        $skip = $request->input('$skip');
        $filter = $request->input('$filter');
        $status = $request->input('$status');

        $query = Item::query();

        if ($filter) {
            $query->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%')
                    ->orWhere('custom_id', 'like', '%' . $filter . '%');
            });
        }

        $items = $query->get();

        $result = $items->map(function ($item) use ($status) {
            $backlogs = $this->getBacklogs($item);

            $temp = [];
            switch ($status) {
                case "1":
                    if ($this->checkQtyBacklog($backlogs)) {
                        $temp = $backlogs;
                    }
                    break;
                case "0":
                    if (!$this->checkQtyBacklog($backlogs)) {
                        $temp = $backlogs;
                    }
                    break;
                case "":
                    $temp = $backlogs;
                    break;
            }

            if (count($temp) > 0) {
                return [
                    'item' => $item,
                    'backlogs' => $temp,
                ];
            }
        })->filter()->values();

        $result = $result->skip($skip)->take($top)->values();

        return response()->json($result);
    }*/

    public function getRangeOverview(Request $request)
    {
        $top = $request->input('$top', 40);
        $skip = $request->input('$skip', 0);
        $filter = $request->input('$filter', '');
        $status = $request->input('$status', '1');
        $inIt = $request->input('$inIt', '0');
        $hallIds = $inIt ? Hall::select('id')->first() : ($request->input('hall_id') ? explode(',', $request->input('hall_id')) : Hall::select('id')->pluck('id'));

        $query = Item::query();
        $query->whereHas('prodOrderPos.prodOrderPosOperations.machine', function ($query) use ($inIt, $hallIds) {
            $query->whereIn('hall_id', $hallIds);
        });
        $query->select('id', 'name', 'is_production_item', 'custom_id')
            ->distinct()
            ->where('is_production_item', 1)
            ->with('backlogItem')
            ->with('backlogItemWeeks');

        if ($filter) {
            $query->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%')
                    ->orWhere('custom_id', 'like', '%' . $filter . '%');
            });
        }

        $items = $query->get();

        $result = $items->map(function ($item) use ($status) {
            $backlogs = $item->backlogItemWeeks ?? [];
            $backlogs = $backlogs->map(function ($backlog) {
                $backlog->combine_week_year = $backlog->week . ' - ' . $backlog->year;
                return $backlog;
            });
            $temp = [];
            switch ($status) {
                case "1":
                    if ($this->checkQtyBacklog($backlogs)) {
                        $temp = $backlogs;
                    }
                    break;
                case "0":
                    if (!$this->checkQtyBacklog($backlogs)) {
                        $temp = $backlogs;
                    }
                    break;
                case "":
                    $temp = $backlogs;
                    break;
            }

            if (count($temp) > 0) {
                return [
                    'item' => $item,
                    'backlogs' => $temp,
                ];
            }
        })->filter()->values();

        $result = $result->skip($skip)->take($top)->values();
        $result = $result->values()->toArray();

        $result = array_map(function ($item) {
            $item['item']['backlogItem'] = [
                'qty_call_off' => $item['item']['backlogItem']['qty_call_off'],
                'qty_stock' => $item['item']['backlogItem']['qty_stock'],
                'qty_prod_order' => $item['item']['backlogItem']['qty_prod_order'],
                'qty_backlog' => $item['item']['backlogItem']['qty_backlog'],
                'year' => $item['item']['backlogItemWeeks'][0]['year'],
                'week' => $item['item']['backlogItemWeeks'][0]['week'] - 1,
                'id' => $item['item']['backlogItem']['id'],
                'item_id' => $item['item']['backlogItem']['item_id'],
            ];
            return [
                'backlogs' => collect([$item['item']['backlogItem']])->merge($item['backlogs'])->map(function ($backlog) {
                    return $backlog;
                }),
                'item' => [
                    'id' => $item['item']['id'],
                    'name' => $item['item']['name'],
                    'custom_id' => $item['item']['custom_id'],
                    'is_production_item' => $item['item']['is_production_item'],
                    'backlogItem' => $item['item']['backlogItem'],
                ],
            ];
        }, $result);

        return response()->json($result);
    }

    function checkQtyBacklog($backlogs)
    {
        foreach ($backlogs as $backlog) {
            if ($backlog->qty_backlog < 0) {
                return true;
            }
        }
        return false;
    }

    function getBacklogs(Item $item)
    {
        $backlogItemWeek = BacklogItemWeek::with('backlogItem')
            ->whereHas('backlogItem', function ($query) use ($item) {
                $query->where('item_id', $item->id);
            })
            ->orderBy('year', 'asc')
            ->orderBy('week', 'asc')
            ->get();

        return $backlogItemWeek;
    }

    public function getOpearationQuantity(Request $request)
    {
        $year = $request->input('year');
        $week = $request->input('week');
        $itemId = $request->input('itemId');

        $startOfWeek = Carbon::now()->setISODate($year, $week)->startOfWeek();
        $endOfWeek = Carbon::now()->setISODate($year, $week)->endOfWeek();
        $query = ProdOrderPosOperation::select('prod_order_pos_operations.id', 'prod_order_pos_operations.status', 'prod_order_pos_operations.end', 
        DB::raw('SUM(prod_order_pos.quantity) as total_quantity'))
            ->join('prod_order_pos', 'prod_order_pos_operations.prod_order_pos_id', '=', 'prod_order_pos.id')
            ->join('section_activatables', function ($join) {
                $join
                    ->on('prod_order_pos_operations.machine_id', '=', 'section_activatables.activatable_id')
                    ->where('section_activatables.activatable_type', 'App\\Models\\Machine')
                    ->where('section_activatables.section', 'PLANVISU')
                    ->where('section_activatables.is_active', 1);
            })->where('prod_order_pos.item_id', $itemId)
            ->whereBetween('prod_order_pos_operations.end', [$startOfWeek, $endOfWeek])
            ->whereNotIn('prod_order_pos_operations.status', ['CLOSED', 'DELETED'])
            ->groupBy('prod_order_pos_operations.id', 'prod_order_pos_operations.status', 'prod_order_pos_operations.end')
            ->get();


        return response()->json($query);
    }
}

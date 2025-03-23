<?php

namespace App\Http\Controllers;

use App\Enums\ProdOrderPosOperationStatus;
use App\Models\BacklogItem;
use App\Models\BacklogItemWeek;
use App\Models\CallOff;
use App\Models\Item;
use App\Models\ProdOrderPos;
use App\Models\SimCallOff;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BacklogCalculationController implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private ?array $item_ids;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(?array $item_ids = null)
    {
        $this->item_ids = $item_ids;
    }

    public function handle()
    {
        //Create BacklogItems that are not yet there
        //Deleted items automatically delete through cascading the related backlogitems and weeks
        $items = Item::doesntHave('backlogItem')
            ->get();

        $backlog_items = collect();
        foreach ($items as $item) {
            $backlog_item = new BacklogItem();
            $backlog_item->item_id = $item->id;
            $backlog_item->qty_stock = 0;
            $backlog_item->qty_call_off = 0;
            $backlog_item->qty_backlog = 0;

            $backlog_items->add($backlog_item);
        }

        // Chunk size: Set to 1000 for better performance
        $chunkSize = 1000;

        $backlog_items->chunk($chunkSize)->each(function ($chunk) {
            BacklogItem::insert($chunk->toArray());
        });

        if ($this->item_ids) {

            $backlog_items = BacklogItem::with('item')->whereIn('item_id', $this->item_ids)->get();
            foreach ($backlog_items as $backlog_item) {
                //Delete weeks for this item
                BacklogItemWeek::where('backlog_item_id', $backlog_item->id)
                    ->delete();
            }
        } else {
            $backlog_items = BacklogItem::with('item')->get();
            //Delete weeks for all items
            BacklogItemWeek::truncate();
        }

        //Define start and end of backlog calculation
        $start_date = Date::today()->addDays(-Date::today()->dayOfWeek + 1);
        $end_date = $start_date->copy()->addWeeks(11);

        $counter = 0;

        $backlogs = DB::table('call_offs')
            ->select(DB::raw('sum(call_offs.quantity * item_bom_children.qty_child_for_one_parent) as quantity, item_bom_children.child_item_id as item_id'))
            ->join('item_bom_children', 'item_bom_children.item_id', 'call_offs.item_id')
            ->whereRaw('DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY) < ?', [$start_date->toDateString()])
            ->groupBy('item_bom_children.child_item_id')
            ->get();

        $backlog_values = collect();
        foreach ($backlogs as $backlog) {
            $backlog_values[$backlog->item_id] = $backlog->quantity;
        }

        # START::Stock Wise Item Qty
        $stockWiseItemQty = DB::table('stocks')
                                ->join('item_plants', function ($join) {
                                    $join->on('stocks.stockable_id', '=', 'item_plants.id')
                                        ->where('stocks.stockable_type', '=', 'App\Models\ItemPlant');
                                })
                                ->select('item_plants.item_id', DB::raw('SUM(stocks.quantity) as total_quantity'))
                                ->groupBy('item_plants.item_id')
                                ->get();
        # END::Stock Wise Item Qty

        $backlog_item_weeks_array = array();
        //Calculate weekly values
        foreach ($backlog_items as $backlog_item) {
            $counter++;

            if ($counter % 100 == 0) {
                $backlog_item_weeks = collect();

                foreach ($backlog_item_weeks_array as $backlog_item_array) {
                    foreach ($backlog_item_array as $year_array) {
                        foreach ($year_array as $week_array) {
                            $backlog_item_weeks->add($week_array);
                        }
                    }
                }

                try {
                    BacklogItemWeek::insert($backlog_item_weeks->toArray());
                    $backlog_item_weeks_array = array();
                } catch (Exception $e) {
                    Log::error($e);
                }
            }

            //Initialize weeks with zero values
            for ($date = $start_date->copy(); $date <= $end_date; $date->addWeek()) {
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek] = [
                    'backlog_item_id' => $backlog_item->id,
                    'year' => $date->weekYear,
                    'week' => $date->isoWeek,
                    'qty_prod_order' => 0,
                    'qty_call_off' => 0,
                    'qty_stock' => 0,
                    'qty_backlog' => 0,
                    'qty_call_off_sim' => 0,
                    'qty_stock_sim' => 0,
                    'qty_backlog_sim' => 0,
                ];
            }

            $backlog_item->qty_call_off = $backlog_values->has($backlog_item->item_id) ? $backlog_values[$backlog_item->item_id] : 0;
            if ($backlog_item->item->use_stock_for_backlog) {
                $stock = $backlog_item->item->stocks->sum('quantity');
            } else {
                $stock = 0;
            }

            foreach ($backlog_item->item->itemBomParents as $itemBomParent) {
                $stock += $itemBomParent->item->stocks->sum('quantity');

                //Consider started Parent Operation Quantitites already as Stock in order to avoid missing WIP
                $stock += ProdOrderPos::where('item_id', $itemBomParent->item_id)
                    ->get()
                    ->sum(function ($prodOrderPos) {
                        // Maximum registered_quantity
                        $maxRegisteredQuantity = $prodOrderPos->prodOrderPosOperations()->max('registered_quantity');

                        // LPAD and finding maximum pos
                        $maxPos = $prodOrderPos->prodOrderPosOperations()
                            ->select(DB::raw("LPAD(pos, 5, '0') as padded_pos"), 'registered_quantity')
                            ->orderBy('padded_pos', 'desc')
                            ->first();

                        $operationRegisteredQuantity = $maxPos ? $maxPos->registered_quantity : 0;

                        return $maxRegisteredQuantity - $operationRegisteredQuantity;
                    });
            }

            $stock += $stockWiseItemQty->where('item_id', $backlog_item->item_id)->sum('total_quantity') ?? 0;

            $backlog_item->qty_stock = $stock;

            $backlog_item->qty_backlog = $backlog_item->qty_stock - $backlog_item->qty_call_off;
            $backlog_item->save();

            # Populate orders
            $prod_orders_pos = DB::table('prod_order_pos')
                ->selectRaw('MAX(prod_order_pos_operations.end) AS end, GREATEST(MAX(prod_order_pos.quantity) - COALESCE(MIN(prod_order_pos_operations.registered_quantity), 0), 0) AS quantity')
                ->join('prod_order_pos_operations', 'prod_order_pos_operations.prod_order_pos_id', '=', 'prod_order_pos.id')
                ->join('section_activatables', 'section_activatables.activatable_id', 'prod_order_pos_operations.machine_id')
                ->where('prod_order_pos.item_id', $backlog_item->item->id)
                ->where('prod_order_pos_operations.end', '>=', $start_date->toDateString())
                ->where('prod_order_pos_operations.end', '<', $end_date->toDateString())
                ->whereNotIn('prod_order_pos_operations.status', [ ProdOrderPosOperationStatus::CLOSED(), ProdOrderPosOperationStatus::DELETED() ])
                ->where('section_activatables.activatable_type', 'App\\Models\\Machine')
                ->where('section_activatables.section', 'PLANVISU')
                ->where('section_activatables.is_active', true)
                ->groupBy('prod_order_pos.id')
                ->get();
            
            foreach ($prod_orders_pos as $prod_orders_po) {
                $date = Date::create($prod_orders_po->end);
                $date = $date->subDays($date->dayOfWeek - 1);
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_prod_order'] += $prod_orders_po->quantity;
            }

            //Populate call offs
            $call_offs = CallOff::selectRaw('call_offs.quantity as quantity,
                    DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY) as date,
                    item_bom_children.qty_child_for_one_parent as qty_child_for_one_parent')
                ->join('item_bom_children', 'call_offs.item_id', 'item_bom_children.item_id')
                ->whereRaw(
                    'DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY) >= ? and
                    DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY) <= ? and
                    item_bom_children.child_item_id = ?',
                    [
                        $start_date->subDays($start_date->dayOfWeek - 1)->toDateString(),
                        $end_date->subDays($end_date->dayOfWeek - 1)->toDateString(),
                        $backlog_item->item_id
                    ]
                )
                ->get();

            foreach ($call_offs as $call_off) {
                $date = Date::createFromFormat('Y-m-d', $call_off->date);
                $date = $date->subDays($date->dayOfWeek - 1);
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off'] += ($call_off->quantity * $call_off->qty_child_for_one_parent);
            }

            //Populate simulation call offs
            $sim_call_offs = SimCallOff::selectRaw('sim_call_offs.quantity as quantity,
                    DATE_SUB(sim_call_offs.date_monday, INTERVAL item_bom_children.lead_time_days DAY) as date,
                    item_bom_children.qty_child_for_one_parent as qty_child_for_one_parent')
                ->join('item_bom_children', 'sim_call_offs.item_id', 'item_bom_children.item_id')
                ->whereRaw(
                    'DATE_SUB(sim_call_offs.date_monday, INTERVAL item_bom_children.lead_time_days DAY) >= ? and
                    DATE_SUB(sim_call_offs.date_monday, INTERVAL item_bom_children.lead_time_days DAY) <= ? and
                    item_bom_children.child_item_id = ? and sim_call_offs.call_off_simulation_id = 1',
                    //                    TODO: Fix hardcoded simulation
                    [
                        $start_date->subDays($start_date->dayOfWeek - 1)->toDateString(),
                        $end_date->subDays($end_date->dayOfWeek - 1)->toDateString(),
                        $backlog_item->item_id
                    ]
                )
                ->get();

            foreach ($sim_call_offs as $sim_call_off) {
                $date = Date::createFromFormat('Y-m-d', $sim_call_off->date);
                $date = $date->subDays($date->dayOfWeek - 1);
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off_sim'] += ($sim_call_off->quantity * $sim_call_off->qty_child_for_one_parent);
            }

            $last_backlog = $backlog_item->qty_backlog;

            //Simulations do not start with backlog but only with stock (that is not needed for backlog)
            $last_backlog_sim = max($backlog_item->qty_backlog, 0);

            for ($date = $start_date->copy(); $date <= $end_date; $date->addWeek()) {
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_stock'] = $last_backlog;
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_stock_sim'] = $last_backlog_sim;

                $last_backlog = $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_stock']
                    + $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_prod_order']
                    - $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off'];

                $last_backlog_sim = $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_stock_sim']
                    + $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_prod_order']
                    - $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off_sim'];

                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_backlog'] = $last_backlog;
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_backlog_sim'] = $last_backlog_sim;
            }
        }

        //Insert last records (less then 100)
        $backlog_item_weeks = collect();
        foreach ($backlog_item_weeks_array as $backlog_item_array) {
            foreach ($backlog_item_array as $year_array) {
                foreach ($year_array as $week_array) {
                    $backlog_item_weeks->add($week_array);
                }
            }
        }

        try {
            BacklogItemWeek::insert($backlog_item_weeks->toArray());
            Log::info('BacklogItemWeek Success');
        } catch (Exception $e) {
            Log::error('BacklogItemWeek => ' . $e);
        }



        $critical_weeks = BacklogItemWeek::select('backlog_item_id')->groupBy('backlog_item_id')
            //TODO: Fix for 2 weeks changing year
            ->where('week', '<', now()->isoWeek + 12)
            ->where('qty_backlog', '<', 0)->get();
        $critical_backlog_item_ids = $critical_weeks->map(function ($item_week) {
            return $item_week->backlog_item_id;
        });

        BacklogItem::whereIn('id', $critical_backlog_item_ids)->update(['is_critical' => true]);
        BacklogItem::whereNotIn('id', $critical_backlog_item_ids)->update(['is_critical' => false]);

        $critical_weeks_sim = BacklogItemWeek::select('backlog_item_id')->groupBy('backlog_item_id')
            //TODO: Fix for 2 weeks changing year
            ->where('week', '<', now()->isoWeek + 2)
            ->where('qty_backlog_sim', '<', 0)->get();
        $critical_backlog_item_ids_sim = $critical_weeks_sim->map(function ($item_week) {
            return $item_week->backlog_item_id;
        });

        BacklogItem::whereIn('id', $critical_backlog_item_ids_sim)->update(['is_critical_sim' => true]);
        BacklogItem::whereNotIn('id', $critical_backlog_item_ids_sim)->update(['is_critical_sim' => false]);
    }
}

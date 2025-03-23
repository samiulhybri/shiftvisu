<?php

namespace App\Jobs;

use Exception;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\BacklogItem;
use App\Models\BacklogItemWeek;
use App\Models\CallOff;
use App\Models\Item;
use App\Models\SimCallOff;
use Illuminate\Support\Facades\Date;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BacklogCalculation implements ShouldQueue
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
        /**
         * Create BacklogItems that are not yet there
         * Deleted items automatically delete through cascading the related backlogitems and weeks
         */
        $items = Item::doesntHave('backlogItem')->get();

        $backlog_items = collect();
        foreach ($items as $item) {
            $backlog_item = new BacklogItem();
            $backlog_item->item_id = $item->id;
            $backlog_item->qty_stock = 0;
            $backlog_item->qty_call_off = 0;
            $backlog_item->qty_backlog = 0;

            $backlog_items->add($backlog_item);
        }

        # Chunk size: Set to 1000 for better performance
        $chunkSize = 1000;

        $backlog_items->chunk($chunkSize)->each(function ($chunk) {
            BacklogItem::insert($chunk->toArray());
        });

        if ($this->item_ids) {
            $backlog_items = BacklogItem::with('item')->whereIn('item_id', $this->item_ids)->get();
            foreach ($backlog_items as $backlog_item) {
                # Delete weeks for this item
                BacklogItemWeek::where('backlog_item_id', $backlog_item->id)->delete();
            }
        } else {
            $backlog_items = BacklogItem::with('item')->get();
            # Delete weeks for all items
            BacklogItemWeek::truncate();
        }

        # Define start and end of backlog calculation
        $start_date = Date::today()->addDays(-Date::today()->dayOfWeek + 1);
        $end_date = $start_date->copy()->addWeeks(11);

        $counter = 0;

        $backlogs = DB::table('call_offs')
            ->select(DB::raw('SUM(quantity) as quantity, item_id'))
            ->where('date', '<', $start_date->toDateString())
            ->groupBy('item_id')
            ->get();

        $backlog_values = collect();
        foreach ($backlogs as $backlog) {
            $backlog_values[$backlog->item_id] = $backlog->quantity;
        }

        # Stock Wise Item Qty
        $stockWiseItemQty = DB::table('stocks')
            ->join('item_plants', function ($join) {
                $join->on('stocks.stockable_id', '=', 'item_plants.id')
                    ->where('stocks.stockable_type', '=', 'App\Models\ItemPlant');
            })
            ->select('item_plants.item_id', DB::raw('SUM(stocks.quantity) as total_quantity'))
            ->groupBy('item_plants.item_id')
            ->get();

        $backlog_item_weeks_array = array();

        # Calculate weekly values
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

            # Initialize weeks with zero values
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

            $stock += $stockWiseItemQty->where('item_id', $backlog_item->item_id)->sum('total_quantity') ?? 0;

            $backlog_item->qty_stock = $stock;
            $backlog_item->qty_backlog = $backlog_item->qty_stock - $backlog_item->qty_call_off;

            # Calculate plan quantities
            $yearFirstWeekDate = $this->getFirstDateOfFirstISOWeekOfCurrentYear();

            $totalQuantity = $backlog_item->item->prodOrderPos()
                            ->selectRaw('MAX(prod_order_pos_operations.end) AS end, GREATEST(MAX(prod_order_pos.quantity) - COALESCE(MIN(prod_order_pos_operations.registered_quantity), 0), 0) AS quantity')
                            ->join('prod_order_pos_operations', 'prod_order_pos_operations.prod_order_pos_id', '=', 'prod_order_pos.id')
                            ->join('section_activatables', 'section_activatables.activatable_id', 'prod_order_pos_operations.machine_id')
                            ->where('prod_order_pos_operations.end', '>=', $yearFirstWeekDate->toDateString())
                            ->where('prod_order_pos_operations.end', '<', $start_date->toDateString())
                            ->whereNotIn('prod_order_pos_operations.status', [ProdOrderPosOperationStatus::CLOSED(), ProdOrderPosOperationStatus::DELETED()])
                            ->where('section_activatables.activatable_type', 'App\\Models\\Machine')
                            ->where('section_activatables.section', 'PLANVISU')
                            ->where('section_activatables.is_active', true)
                            ->groupBy('prod_order_pos.id')
                            ->get()
                            ->sum('quantity');
            
            $backlog_item->qty_prod_order = $totalQuantity ?? 0;

            $backlog_item->save();

            # Populate orders
            $prod_orders_pos = DB::table('prod_order_pos')
                ->selectRaw('MAX(prod_order_pos_operations.end) AS end, GREATEST(MAX(prod_order_pos.quantity) - COALESCE(MIN(prod_order_pos_operations.registered_quantity), 0), 0) AS quantity')
                ->join('prod_order_pos_operations', 'prod_order_pos_operations.prod_order_pos_id', '=', 'prod_order_pos.id')
                ->join('section_activatables', 'section_activatables.activatable_id', 'prod_order_pos_operations.machine_id')
                ->where('prod_order_pos.item_id', $backlog_item->item->id)
                ->where('prod_order_pos_operations.end', '>=', $start_date->toDateString())
                ->where('prod_order_pos_operations.end', '<', $end_date->toDateString())
                ->whereNotIn('prod_order_pos_operations.status', [ProdOrderPosOperationStatus::CLOSED(), ProdOrderPosOperationStatus::DELETED()])
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

            # Populate call offs
            $call_offs = CallOff::selectRaw('call_offs.quantity as quantity, call_offs.date as date')
                ->whereRaw(
                    'call_offs.date >= ? 
                    AND call_offs.date <= ? 
                    AND call_offs.item_id = ?',
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
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off'] += $call_off->quantity ?? 0;
            }

            # Populate simulation call offs
            $sim_call_offs = SimCallOff::selectRaw('sim_call_offs.quantity as quantity, sim_call_offs.date_monday as date')
            ->whereRaw(
                'sim_call_offs.date_monday >= ? 
                AND sim_call_offs.date_monday <= ? 
                AND sim_call_offs.item_id = ?
                AND sim_call_offs.call_off_simulation_id = 1',
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
                $backlog_item_weeks_array[$backlog_item->id][$date->weekYear][$date->isoWeek]['qty_call_off_sim'] += $sim_call_off->quantity ?? 0;
            }

            $last_backlog = $backlog_item->qty_backlog;

            # Simulations do not start with backlog but only with stock (that is not needed for backlog)
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

        # Insert last records (less then 100)
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
            ->where('week', '<', now()->isoWeek + 12)
            ->where('qty_backlog', '<', 0)->get();
        $critical_backlog_item_ids = $critical_weeks->map(function ($item_week) {
            return $item_week->backlog_item_id;
        });

        BacklogItem::whereIn('id', $critical_backlog_item_ids)->update(['is_critical' => true]);
        BacklogItem::whereNotIn('id', $critical_backlog_item_ids)->update(['is_critical' => false]);

        $critical_weeks_sim = BacklogItemWeek::select('backlog_item_id')->groupBy('backlog_item_id')
            ->where('week', '<', now()->isoWeek + 2)
            ->where('qty_backlog_sim', '<', 0)->get();
        $critical_backlog_item_ids_sim = $critical_weeks_sim->map(function ($item_week) {
            return $item_week->backlog_item_id;
        });

        BacklogItem::whereIn('id', $critical_backlog_item_ids_sim)->update(['is_critical_sim' => true]);
        BacklogItem::whereNotIn('id', $critical_backlog_item_ids_sim)->update(['is_critical_sim' => false]);
    }

    /**
     * Get the first date of the first ISO week of the current year
     */
    private function getFirstDateOfFirstISOWeekOfCurrentYear($year = null)
    {
        # If no year is provided, use the current year
        $year = $year ?? Carbon::now()->year;

        # Get the first day of the specified year
        $firstDayOfYear = Carbon::createFromDate($year, 1, 1)->startOfYear();

        # Get the first day of the first ISO week for the specified year
        $firstIsoWeekDate = $firstDayOfYear->startOfWeek(Carbon::MONDAY);

        # If the first ISO week date is in the previous year, move to the next Monday
        if ($firstIsoWeekDate->year < $year) {
            $firstIsoWeekDate = $firstIsoWeekDate->addWeek();
        }

        return $firstIsoWeekDate; // Return the date in YYYY-MM-DD format
    }
}

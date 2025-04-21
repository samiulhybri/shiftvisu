<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Spatie\SimpleExcel\SimpleExcelWriter;

class SerialReportController extends Controller
{
    /**
     * @throws Exception
     */
    public function getSerialReport(Plant $plant, Request $request)
    {
        if ($request->has('locale')) {
            App::setLocale($request->get('locale'));
        }

        $start = $request->get('start', now()->subWeek());
        $end = $request->get('end', now());

        $results = DB::table('prod_orders')
            ->select([
                'prod_orders.custom_id',
                'prod_order_pos_operations.pos',
                'items_pos.custom_id as item_id_custom',
                'prod_order_pos_operation_quantities.serial',
                'items_consumptions.custom_id as component_id_custom',
                'prod_order_pos_operation_consumptions.serial as consumption_serial',
                'prod_order_pos_operation_consumptions.note',
                'prod_order_pos_operation_quantities.confirmed_datetime',
            ])
            ->join('prod_order_pos', 'prod_orders.id', '=', 'prod_order_pos.prod_order_id')
            ->join('prod_order_pos_operations', 'prod_order_pos.id', '=', 'prod_order_pos_operations.prod_order_pos_id')
            ->join('prod_order_pos_operation_quantities', 'prod_order_pos_operations.id', '=', 'prod_order_pos_operation_quantities.prod_order_pos_operation_id')
            ->join('prod_order_pos_operation_consumptions', 'prod_order_pos_operation_quantities.id', '=', 'prod_order_pos_operation_consumptions.prod_order_pos_operation_quantity_id')
            ->join('items as items_pos', 'prod_order_pos.item_id', '=', 'items_pos.id')
            ->join('item_plants', 'prod_order_pos_operation_consumptions.item_plant_id', '=', 'item_plants.id')
            ->join('items as items_consumptions', 'item_plants.item_id', '=', 'items_consumptions.id')
            ->whereNotNull('prod_order_pos_operation_quantities.serial')
            ->where('prod_orders.plant_id', $plant->id)
            ->where(function ($query) {
                $query->whereNotNull('prod_order_pos_operation_consumptions.serial')
                    ->orWhereNotNull('prod_order_pos_operation_consumptions.note');
            })
            ->where('prod_order_pos_operation_quantities.confirmed_datetime', '>=', $start)
            ->where('prod_order_pos_operation_quantities.confirmed_datetime', '<=', $end)
            ->orderByDesc('confirmed_datetime')
            ->orderBy('custom_id')
            ->orderBy('pos')
            ->orderBy('prod_order_pos_operation_quantities.serial')
            ->orderBy('prod_order_pos_operation_consumptions.serial')
            ->orderBy('prod_order_pos_operation_consumptions.note')
            ->get()
            ->map(function ($item) {
                return [
                    'prod_order' => $item->custom_id,
                    'operation_pos' => $item->pos,
                    'item_id_custom' => $item->item_id_custom,
                    'serial' => $item->serial,
                    'component_id_custom' => $item->component_id_custom,
                    'component_serial' => $item->consumption_serial,
                    'component_note' => $item->note,
                    'confirmed_datetime' => $item->confirmed_datetime,
                ];
            });

        if ($results->isNotEmpty()) {
            SimpleExcelWriter::streamDownload('SerialReport.xlsx')
                ->addHeader([
                    __('messages.report_visu.serial_report.prod_order'),
                    __('messages.report_visu.serial_report.operation_pos'),
                    __('messages.report_visu.serial_report.item_id_custom'),
                    __('messages.report_visu.serial_report.serial'),
                    __('messages.report_visu.serial_report.component_id_custom'),
                    __('messages.report_visu.serial_report.component_serial'),
                    __('messages.report_visu.serial_report.component_note'),
                    __('messages.report_visu.serial_report.confirmed_datetime'),
                ])
                ->addRows($results)
                ->toBrowser();
        } else {
            throw new Exception("No results found");
        }
    }
}

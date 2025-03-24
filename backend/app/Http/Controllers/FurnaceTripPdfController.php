<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use App\Models\ProdLot;
use App\Models\ProdOrderPosOperation;
use Barryvdh\DomPDF\Facade\Pdf;

use Illuminate\Support\Facades\App;
use Illuminate\Http\Request;

class FurnaceTripPdfController extends Controller
{
    public function download(Request $request, Hall $hall)
    {
        $operations = $request->query('operations');

        $data = ProdOrderPosOperation::with('machineGroup','prodOrderPos.item','prodOrderPos.calculation.offerPos.material','prodOrderPos.calculation.operationPlan.operationPlanPos.operationPlanPosHeatTreatments','prodOrderPos.calculation.offerPos.offerPosRawDimensions','prodOrderPos.prodOrder','prodLot.machine.machineGroup')->whereIn('id', $operations)->where("prod_lot_id",'!=',null)->orderBy(ProdLot::select('custom_id')->whereColumn('id','prod_order_pos_operations.prod_lot_id'))->get();

        $pdf = PDF::setPaper('a4', 'landscape');
        $pdf->setOptions([
            'isPhpEnabled' => true,
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
            'isFontSubsettingEnabled' => true,
            'setIsTransparent' => true,
            'fontDir' => storage_path('fonts/'),
            'fontCache' => storage_path('fonts/'),
            'defaultFont' => 'Arial',
        ]);
        App::setLocale(config('app.locale'));

        $pdf->loadView('prodOrder.furnace-pdf', ['data' => $data]);


        // return $pdf->stream(); // only for pdf viewing
        return $pdf->download();
    }
}

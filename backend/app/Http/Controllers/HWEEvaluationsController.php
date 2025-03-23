<?php

namespace App\Http\Controllers;

use App\Enums\OfferPosStatus;
use App\Enums\OfferStatus;
use App\Models\Calculation;
use Illuminate\Http\Request;
use Spatie\SimpleExcel\SimpleExcelWriter;

class HWEEvaluationsController extends Controller
{
    public function getEvaluations(Request $request)
    {
        $showArchived = $request->input('is_archived');
        $query = Calculation::with([
            'offerPos' => function ($query) {
                $query->select(['id', 'item_name', 'offer_id', 'pos', 'quantity', 'material_id', 'product_type', 'delivery_state', 'customer_material_number', 'drawing_id', 'outer_diameter_final', 'inner_diameter_final', 'side_a_final', 'side_b_final', 'height_final', 'max_outer_diameter', 'total_length']);
            },
            'offerPos.material' => function ($query) {
                $query->select(['id', 'name']);
            },
            'offerPos.offer' => function ($query) {
                $query->select(['id', 'sales_area_id', 'customer_id','custom_id', 'request_date','status']);
            },
            'offerPos.offer.salesArea' => function ($query) {
                $query->select(['name', 'id', 'custom_id']);
            },
            'offerPos.offer.customer' => function ($query) {
                $query->select(['name', 'id']);
            },
        ])->select(['id', 'offer_pos_id', 'delivery_weight', 'sales_order', 'sales_order_pos']);
        
        if($showArchived=='true'){
            $query = $query->whereRelation('offerPos.offer','status','=',OfferStatus::ARCHIVED());
        }else {
            $query = $query->whereRelation('offerPos.offer', 'status', '!=', OfferStatus::ARCHIVED());
        }

        $query = $query->get();

        return $query;
    }

    public function generateExcel(Request $request)
    {
        $evaluations = $this->getEvaluations($request);

        $evaluations = $evaluations->map(function ($ev) {
            return [
            'Kundenname' => $ev->offerPos?->offer?->customer?->name,
            'Verk.gruppe' => $ev->offerPos?->offer?->salesArea?->name,
            'Anfragedatum' => $ev->offerPos?->offer?->request_date,
            'Angebot Nr.' => $ev->offerPos?->offer?->customer_id,
            'Pos.' => $ev->offerPos?->pos,
            'Bezeichnung'=>$ev->offerPos?->item_name,
            'Stk.' => $ev->offerPos?->quantity,
            'Werkstoffbez.' => $ev->offerPos?->material?->name,
            'Produkttyp' => $ev->offerPos?->product_type,
            'Lieferzustand' => $ev->offerPos?->delivery_state,
            'Kd. Mat. Nr.' => $ev->offerPos?->customer_material_number,
            'Zg. Nr.' => $ev->offerPos?->drawing_id,
            'A.Ø' => $ev->offerPos?->outer_diameter_final,
            'I. Ø' => $ev->offerPos?->inner_diameter_final,
            'Außendurchmesser bis' => $ev->offerPos?->max_outer_diameter,
            'Gesamt Länge' =>$ev->offerPos?->total_length,
            'Seite A' => $ev->offerPos?->side_a_final,
            'Seite B' => $ev->offerPos?->side_b_final,
            'Höhe/Länge' => $ev->offerPos?->height_final,
            'Liefergew./Stk.' => $ev->delivery,
            'SAP-Auftrag' => $ev->sales_order,
            'Kundenauftrag Pos'=>$ev->sales_order_pos
            ];
        });
        SimpleExcelWriter::streamDownload('resources/sample/HWE_Evaluations.xlsx')->addRows($evaluations)->toBrowser();
        // $writter->close();
        // return $writter;
    }
}

<?php

namespace App\Http\Controllers\HWEKalk;

use App\Enums\OfferPosProductType;
use App\Enums\OfferPosStatus;
use App\Http\Controllers\Controller;
use App\Models\OfferPos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Storage;

class OperationPlanController extends Controller
{
    public function exportOperationPlan(Request $request)
    {
        $calculation = $request->calculation_id;
        $operationPlan = $request->operation_plan_id;
        $export = Artisan::call("operation_plan:export $calculation $operationPlan");
        if ($export) {
            OfferPos::where('id', $request->offer_pos_id)->update([
                'status' => OfferPosStatus::HEAT_TREATMENT()
            ]);
            $this->outTextGenerate($request);
            return response()->json(['success' => true], 201);
        } else {
            return response()->json(['success' => false], 500);
        }
    }
    /**
     * Summary of outTextGenerate
     * @param mixed $request
     * @return void
     * generate text file
     */
    protected function outTextGenerate($request)
    {
        $offerPos = OfferPos::where('id', $request->offer_pos_id)
            ->with([
                'calculation:id,offer_pos_id',
                'calculation.prodOrderPos' => function ($quary) {
                    return $quary->select('id', 'calculation_id', 'prod_order_id')->with('prodOrder:id,custom_id');
                },
                'material:id,density,material_group_type,forging_temperature_min,forging_temperature_max,shrinkage,color_type',
                'offerPosRawDimensions'
            ])
            ->select('id', 'material_id','product_type')
            ->first();
          
        if ($offerPos->product_type == OfferPosProductType::RING_CYLINDER()) {
           if($offerPos->calculation?->prodOrderPos?->count()){
            foreach($offerPos->calculation?->prodOrderPos as $key=>$prodOrderPos){
               
                $this->saveOfferPosText($offerPos, "HWE.out", $prodOrderPos->prodOrder->custom_id);
            }
           }else{
                $this->saveOfferPosText($offerPos, "HWE.out", 'TEST');
           }
           
        }
    }

    /**
     * Helper function to generate and save text.
     */
    protected function saveOfferPosText($offerPos, $filename, $customId)
    {
        $text = view('hwe-kalk.out-text', [
            'offerPos' => $offerPos,
            'customId' => $customId,
        ])->render();
        Storage::disk('public')->put("hwe-kalk/out/$filename", $text);
        shell_exec('./hwe_rolltech.sh');

    }
}

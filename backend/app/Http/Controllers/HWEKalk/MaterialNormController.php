<?php

namespace App\Http\Controllers\HWEKalk;

use App\Http\Controllers\Controller;
use App\Models\Norm;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialNormController extends Controller
{
    /**
     * add data to norm_chem_analyses(NormChemAnalysis) pivot table
     * @param Request $request
     * @param $isNew
     */
    public function normsChemAnalyses(Request $request, $isNew): JsonResponse
    {
        try{
            $norm = Norm::find($request->id);
            if ($isNew) $norm->chemAnalyses()->attach($request->relatedId);
            else $norm->chemAnalyses()->sync($request->relatedId);
            $success = true;
        }catch (Exception $e){
            $success = false;
        }
        return response()->json(['success'=> $success]);
    }
}

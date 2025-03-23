<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\MaterialAnalysis;
use App\Models\Norm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialAnalysisController extends Controller
{
    /**
     * add data to norm_chem_analyses(NormChemAnalysis) pivot table
     * @param Request $request
     * @param $isNew
     */
    public function normsChemAnalyses(Request $request, $isNew): JsonResponse
    {
        try{
            $materialAnalysis = MaterialAnalysis::find($request->id);
            if ($isNew) $materialAnalysis->chemAnalyses()->attach($request->relatedId);
            else $materialAnalysis->chemAnalyses()->sync($request->relatedId);
            $success = true;
        }catch (\Exception $e){
            $success = false;
        }
        return response()->json(['success'=> $success]);
    }
}

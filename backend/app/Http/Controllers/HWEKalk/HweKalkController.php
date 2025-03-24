<?php

namespace App\Http\Controllers\HWEKalk;

use App\Http\Controllers\Controller;
use App\Models\Classification;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\HardenabilityRange;
use App\Models\MaterialAnalysis;

class HweKalkController extends Controller
{
    public function getBlockPrice(Request $request)
    {
        $werkstoff = $request->get("WERKSTOFF", "");

        $result = Classification::where('classifications.class', 'HWE_MATERIALSTAMM')
        ->where('classifications.attribute', 'GIESSTYP')
        ->where('classifications.value_string', 'B')
        ->where('classifications.model_type', Item::class)
        ->join('classifications as classifications_werkstoff', function ($join) {
            $join->on('classifications.model_id', '=', 'classifications_werkstoff.model_id')
                ->on('classifications.model_type', '=', 'classifications_werkstoff.model_type')
                ->on('classifications.class', '=', 'classifications_werkstoff.class');
        })
            ->where('classifications_werkstoff.attribute', 'WERKSTOFF')
            ->where('classifications_werkstoff.value_string', $werkstoff)
            ->join('items', 'classifications.model_id', '=', 'items.id')
            ->select(
                DB::raw('SUM(items.price * items.stock) as total_value'),
                DB::raw('SUM(items.stock) as total_stock')
            )
            ->first();

        return ($result->total_value ?? 0) / ($result->total_stock ?? 1);

    }

    public function updateMaterialsForHardenAbilityRange(Request $request)
    {
        $request->validate([
            'hardenability_range_id' => 'required|exists:hardenability_ranges,id',
            'material_ids' => 'required|array',
            'material_ids.*' => 'exists:materials,id',
        ]);

        $hardenabilityRange = HardenabilityRange::findOrFail($request->hardenability_range_id);
        $hardenabilityRange->materials()->sync($request->material_ids);

        return response()->json([
            'message' => 'Materials updated successfully for Hardenability Range.'
        ]);
    }

    public function updateMaterialsForMaterialAnalysis(Request $request)
    {
        $request->validate([
            'material_analysis_id' => 'required|exists:material_analyses,id',
            'material_ids' => 'required|array',
            'material_ids.*' => 'exists:materials,id',
        ]);

        $materialAnalysis = MaterialAnalysis::findOrFail($request->material_analysis_id);
        $materialAnalysis->materials()->sync($request->material_ids);

        return response()->json([
            'message' => 'Materials updated successfully for Material Analysis.'
        ]);
    }
}

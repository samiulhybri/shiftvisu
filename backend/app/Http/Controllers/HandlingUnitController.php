<?php

namespace App\Http\Controllers;

use App\Models\HandlingUnit;
use App\Models\ProdOrderPosOperation;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HandlingUnitController extends Controller
{
    public function printHandlingUnit(ProdOrderPosOperation $operation, HandlingUnit $handlingUnit): JsonResponse
    {
        try {
            $handlingUnit->print($operation);
            return response()->json(['success' => true, 'message' => 'Print successfully!']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }



    // Create a new handling unit
    public static function createHandlingUnit($packaging_instruction_id = null, $item_id_packaging = null)
    {
        return DB::transaction(function () use ($item_id_packaging, $packaging_instruction_id) {
            DB::table('handling_units')->lockForUpdate()->get(); // Prevents concurrent inserts

            do {
                $custom_id = (new IdGeneratorController())->generateId('HandlingUnit');
                $exists = HandlingUnit::query()->where('custom_id', $custom_id)->exists();
            } while ($exists);

            return HandlingUnit::query()->create([
                'custom_id' => $custom_id,
                'item_id' => $item_id_packaging,
                'packaging_instruction_id' => $packaging_instruction_id,
            ]);
        });
    }

}
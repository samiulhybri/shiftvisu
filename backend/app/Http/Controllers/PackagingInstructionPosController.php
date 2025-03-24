<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PackagingInstructionPos;
use App\Models\ProdOrderPosOperation;
use Illuminate\Http\Request;

class PackagingInstructionPosController extends Controller
{
    public function getPackagingInstructionPos(Request $request)
    {
        // Get query parameters for filtering
        $packableType = $request->query('packable_type');
        $packableId = $request->query('packable_id');
        $isContainer = $request->query('is_container', true);
        $searchString = $request->query('search', '');
        $skip = $request->query('$skip');
        $top = $request->query('$top');

        // Validate the input
        if (!$packableType || !$packableId) {
            return response()->json(['error' => 'packable_type and packable_id are required'], 400);
        }

        $query = PackagingInstructionPos::with([
            'packagingInstruction' => function ($query) use ($isContainer) {
                $query->with(['packagingInstructionPos' => function ($subQuery) use ($isContainer) {
                    $subQuery->where('is_container', $isContainer)
                        ->orderBy('created_at', 'desc');
                }]);
            },
        ])
            ->where('packable_type', $packableType)
            ->where('packable_id', $packableId);

        // Add the search functionality on packagingInstruction.custom_id
        if (!empty($searchString)) {
            $query->whereHas('packagingInstruction', function ($q) use ($searchString) {
                $q->where('custom_id', 'like', '%' . $searchString . '%');
            });
        }

        // Apply pagination
        if ($skip) {
            $query = $query->skip($skip);
        }
        if ($top) {
            $query = $query->take($top);
        }

        $results = $query->get()->toArray();
        $data = [];
        foreach ($results as $pos) {
            if ($pos['packable_type'] === Item::class) {
                $pos['item'] = Item::find($pos['packable_id']);
            } else {
                $pos['item'] = null;
            }
            if ($pos['packaging_instruction']) {
                $pos['packagingInstruction'] = $pos['packaging_instruction'];
                $instructionPos = $pos['packagingInstruction']['packaging_instruction_pos'];
                $childData = [];
                foreach ($instructionPos as $childPos) {
                    if ($childPos['packable_type'] === Item::class) {
                        $childPos['item'] = Item::find($childPos['packable_id']);
                    } else {
                        $childPos['item'] = null;
                    }
                    $childData[] = $childPos;
                }
                $pos['packagingInstruction']['packagingInstructionPos'] = $childData;

            }
            unset($pos['packaging_instruction']);
            unset($pos['packagingInstruction']['packaging_instruction_pos']);
            $data[] = $pos;
        }

        return response()->json($data);
    }

    public function getPackagingInstructions(ProdOrderPosOperation $operation)
    {
        return $operation->getPackagingInstructions();
    }


}

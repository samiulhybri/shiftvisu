<?php

namespace App\Http\Controllers;

use App\Enums\ToolRepairStatus;
use App\Enums\ProdOrderPosStatus;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;
use Carbon\Carbon;

class ItemController extends Controller
{
    /**
     * Status of Tool
     * @param mixed $ids -> array of item id
     * @return array -> READY_FOR_USE/ NOT_READY_FOR_USE/ MAINTENANCE_REQUIRED status with respective id
     */
    public function getToolRepairStatuses($ids)
    {
        $results = [];
        if (is_string($ids) || is_array($ids)) {
            $ids = trim(trim($ids, '['), ']');
            $arrId = explode(',', $ids);
            foreach ($arrId as $id) {
                try {
                    $id = trim($id, "'\"");;
                    if (empty($id)) {
                        $results[] = ['tool' => $id, 'status' => 'Invalid ID provided'];
                        continue;
                    }
    
                    $tool = Item::where('is_tool', true)
                        ->where('is_active', true)
                        ->find($id);
                    if (!$tool) {
                        $results[] = ['tool' => $id, 'status' => 'Tool not found or inactive'];
                        continue;
                    }
    
                    $tool_for_sampling = clone $tool;

                    // Load relationships with different conditions
                    $tool->load([
                        'prodOrderPos' => function ($query) {
                            $query->whereNotIn('status_plan', ['CLOSED', 'DELETED']);
                        },
                        'prodOrderPos.prodorder'
                    ]);

                    $tool_for_sampling->load([
                        'prodOrderPos' => function ($query) {
                            $query->whereNotIn('status_plan', ['DELETED']);
                        },
                        'prodOrderPos.prodorder'
                    ]);
                    // Convert to array if needed
                    $tool = $tool->toArray();
                    $tool_for_sampling = $tool_for_sampling->toArray();
                    
                    $prodOrderPos = $tool['prodOrderPos'] ? 
                        array_filter($tool['prodOrderPos'], function ($elem) {
                            return isset($elem['prodorder']) && $elem['prodorder'] !== null;
                        }) : [];
                    $prodOrderPosForSampling = $tool_for_sampling['prodOrderPos'] ? 
                    array_filter($tool_for_sampling['prodOrderPos'], function ($elem) {
                        return isset($elem['prodorder']) && $elem['prodorder'] !== null;
                    }) : [];
                    $samplingStatus = false;
                    foreach($prodOrderPosForSampling as $pos) {
                        if ($pos['is_sampling_required'] == true && $pos['is_sampling_done'] == false) {
                            $samplingStatus = true;
                            break;
                        }
                    }
                    if (sizeof($prodOrderPos) === 0) {
                        $results[] = ['tool' => $id,'sampling_required'=>$samplingStatus, 'status' => ToolRepairStatus::READY_FOR_USE()];
                        continue;
                    }
                    
                    $findNotPossible = false;
                    
                    foreach($prodOrderPos as $pos) {
                        if($pos['is_production_possible'] == null || $pos['is_production_possible'] == false) {
                            $findNotPossible = true;
                            break;
                        }
                    }
                    
                    $results[] = $findNotPossible ? 
                        ['tool' => $id,'sampling_required'=>$samplingStatus, 'status' => ToolRepairStatus::NOT_READY_FOR_USE()] : 
                        ['tool' => $id, 'sampling_required'=>$samplingStatus,  'status' => ToolRepairStatus::MAINTENANCE_REQUIRED()];
                } catch (Exception $e) {
                    $results[] = ['tool' => $id, 'status' => 'Error occurred: ' . $e->getMessage()];
                }
            }
            return $results;
        } elseif (!is_array($ids)) {
            return ['error' => 'Invalid input. Please provide an array of IDs or a single ID.'];
        }
    }
    
    /**
     * Summary of updateRepairProductionDate
     * @param $request
     * @param mixed $id
     * @return void
     */
    public function updateRepairProductionDate(Request $request, $id) {
        try {
            $date = Carbon::parse($request->input('start_date'))->format('Y-m-d H:i:s'); 
            $tool = Item::where('is_tool', true)
                ->where('is_active', true)
                ->find($id);
    
            if($tool) {
                $tool->prodOrderPos()
                    ->whereNotIn('status_plan', [ProdOrderPosStatus::CLOSED(), ProdOrderPosStatus::DELETED()])
                    ->update(['release_date' => $date]);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Repairs production dates updated successfully.',
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tool not found',
                ]);
            }
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error occurred: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Summary of updateCustomersForEachItem
     * @param $request
     * @param mixed $id
    */
    public function updateCustomersForEachItem(Request $request, $id) {
        try {
            $item = Item::find($id);
            if (!$item) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item not found'
                ], 404);
            }

            $validatedData = $request->validate([
                'customers' => 'nullable|array',
                'customers.*' => 'integer|exists:customers,id'
            ]);

            $item->customer()->sync($validatedData['customers']);

            return response()->json([
                'status' => 'success',
                'message' => 'Customers updated successfully',
            ], 200); 
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error occurred: ' . $e->getMessage(),
            ]);
        }
    }
}

<?php

namespace App\Services;

use App\Enums\ProdOrderPosStatus;
use App\Models\Item;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class ItemService 
{
    public function __construct() {}

    public function updateToolsRepairsProdDate(array $toolData) {
        try {
            if (!is_array($toolData) || empty($toolData)) {
                return [
                    'status' => 'error',
                    'message' => 'Invalid or empty tool data provided.',
                ];
            }
    
            $successCount = 0;
            $errors = [];

            foreach ($toolData as $data) {
                $id = $data['tool_id'];
                $plannedDate = $data['start_date'];

                try {
                    $date = Carbon::parse($plannedDate);
                    $tool = Item::where('is_tool', true)
                        ->where('is_active', true)
                        ->find($id);

                    if ($tool) {
                        $tool->prodOrderPos()
                            ->whereNotIn('status_plan', [ProdOrderPosStatus::CLOSED(), ProdOrderPosStatus::DELETED()])
                            ->update(['release_date' => $date->clone(), 'is_prod_date_manual' => 0]);

                        $successCount++;
                    } else {
                        $errors[] = "Tool ID {$id} not found";
                    }
                } catch (Exception $e) {
                    Log::error("Error updating tool ID {$id}: " . $e->getMessage());
                    $errors[] = "Error updating tool ID {$id}: " . $e->getMessage();
                }
            }

            return [
                'status' => $successCount > 0 ? 'success' : 'error',
                'message' => $successCount > 0 ? 'Some or all repairs production dates updated successfully.' : 'Failed to update any tools.',
                'success_count' => $successCount,
                'errors' => $errors,
            ];
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Error occurred: ' . $e->getMessage(),
            ];
        }
    }
}

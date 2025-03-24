<?php

namespace App\Http\Controllers\ShiftVisu;

use App\Http\Controllers\Controller;
use App\Models\ShiftVisu\ShiftVisuIssueType;
use Exception;
use Illuminate\Http\Request;
use DB;

class ShiftVisuController extends Controller
{
    function createIssueType(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'custom_id' => 'required|string',
                'halls' => 'required|array',
                'halls.*' => 'exists:halls,id'
            ]);

            $issueType = ShiftVisuIssueType::create([
                'name' => $validated['name'],
                'custom_id' => $validated['custom_id'],
                'is_active' => true,
            ]);

            $hallIds = $request->halls;
            $issueType->halls()->sync($hallIds);
            return response()->json([
                'message' => 'Issue Type created successfully!'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Save failed.',
                'errors' => $e->getMessage()
            ], 422);
        }
    }

    function updateIssueType(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'string',
                'custom_id' => 'string',
                'halls' => 'array|min:1',
                'halls.*' => 'exists:halls,id'
            ]);

            $issueType = ShiftVisuIssueType::find($id);

            if (!$issueType) {
                return response()->json([
                    'message' => 'Issue Type not found.'
                ], 404);
            }

            $issueType->update($validated);

            if ($request->has('halls')) {
                $hallIds = $request->halls;
                $issueType->halls()->sync($hallIds);
            }

            return response()->json([
                'message' => 'Issue Type updated successfully!'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Update failed.',
                'errors' => $e->getMessage()
            ]);
        }
    }

    function updateComponentModelType(Request $request)
    {
        try {
            DB::beginTransaction();
    
            if (!$request->input('shiftVisuIssueType.id')) {
                return response()->json(['message' => 'Shift visu issue Type id is required.'], 400);
            }
    
            $shiftVisuIssueTypeId = $request->input('shiftVisuIssueType.id');
    
            $shiftVisuIssueType = ShiftVisuIssueType::findOrFail($shiftVisuIssueTypeId);
    
            $components = array_merge(
                $request->input('shiftVisuModelComponents', []),
                $request->input('shiftVisuGeneralComponents', [])
            );
    
            $syncData = [];
            foreach ($components as $component) {
                if (isset($component['id'], $component['is_mandatory'])) {
                    $syncData[$component['id']] = ['is_mandatory' => $component['is_mandatory']];
                }
            }
    
            $shiftVisuIssueType->components()->sync($syncData);
    
            DB::commit();
    
            return response()->json(['message' => 'Data saved successfully.'], 201);
    
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred while saving data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

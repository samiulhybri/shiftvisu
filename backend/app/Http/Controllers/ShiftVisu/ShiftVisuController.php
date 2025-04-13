<?php

namespace App\Http\Controllers\ShiftVisu;

use App\Http\Controllers\Controller;
use App\Models\ShiftVisu\ShiftVisuIssueType;
use App\Models\ShiftVisu\ShiftVisuIssueTypeShiftVisuComponent;
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

    function updateComponentIssueType(Request $request)
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

    public function getShiftVisuIssueTypesData()
    {
        $issueTypes = ShiftVisuIssueType::with([
            'components' => function ($q) {
                $q->select('shift_visu_components.*');
            },
            'halls'
        ])->get();

        $issueTypes->each(function ($issueType) {
            $issueType->components->each(function ($component) {
                $component->is_mandatory = $component->pivot->is_mandatory ?? null;
                unset($component->pivot);
            });
        });

        return response()->json($issueTypes);
    }

    public function getShiftVisuHallList()
    {
        $halls = DB::table('halls')
                ->join('hall_shift_visu_issue_type', 'halls.id', '=', 'hall_shift_visu_issue_type.hall_id')
                ->select('halls.id', 'halls.name')
                ->distinct()
                ->get();

        return response()->json($halls);
    }


    public function getComponents(Request $request)
    {
        $issueTypeId = $request->input('shift_visu_issue_type_id');

        $components = ShiftVisuIssueTypeShiftVisuComponent::with(['component.options'])
            ->where('shift_visu_issue_type_id', $issueTypeId)
            ->get()
            ->pluck('component');
            // ->filter(function ($component) {
            // return strtoupper($component->component_type) !== 'MEASURE';
        //     });

        $grouped = [];

        foreach ($components as $component) {
            $viewIn = strtoupper($component->view_in);
            $componentType = strtoupper($component->component_type);

            $componentData = [
                'name' => $component->name,
                'is_required' => $component->is_required,
                'model_type' => $component->model_type,
                'component_type' => $component->component_type,
                'view_in' => $component->view_in,
                'measure_options' => \json_decode($component->measure_options),
                'option' => $component->options->map(function ($option) {
                return [
                    'shift_visu_component_id' => $option->shift_visu_component_id,
                    'option' => $option->option
                   ];
                })->toArray()
            ];

        if (!isset($grouped[$viewIn])) {
            $grouped[$viewIn] = [
                'view_in' => $viewIn,
                'component_type' => []
            ];
        }

        $found = false;
        foreach ($grouped[$viewIn]['component_type'] as &$typeGroup) {
            if ($typeGroup['type'] === $componentType) {
                $typeGroup['components'][] = $componentData;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $grouped[$viewIn]['component_type'][] = [
                'type' => $componentType,
                'components' => [$componentData],
              ];
            }
        }

        return response()->json(array_values($grouped));
    }
}

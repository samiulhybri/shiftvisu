<?php

namespace App\Http\Controllers\ShiftVisu;

use App\Http\Controllers\Controller;
use App\Models\ShiftVisu\ShiftVisuIssueType;
use App\Models\ShiftVisu\ShiftVisuIssueTypeShiftVisuComponent;
use App\Models\ShiftVisu\ShiftVisuOverviewDetail;
use App\Models\ShiftVisu\ShiftVisuOverviewComponentOption;
use Exception;
use Illuminate\Http\Request;
use DB;
use Carbon\Carbon;

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

        $grouped = [];
        $measureGrouped = [];

        foreach ($components as $component) {
            $viewIn = strtoupper($component->view_in ?? '');
            $componentType = strtoupper($component->component_type ?? '');

            $viewKey = $viewIn !== '' ? $viewIn : 'UNKNOWN';

            $componentData = [
                'id' => $component->id ?? null,
                'name' => $component->name ?? null,
                'is_required' => $component->is_required,
                'is_corrective' => $component->is_corrective,
                'model_type' => $component->model_type,
                'component_type' => $component->component_type,
                'measure_options' => json_decode($component->measure_options, true),
                'options' => $component->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'shift_visu_component_id' => $option->shift_visu_component_id,
                        'option' => $option->option
                    ];
                })->toArray()
            ];

            if ($componentType === 'MEASURE') {
                if (!isset($measureGrouped[$viewKey])) {
                    $measureGrouped[$viewKey] = [
                        'component_types' => []
                    ];
                }

            $found = false;
            foreach ($measureGrouped[$viewKey]['component_types'] as &$typeGroup) {
                if ($typeGroup['type'] === $componentType) {
                    $typeGroup['components'][] = $componentData;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $measureGrouped[$viewKey]['component_types'][] = [
                    'type' => $componentType,
                    'components' => [$componentData],
                ];
            }

            } else {
                if (!isset($grouped[$viewKey])) {
                    $grouped[$viewKey] = [
                        'component_types' => []
                    ];
                }

            $found = false;
            foreach ($grouped[$viewKey]['component_types'] as &$typeGroup) {
                if ($typeGroup['type'] === $componentType) {
                    $typeGroup['components'][] = $componentData;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $grouped[$viewKey]['component_types'][] = [
                    'type' => $componentType,
                    'components' => [$componentData],
                ];
            }
        }
        }

        if (!empty($measureGrouped)) {
            $grouped['MEASURE'] = $measureGrouped;
        }

        return response()->json($grouped);
    }

    public function failureIssueSubmit(Request $request) {
        $failureInfo = $request->input('failure_info');

        if (!isset($failureInfo['hall_id'])) {
            return response()->json(['message' => 'Hall id is required.'], 400);
        }

        if (!isset($failureInfo['creator_id'])) {
            return response()->json(['message' => 'Creator id is required.'], 400);
        }   

        if (!isset($failureInfo['error_id'])) {
            return response()->json(['message' => 'Error id is required.'], 400);
        }

        $detail = new ShiftVisuOverviewDetail();
        $detail->hall_id = $failureInfo['hall_id'];
        $detail->creator_id = $failureInfo['creator_id'];
        $detail->error_id = $failureInfo['error_id'];
        $detail->error_type = $failureInfo['error_type'] ?? null;
        $detail->description = $failureInfo['failure_description'] ?? null;
        $detail->save();

        $componentsByView = $request->input('component_info') ?? [];
        foreach ($componentsByView as $viewIn => $components) {
            foreach ($components as $component) {
            $componentType = $component['component_type'] ?? null;
            $componentId = $component['component_id'] ?? null;

            if (!$componentType || !$componentId) {
                continue;
            }

            $isMulti = in_array($componentType, ['DROPDOWN_MULTI', 'COMBOBOX']);
            $rawValue = $component['value'] ?? null;
            $values = ($isMulti && is_array($rawValue)) ? $rawValue : [$rawValue];

            foreach ($values as $value) {
                $option = new ShiftVisuOverviewComponentOption();
                $option->overview_details_id = $detail->id;
                $option->component_id = $componentId;
                $option->component_type = $componentType;
                $option->view_in = $viewIn;

                if (is_array($value) && isset($value['id'], $value['text'])) {
                    $option->option_id = $value['id'];
                    $value = $value['text'];
                } elseif (!is_array($value)) {
                } else {
                    continue 2;
                }

                switch ($componentType) {
                    case 'SWITCH':
                        $option->option_value_is_checked = $value ?? false;
                        break;
                    case 'TEXTFIELD':
                        $option->option_value = $value ?? null;
                        break;

                    case 'DATETIME':
                    case 'DATE':
                        $formattedDateTime = Carbon::parse($value)->format('Y-m-d H:i:s');
                        $option->option_value_date = $formattedDateTime;

                        break;

                    case 'TEXTAREA':
                        $option->option_value_text = $value ?? null;
                        break;

                    case 'DROPDOWN_SINGLE':
                    case 'DROPDOWN_MULTI':
                    case 'CHECKBOX':
                    case 'RADIO':
                    case 'COMBOBOX':
                        $option->option_value = $value;
                        break;

                    default:
                        continue 2;
                }

                $option->save();
            }
        }
        }
        return response()->json([
                'message' => 'Overview detail saved successfully',
                'data' => $detail
            ], 201);
    }
    
}

<?php

namespace App\Http\Controllers;

use App\Enums\DataExportName;
use App\Models\DataExport;
use App\Models\InspectionOperationCharacteristic;
use App\Models\InspectionPoint;
use App\Models\InspectionPointCharacteristic;
use App\Models\InspectionPointCharacteristicOption;
use App\Models\ProdInspectionOperation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use PDO;

class InspectionPointController extends Controller
{
    public function getInspectionPoints($inspectionOperationId, Request $request)
    {

        $search = $request->query('search', '');
        $perPage = $request->query('perPage', 30);
        $page = $request->query('page', 1);
        $dateSearch = null;
        $timeSearch = null;
        $driver = DB::connection()->getPDO()->getAttribute(PDO::ATTR_DRIVER_NAME);

        if(!empty($search)) {
            try {
                $dateTime = Carbon::parse($search);
                $dateSearch = $dateTime->format('Y-m-d');
                $timeSearch = $dateTime->format('H-i-s');
            } catch(Exception $e) {
                $dateSearch = null;
                $timeSearch = null;
            }
        }

        $inspectionPoints = InspectionPoint::with(['inspectionPointCharacteristics' => function($query) use ($inspectionOperationId) {
                                    $query->whereHas('inspectionOperationCharacteristic', function($q) use($inspectionOperationId) {
                                        $q->where('characteristicable_id', $inspectionOperationId);
                                    })
                                    ->with(['inspectionOperationCharacteristic' => function($q) use ($inspectionOperationId) {
                                        $q->with(['unitOfMeasure', 'inspectionSpecificationImportanceCode'])
                                        ->where('characteristicable_id', $inspectionOperationId);
                                    }, 'inspectionPointCharacteristicOptions' => function($q) {
                                        $q->with('inspectionOperationCharacteristicOption');
                                    },
                                    'lastModifiedBy'
                                ]);
                                }, 'userCreator'])
                                ->where('inspectable_type', ProdInspectionOperation::class)
                                ->where('inspectable_id', $inspectionOperationId)
                                ->when(!empty($search), function ($query) use ($search, $dateSearch, $timeSearch, $driver) {
                                    $query->where(function ($q) use ($search, $dateSearch, $timeSearch, $driver) {
                                        if ($dateSearch) {
                                            $q->orWhere('registered_datetime', 'LIKE', "{$dateSearch}%");
                                        }

                                        if ($timeSearch) {
                                            $q->orWhere('registered_datetime', 'LIKE', "%{$timeSearch}");
                                        }
                                        
                                        $q->orWhereHas('userCreator', function ($subQuery) use ($search, $driver) {
                                            $subQuery->where('name', $driver === 'pgsql' ? 'ILIKE' : 'LIKE', "%{$search}%");
                                        });
                                    });
                                })
                                ->skip(($page - 1) * $perPage)
                                ->take($perPage)
                                ->orderByDesc('id')
                                ->get();

        foreach ($inspectionPoints as $inspectionPoint) {
            $inspectionPoint['is_open'] = !$inspectionPoint->isCompleted();
        }

        $inspectionPoints = collect($inspectionPoints)->sortByDesc('is_open')->values();

        return response()->json($inspectionPoints);
    }

    public function getInspectionPointDetails(ProdInspectionOperation $prodInspectionOperation, InspectionPoint $inspectionPoint)
    {
        $inspectionPoint = $inspectionPoint->load('inspectable', 'inspectionPointCharacteristics.inspectionPointCharacteristicOptions');
        if($inspectionPoint->inspectable instanceof ProdInspectionOperation) {
            $inspectionPoint->inspectable->load('prodOrderPosOperation.machine', 'prodOrderPosOperation.prodOrderPos.item');
        }

        $result = [
            'item' => [
                'id' => $inspectionPoint->inspectable->prodOrderPosOperation->prodOrderPos->item->id,
                'custom_id' => $inspectionPoint->inspectable->prodOrderPosOperation->prodOrderPos->item->custom_id,
                'name' => $inspectionPoint->inspectable->prodOrderPosOperation->prodOrderPos->item->name
            ],
            'prod_order_pos_operation' => [
                'id' => $inspectionPoint->inspectable->prodOrderPosOperation->id,
                'custom_id' => $inspectionPoint->inspectable->prodOrderPosOperation->custom_id,
                'name' => $inspectionPoint->inspectable->prodOrderPosOperation->name,
                'pos' => $inspectionPoint->inspectable->prodOrderPosOperation->pos,
                'cavity' => $inspectionPoint->inspectable->prodOrderPosOperation->cavity
            ],
            'options' => null
        ];

        $inspectionOperationCharacteristics = InspectionOperationCharacteristic::with('inspectionOperationCharacteristicOptions')
                                                ->where('characteristicable_type', ProdInspectionOperation::class)
                                                ->where('characteristicable_id', $prodInspectionOperation->id)
                                                ->with(['unitOfMeasure', 'inspectionSpecificationImportanceCode', 'userGroup'])
                                                ->get();

        $newCharacteritics = [];
        foreach($inspectionOperationCharacteristics as $value) {
            $characteristicsValue = InspectionPointCharacteristic::where("inspection_point_id", $inspectionPoint->id)
                                        ->where('inspection_operation_characteristic_id', $value->id)
                                        ->first();

            if($characteristicsValue) {
                $inspectionPointCharacteristicId = $characteristicsValue->id;
                $characteristicsValue = collect($value)
                    ->put('inserted_value', $characteristicsValue->value ?? null)
                    ->put('inspection_point_characteristic_id', $inspectionPointCharacteristicId)
                    ->put('confirmation_number', $characteristicsValue->confirmation_number ?? null)
                    ->put('field_note', $characteristicsValue->field_note ?? null)
                    ->put('created_user', $characteristicsValue->lastModifiedBy ? $characteristicsValue->lastModifiedBy->only(['id', 'name']) : null);

            }

            // options
            $newOptions = [];
            foreach ($value->inspectionOperationCharacteristicOptions as $option) {
                $isSelected = InspectionPointCharacteristicOption::where('inspection_operation_characteristic_option_id', $option->id)
                                ->where('inspection_point_characteristic_id', $inspectionPointCharacteristicId)
                                ->count() > 0;

                $optionValue = collect($option)->put('is_selected', $isSelected);
                $newOptions[] = $optionValue;

                $characteristicsValue['inspection_operation_characteristic_options'] = $newOptions;

            }
            
            if(!is_null($characteristicsValue)) {
                $newCharacteritics[] = $characteristicsValue;
            }
        }
        
        $result['options'] = $newCharacteritics;
        
        return $result;
    }

    public function updateInspectionPoint(Request $request)
    {
        DB::beginTransaction();

        try {
            foreach ($request->input('inspection_points') as $inspectionPoint) {
                $inspectionPointId = $inspectionPoint['inspection_point_id'];

                foreach ($inspectionPoint['characteristics'] as $characteristic) {
                    $inspectionPointCharacteristic = InspectionPointCharacteristic::where('inspection_point_id', $inspectionPointId)
                                                    ->where('inspection_operation_characteristic_id', $characteristic['inspection_operation_characteristic_id'])
                                                    ->first();

                    if(isset($characteristic['value'])) {
                        $inspectionPointCharacteristic->update(['value' => $characteristic['value']]);
                    } else {
                        $inspectionPointCharacteristic->update(['value' => null]);
                        $inspectionPointCharacteristic->inspectionPointCharacteristicOptions()->delete();

                        foreach ($characteristic['options'] as $option) {
                            $inspectionPointCharacteristic->inspectionPointCharacteristicOptions()->create([
                                'inspection_operation_characteristic_option_id' => $option
                            ]);
                        }
                    }

                    if(isset($characteristic['confirmation_number'])) {
                        $inspectionPointCharacteristic->update(['confirmation_number' => $characteristic['confirmation_number']]);
                    } else {
                        $inspectionPointCharacteristic->update(['confirmation_number' => null]);
                    }

                    if(isset($characteristic['field_note'])) {
                        $inspectionPointCharacteristic->update(['field_note' => $characteristic['field_note']]);
                    } else {
                        $inspectionPointCharacteristic->update(['field_note' => null]);
                    }

                    if (isset($characteristic['user_id'])) {
                        $user = User::find($characteristic['user_id']);
                        $inspectionPointCharacteristic->lastModifiedBy()->associate($user ?? null)->save();
                    } else {
                        $inspectionPointCharacteristic->lastModifiedBy()->dissociate()->save();
                    }

                    $data = InspectionPoint::query()->find($inspectionPointId);

                    if ($data) {
                        $data = $data->getDataExportsObject();
                        $now = now();
                        $dataExport = DataExport::create([
                            'name' => DataExportName::INSPECTION_POINT(),
                            'data' => json_encode($data),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                        (new ExportController())->singleExport($dataExport);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Inspection Point Characteristics updated successfully.'
            ]);
        } catch(Exception $exception) {
            DB::rollBack();

            return response()->json([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public function delete(InspectionPoint $inspectionPoint)
    {
        $response = $inspectionPoint->delete();

        if ($response) {
            return response()->json(['message' => 'Inspection Point deleted successfully.'], 200);
        } else {
            return response()->json(['error' => 'Failed to delete the Inspection Point.'], 500);
        }
    }
}

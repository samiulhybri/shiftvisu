<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Enums\DataExportName;
use App\Models\DataExport;
use App\Contracts\ExportStrategy;
use App\Models\ProdOrderPosOperation;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ADKExportController extends Controller
{
    private ?ExportStrategy $exportStrategy = null;

    public function __construct()
    {
        try {
            $this->exportStrategy = resolve(ExportStrategy::class);
        } catch (\Exception $e) {
            Log::info("No export strategy defined");
        }
    }

    public function exportOperationQuantitiesToERP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ServiceId' => 'required|string',
            'production_action_value' => 'required|integer',
            'machine_id' => 'required|string',
            'production_type' => 'required|string',
            'prod_order_id' => 'required|string',
            'pos' => 'required|string',
            'prod_confimation_number' => 'nullable|string',
            'good_qty' => 'required|numeric',
            'scrap_qty' => 'required|numeric',
            'rework_qty' => 'required|numeric',
            'rework_code' => 'nullable|string',
            'failure_code' => 'nullable|string',
            'fire_code' => 'nullable|string',
            'user_id' => 'required|string',
            'operation_status' => 'required|integer',
            'start_time' => 'nullable|date_format:d.m.Y H:i:s',
            'end_time' => 'nullable|date_format:d.m.Y H:i:s',
        ]);

        if ($validator->fails()) {
            Log::channel('adk_export')->info("===================================================================================================");
            Log::channel('adk_export')->info("VALIDATION ERROR. TIME: " . now());
            Log::channel('adk_export')->info("REQUEST PAYLOAD: " . json_encode($request->all()));
            Log::channel('adk_export')->info("VALIDATION ERROR RESPONSE: " . json_encode($validator->errors()));

            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validator->errors(),
            ], 403);
        }

        $data = $validator->validated();

        $data['pos'] = is_numeric($data['pos']) ? (int)$data['pos'] : $data['pos'];

        // Extract company_id and plant_id from prod_order_id
        $prodOrderParts = explode('-', $data['prod_order_id']);
        if (count($prodOrderParts) < 3) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Invalid prod_order_id format!',
            ], 403);
        }
        $company_id = $prodOrderParts[0]; // companyID
        $plant_id = $prodOrderParts[1];   // plantID
        $slicedOrderID = array_slice($prodOrderParts, 2); // array excluding plantID & companyID

        // Add company_id and plant_id to the validated data
        $data['company_id'] = $company_id;
        $data['plant_id'] = $plant_id;
        $data['prod_order_custom_id'] = $this->cleanIEPrefix(implode('-', $slicedOrderID));

        // Extract and format machine_id if company_id and plant_id are included in the machine_id string
        $machineIdParts = explode('-', $data['machine_id']);
        if (count($machineIdParts) > 2) {
            $slicedMachineID = array_slice($machineIdParts, 2);
            $data['machine_custom_id'] = implode('-', $slicedMachineID);
        } else {
            $data['machine_custom_id'] = $data['machine_id'];
        }

        $prodOrderCustomId = $data['prod_order_id'];
        $machineCustomId = $data['machine_id'];

        $prodOrderPosOperation = ProdOrderPosOperation::where('pos', $data['pos'])
                                ->where('machine_id', function ($query) use ($machineCustomId) {
                                    $query->select('id')
                                        ->from('machines')
                                        ->where('custom_id', $machineCustomId)
                                        ->limit(1); // Limit to 1 to ensure a single value
                                })
                                ->whereHas('prodOrderPos', function ($query) use ($prodOrderCustomId) {
                                    $query->whereHas('prodOrder', function ($query) use ($prodOrderCustomId) {
                                        $query->where('custom_id', $prodOrderCustomId);
                                    });
                                })
                                ->select('prod_order_pos_operations.*')
                                ->first();

        if($prodOrderPosOperation) {
            if(!$data['start_time']) {
                $data['start_time'] = $prodOrderPosOperation->operation_start_date_v10 ? Carbon::parse($prodOrderPosOperation->operation_start_date_v10)->format('d.m.Y H:i:s') : '';
            }
            if(!$data['end_time']) {
               $data['end_time'] = $prodOrderPosOperation->operation_close_date_v10 ? Carbon::parse($prodOrderPosOperation->operation_close_date_v10)->format('d.m.Y H:i:s') : '';
            }
        }

        $quantityToExport = new DataExport([
            "name" => DataExportName::OPERATION_QUANTITIES(),
            "data" => json_encode($data)
        ]);

        $res = $this->exportStrategy?->exportOperationQuantities($quantityToExport);
        return response()->json(["response"=> $res]);
    }

    private function cleanIEPrefix($string) {
        $string = preg_replace('/^(IE)+/', 'IE', $string);
        return $string;
    }
}

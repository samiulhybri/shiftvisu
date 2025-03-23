<?php

namespace App\Http\Controllers;

use App\Enums\ProdOrderPosOperationHandlingUnitType;
use App\Models\Item;
use App\Models\PackagingInstruction;
use App\Models\PackagingInstructionPos;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosOperationHandlingUnit;
use App\Services\ImportFromBTPService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Enums\ItemStateType;
use App\Models\Machine;
use App\Models\ProdOrderPosOperationQuantity;
use DateTime;
use DateInterval;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\MachineProdOrderPosOperationTime;

class MachineProdOrderPosOperationTimesController extends Controller
{

    protected ImportFromBTPService $apiService;
    protected $prodOrderPosOperationController;
    protected $packagingInstructionPosController;

    public function __construct(ImportFromBTPService $apiService, ProdOrderPosOperationController $prodOrderPosOperationController = null, PackagingInstructionPosController $packagingInstructionPosController = null)
    {
        $this->apiService = $apiService;
        $this->prodOrderPosOperationController = $prodOrderPosOperationController;
        $this->packagingInstructionPosController = $packagingInstructionPosController;
    }

    private function getCurlyBracketContent($string)
    {
        if (preg_match('/\{(.+?)}/', $string, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function getMachineProductionQuantityChart($machine_id)
    {
        // Retrieve machine information
        $machine = Machine::find($machine_id);

        if (!$machine) {
            return response()->json(['error' => 'Machine not found'], 404);
        }

        // Set hours interval and status
        $hours = $machine->machine_board_hours;
        $status = ProdOrderPosOperationStatus::IN_PRODUCTION();
        $intervalSpec = "PT{$hours}H";
        $startDate = (new DateTime())->sub(new DateInterval($intervalSpec))->format('Y-m-d H:i:s');

        // Get the current time
        $now = (new DateTime())->format('Y-m-d H:i:s');

        $results = ProdOrderPosOperationQuantity::with([
            'itemState',
            'prodOrderPosOperation:id,te',
            'prodOrderPosOperation.prodOrderPosOperationTimes' => function ($query) use ($status) {
                $query->whereNull('end')->whereIn('status', [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::IN_SETUP(), ProdOrderPosOperationStatus::IN_TEARDOWN()]);
            }
        ])
            ->where('machine_id', $machine_id)
            ->where('confirmed_datetime', '>', $startDate)
            ->where('confirmed_datetime', '<=', $now)
            ->orderBy('confirmed_datetime')
            ->get();

        $filteredResults = $results->filter(function ($item) {
            return $item->prodOrderPosOperation->prodOrderPosOperationTimes->isNotEmpty();
        });

        // Initialize hourly data array
        $hourlyData = [];
        $calculatedOperationIds = collect([]);

        // Initialize total TE variable
        $totalTE = 0;

        // Iterate through results to populate hourly data and calculate total TE
        foreach ($filteredResults as $entry) {
            $hour = (new DateTime($entry->confirmed_datetime))->format('H:00');

            if (!isset($hourlyData[$hour])) {
                $hourlyData[$hour] = ['good' => 0, 'scrap' => 0, 'rework' => 0];
            }

            $itemState = $entry->itemState->item_state_type;
            switch ($itemState) {
                case ItemStateType::SCRAP():
                    $hourlyData[$hour]['scrap'] += intval($entry->quantity);
                    break;
                case ItemStateType::GOOD():
                    $hourlyData[$hour]['good'] += intval($entry->quantity);
                    break;
                default:
                    $hourlyData[$hour]['rework'] += intval($entry->quantity);
                    break;
            }

            // Check if te is 0, null, or undefined, and set a default value of 1 if any of these conditions are met
            $te = (isset($entry->prodOrderPosOperation->te) && $entry->prodOrderPosOperation->te != 0) ? $entry->prodOrderPosOperation->te : 1;

            if ($entry->prodOrderPosOperation && !$calculatedOperationIds->contains($entry->prodOrderPosOperation->id)) {
                // Accumulate total TE
                $totalTE += 3600 / $te;

                // Push the current operation ID into the calculatedOperationId
                $calculatedOperationIds->push($entry->prodOrderPosOperation->id);
            }
        }

        // Prepare values array
        $values = [];
        foreach ($hourlyData as $hour => $data) {
            $values[] = [
                'name' => $hour,
                'good' => $data['good'],
                'scrap' => $data['scrap'],
                'rework' => $data['rework'],
            ];
        }

        // Construct final response
        $response = [
            'machineBoardHours' => $machine->machine_board_hours,
            'target' => $totalTE,
            'values' => $values,
        ];

        // Return the final object as JSON response
        return response()->json($response);
    }

    function setNextPackaging(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'machine_id' => 'required|integer',
                'prod_order_pos_operation_id' => 'required|integer',
                'packaging_instruction_id' => 'nullable|integer',
                'item_id' => 'nullable|integer',
                'packaging_instruction_id_parent' => 'nullable|integer',
                'item_id_parent' => 'nullable|integer',
                'isLinkedOrder' => 'nullable|integer',
                'targetQuantity' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            $machineId = $validatedData['machine_id'];
            $prodOrderPosOperationId = $validatedData['prod_order_pos_operation_id'];
            $isRemoved = $request->query('isRemove', false);

            $processedData = [];
            $canBeSave = true;

            if (!$validatedData['isLinkedOrder']) {
                $this->setNextPackagingForOperation($machineId, $prodOrderPosOperationId, $validatedData);

                return response()->json([
                    'message' => 'Next Packaging created successfully.',
                ], 201);
            } else {
                $operationIds = ProdOrderPosOperation::where('prod_lot_id', $validatedData['isLinkedOrder'])->get()->pluck('id');

                foreach ($operationIds as $operationId) {
                    if ($operationId == $validatedData['prod_order_pos_operation_id'] || $isRemoved || !$validatedData['packaging_instruction_id']) {
                        $validatedData['operationId'] = $operationId;
                        $processedData[] = $validatedData;

                        continue;
                    } else {
                        $packagingInstructions= ProdOrderPosOperation::findOrFail($operationId)->getPackagingInstructions();

                        if(count($packagingInstructions) > 0){
                            $instruction = collect($packagingInstructions)
                                ->where('target_quantity', $validatedData['targetQuantity'])
                                ->where('item_id_container_parent', $validatedData['item_id_parent'])
                                ->where('item_id_container_child', $validatedData['item_id'])->first();

                            if($instruction){
                                $pos = [];
                                $pos['operationId'] = $operationId;
                                $pos['packaging_instruction_id'] = $instruction['packaging_instruction_id_child'];
                                $pos['item_id'] = $instruction['item_id_container_child'];
                                $pos['packaging_instruction_id_parent'] = $instruction['packaging_instruction_id_parent'];
                                $pos['item_id_parent'] = $instruction['item_id_container_parent'];

                                $processedData[] = $pos;
                            } else {
                                $canBeSave = false;
                            }
                        } else {
                            $canBeSave = false;
                        }
                    }
                }

                if ($canBeSave) {
                    foreach ($processedData as $data) {
                        $this->setNextPackagingForOperation($machineId, $data['operationId'], $data);
                    }

                    return response()->json([
                        'message' => 'Next Packaging created successfully.',
                    ], 201);
                } else {
                    return response()->json([
                        'message' => 'Next Packaging is not found for all operations.',
                    ], 403);
                }
            }
        } catch (\Throwable $th) {
            return response()->json([
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    function setNextPackagingForOperation($machineId, $prodOrderPosOperationId, $validatedData)
    {
        // Query for an existing record with `end` as null
        $machineProdOrderOperationTime = MachineProdOrderPosOperationTime::whereNull('end')
            ->where('machine_id', $machineId)
            ->where('prod_order_pos_operation_id', $prodOrderPosOperationId)
            ->first();

        if ($machineProdOrderOperationTime) {
            $machineProdOrderOperationTime->update([
                'end' => Carbon::now()
            ]);
        }

        $newMachineProdOrderOperationTime = MachineProdOrderPosOperationTime::create([
            'machine_id' => $machineId,
            'prod_order_pos_operation_id' => $prodOrderPosOperationId,
            'packaging_instruction_id' => $validatedData['packaging_instruction_id'],
            'item_id_packaging' => $validatedData['item_id'],
            'start' => now(),
            'packaging_instruction_id_parent' => $validatedData['packaging_instruction_id_parent'],
            'item_id_packaging_parent' => $validatedData['item_id_parent'],
            'status' => $machineProdOrderOperationTime ? $machineProdOrderOperationTime->status : null
        ]);

        $machine = Machine::findOrFail($machineId);

        if ($validatedData['packaging_instruction_id']) {
            $prodItemId = ProdOrderPosOperation::find($prodOrderPosOperationId)->prodOrderPos->item_id ?? null;

            $packagingInstructionPos = PackagingInstructionPos::where('packaging_instruction_id', $validatedData['packaging_instruction_id'])
                ->where('is_container', false)
                ->where('packable_type', Item::class)
                ->where('packable_id', $prodItemId)
                ->select('target_quantity')
                ->first();
        }

        if ($machine->host_iot_gateway) {
            try {
                $destination = $this->getCurlyBracketContent($machine->host_iot_gateway ?? '');
                $url = "api/machine/{$machineId}/{$prodOrderPosOperationId}/packaging-changed";
                $body = [
                    'target_quantity' => $packagingInstructionPos->target_quantity ?? 0,
                    //TODO: add remaining quantity
                ];

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST', $body);
                else
                    $response = Http::post("{$machine->host_iot_gateway}{$url}", $body);

                if ($response->failed())
                    return response()->json([
                        'success' => false,
                        'message' => 'Machine did not accept packaging change',
                    ], 500);
            } catch (Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to change packaging for machine ID {$machine->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'New entry created successfully.',
            'data' => $newMachineProdOrderOperationTime
        ], 201);
    }

    function remainingQuantityForPackaging($machineId, ProdOrderPosOperation $operation)
    {
        try {
            $packagingId = MachineProdOrderPosOperationTime::where('prod_order_pos_operation_id', $operation->id)->whereNull('end')->first()?->packaging_instruction_id;

            // If no packaging ID, return 0 values immediately
            if (!$packagingId) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        //Changed for FNA: if no packaging instruction still show operation total remaining quantity in quantity popup
                        'quantityPerHU' => $operation->remainingQuantity(),
                        'quantityInHU' => 0,
                    ]
                ]);
            }

            $quantityPerHU = PackagingInstructionPos::where('packaging_instruction_id', $packagingId)
                ->where('is_container', false)->where('packable_id', $operation?->prodOrderPos?->item_id)
                ->where('packable_type', Item::class)->first()?->target_quantity;

            $handlingUnit = ProdOrderPosOperationHandlingUnit::with(['handlingUnit.childStocks'])->where('prod_order_pos_operation_id', $operation->id)->where('machine_id', $machineId)->where('type', ProdOrderPosOperationHandlingUnitType::PROD_GOOD())->first();
            $quantityInHU = $handlingUnit?->handlingUnit?->getCurrentWipAndItemPlant();

            return response()->json([
                'success' => true,
                'data' => [
                    'quantityPerHU' => $quantityPerHU,
                    'quantityInHU' => $quantityInHU,
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    function getNextPackagingInstructions(ProdOrderPosOperation $operation)
    {
        $packagingInstructions = $operation->getPackagingInstructions();

        return $packagingInstructions;
    }
}

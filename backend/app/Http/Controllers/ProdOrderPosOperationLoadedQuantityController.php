<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Machine;
use App\Enums\MachineCycleType;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosOperationLoadedQuantity;
use App\Models\ProdOrderPosOperationUnloadedQuantity;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ProdOrderPosOperationLoadedQuantityController extends Controller
{
    protected MachineCycleController $machineCycleController;

    public function __construct(MachineCycleController $machineCycleController)
    {
        $this->machineCycleController = $machineCycleController;
    }

    public function saveLoadedQuantity(Request $request) {
        $validator = Validator::make($request->all(), [
            'prod_order_pos_operation_id' => 'required|exists:prod_order_pos_operations,id',
            'machine_id' => 'required|exists:machines,id',
            'quantity' => 'required|numeric|min:1',
            'is_unloaded' => 'nullable|boolean',
        ]);

        $validatedData = $validator->validated();
        $userId = Auth::id();

        try {
            // Create the record
            $loadedQuantity = ProdOrderPosOperationLoadedQuantity::create([
                'prod_order_pos_operation_id' => $validatedData['prod_order_pos_operation_id'],
                'machine_id' => $validatedData['machine_id'],
                'quantity' => $validatedData['quantity'] ?? 0,
                'date' => Carbon::now(),
                'user_id' => $userId,
                'is_unloaded' => $validatedData['is_unloaded'] ?? false
            ]);
            return response()->json($loadedQuantity, 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the loaded quantity',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the loaded flag of a loaded quantity record
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Machine  $machine
     * @param  \App\Models\ProdOrderPosOperation  $operation
     * @return \Illuminate\Http\Response
     */
    public function updateLoadedFlag(Request $request, Machine $machine, ProdOrderPosOperation $operation) {
        $validator = Validator::make($request->all(), [
            'prod_order_pos_operation_loaded_quantity_id' => 'required|exists:prod_order_pos_operation_loaded_quantities,id',
            'is_unloaded' => 'required|boolean',
            ]);
        $validatedData = $validator->validated();
        try {
            $loadedQuantity = ProdOrderPosOperationLoadedQuantity::findOrFail($validatedData['prod_order_pos_operation_loaded_quantity_id']);
            $loadedQuantity->is_unloaded = $validatedData['is_unloaded'];
            $loadedQuantity->save();
            return response()->json($loadedQuantity, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the loaded quantity',
                'error'=> $e->getMessage(),
            ], 500);
        }
    }

    public function getMachineAndOperationSpecificLoadedQuantity(Machine $machine, ProdOrderPosOperation $operation)
    {
        $loadedQuantities = ProdOrderPosOperationLoadedQuantity::where('machine_id', $machine->id)
                            ->where('prod_order_pos_operation_id', $operation->id)
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json($loadedQuantities);
    }

    public function getMachineSpecificUnloadingQuantity(Machine $machine)
    {
        $record = ProdOrderPosOperationLoadedQuantity::with(['prodOrderPosOperation.prodOrderPos.prodOrder', 'prodOrderPosOperation.prodOrderPos.item'])
                  ->where('machine_id', $machine->id)
                  ->where('is_unloaded', false)
                  ->orderBy('date', 'asc')
                  ->first();

        $loadedQuantities = [];
        if($record) {
            $loadedQuantities = ProdOrderPosOperationLoadedQuantity::where('machine_id', $machine->id)
                                ->where('prod_order_pos_operation_id', $record->prod_order_pos_operation_id)
                                ->orderBy('created_at', 'desc')
                                ->get();
        }
        return response()->json(['unloading_quantity' => $record, 'loaded_quantities' => $loadedQuantities]);
    }

    public function saveUnloadedQuantity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prod_order_pos_operation_loaded_quantity_id' => 'nullable|exists:prod_order_pos_operation_loaded_quantities,id',
            'prod_order_pos_operation_id' => 'required|exists:prod_order_pos_operations,id',
            'machine_id' => 'required|exists:machines,id',
            'quantity' => 'required|numeric|min:1'
        ]);

        $validatedData = $validator->validated();
        $userId = Auth::id();

        try {
            // Start a database transaction
            DB::beginTransaction();

            $prod_order_pos_operation_loaded_quantity_id = $request->prod_order_pos_operation_loaded_quantity_id;
            if ($prod_order_pos_operation_loaded_quantity_id){
                // Mark the loaded quantity as unloaded
                 ProdOrderPosOperationLoadedQuantity::where('id', $prod_order_pos_operation_loaded_quantity_id)
                 ->update([
                    'is_unloaded' => true
                 ]);
            }


            // get current timestamp
            $currentTimestamp = Carbon::now();

            // Create the record for unloaded quantity
            $unloadedQuantity = ProdOrderPosOperationUnloadedQuantity::create([
                'prod_order_pos_operation_id' => $validatedData['prod_order_pos_operation_id'],
                'machine_id' => $validatedData['machine_id'],
                'prod_order_pos_operation_loaded_quantity_id' => $prod_order_pos_operation_loaded_quantity_id ? $validatedData['prod_order_pos_operation_loaded_quantity_id']: null,
                'quantity' => $validatedData['quantity'] ?? 0,
                'date' => $currentTimestamp,
                'user_id' => $userId,
            ]);

            // Call the saveMachineCycleFromGateway method
            $this->machineCycleController->saveMachineCycleFromGateway(new Request([
                'machine_id' => $validatedData['machine_id'],
                'registered_datetime' => $currentTimestamp,
                'quantity' => $validatedData['quantity'],
                'type' => MachineCycleType::OK(),
                'prod_order_pos_operation_id' => $validatedData['prod_order_pos_operation_id'],
            ]));

            // Commit the transaction
            DB::commit();
            return response()->json($unloadedQuantity);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollBack();

            return response()->json([
                'message' => 'An error occurred while saving unloaded quantity',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

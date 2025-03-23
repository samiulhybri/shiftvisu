<?php

namespace App\Http\Controllers;

use App\DTO\QuantityData;
use App\Enums\MachineConfirmationType;
use App\Enums\MachineCycleType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Events\MachineCycleRegistered;
use App\Models\Machine;
use App\Models\MachineCycle;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\ProdOrderPosOperation;
use DateTime;
use DateTimeInterface;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Spatie\Enum\Laravel\Rules\EnumRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Carbon\Carbon;
use Throwable;

class MachineCycleController extends Controller
{

    public function saveMachineCycleFromGateway(Request $request)
    {
        $request->validate([
            'machine_id' => 'required|integer',
            'registered_datetime' => 'nullable|date',
            'quantity' => 'nullable|integer',
            'type' => ['nullable', Rule::in(["OK", "NOT_OK"])],
            'prod_order_pos_operation_id' => 'nullable|integer',
            'serial' => 'nullable|string',
            'batch' => 'nullable|string',
        ]);

        $cycle = MachineCycle::query()->create([
            'machine_id' => $request->get('machine_id'),
            'registered_datetime' => $request->get('registered_datetime', now()),
            'quantity' => $request->get('quantity', 1),
            'type' => $request->get('type') ?? MachineCycleType::OK(),
            'prod_order_pos_operation_id' => $request->get('prod_order_pos_operation_id'),
            'serial' => $request->get('serial'),
            'batch' => $request->get('batch'),
        ]);

        // if machine confirmation type is automatic, insert quantity
        $machine = Machine::with('plant')->findOrFail($request->get('machine_id'));

        event(new MachineCycleRegistered($machine, $cycle));

        if ($machine && $machine->confirmation_type == MachineConfirmationType::AUTOMATIC()) {
            //TODO: Replace with machineInsert
//Start order if machine knows it


//            $quantityData = new QuantityData(
//                prod_order_pos_operation_id: 1,
//                item_state_id: null,
//                quantity: 1,
//                serials: [],
//                batch: null,
//                check_linked_orders: true
//            );
//
//            try {
//                $machine->insertQuantity($quantityData, null, [], $cycle->id);
//            } catch (Exception $e) {
//                Log::error($e);
//            }
        }
    }

    public function saveMachineCycleFromDevice(Request $request)
    {
        $cycles = json_decode($request->getContent(), true);
        foreach ($cycles as $cycle) {
            if (!isset($cycle['time']) || ($this->validISO8601Date($cycle['time'])) === false) {
                return response()->json(['success' => false], 406);
            }
            if (!isset($cycle['m']) || $cycle['m'] == "") {
                return response()->json(['success' => false], 406);
            }
            if (!isset($cycle['status']) || !in_array($cycle['status'], array("GOOD", "BAD", "ROBOTERROR", "SHOTIOERROR", "ERROR"))) {
                return response()->json(['success' => false], 406);
            }
        }
        $results = [];
        foreach ($cycles as $cycle) {
            $results[] = $this->saveCycle($cycle);
        }
        if (in_array("ERROR", $results)) return response()->json(['success' => false], 406);
        return response()->json(['success' => true], 201);
    }

    public function saveCycle($cycle)
    {
        try {
            $registeredDateTime = Carbon::parse($cycle['time'], env('APP_TIME_ZONE'))->setTimezone('UTC');
            MachineCycle::query()->create([
                'machine_id' => $cycle['m'],
                'registered_datetime' => $registeredDateTime->format('Y-m-d H:i:s'),
                'type' => $cycle['status'],
            ]);
            return "SUCCESS";
        } catch (Exception) {
            return "ERROR";
        }
    }

    public function validISO8601Date($value)
    {
        if (!is_string($value)) return false;
        $dateTime = DateTime::createFromFormat(DateTimeInterface::ATOM, $value);
        if ($dateTime) return $dateTime->format(DateTimeInterface::ATOM) === $value;
        return false;
    }

    /**
     * @throws Throwable
     */
    public function saveMachineCycle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'custom_id' => 'required|string|exists:machines,custom_id',
            'registered_datetime' => 'required|date_format:Y-m-d H:i:s',
            'type' => ['required', new EnumRule(MachineCycleType::class)],
            'quantity' => 'required|integer|min:1',
            'prod_order_pos_operation_id' => 'nullable|integer|exists:prod_order_pos_operations,id'
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'errors' => $validator->errors(),
            ], 422));
        }

        DB::beginTransaction();
        try {
            $machine = Machine::query()->where('custom_id', '=', $request->custom_id)->first();
            $prod_order_pos_operation_id = null;
            $machineProdOrderPosOperationTime = null;
            if ($request->prod_order_pos_operation_id) {
                $prod_order_pos_operation_id = $request->prod_order_pos_operation_id;
                $machineProdOrderPosOperationTime = MachineProdOrderPosOperationTime::query()->where([['machine_id', '=', $machine->id], ['prod_order_pos_operation_id', '=', $prod_order_pos_operation_id], ['end', '=', NULL]])->first();
            }
            MachineCycle::query()->create([
                'machine_id' => $machine->id,
                'registered_datetime' => $request->registered_datetime,
                'type' => $request->type,
                'quantity' => $request->quantity,
                'prod_order_pos_operation_id' => $prod_order_pos_operation_id,
                'batch' => $request->batch,
                'serial' => $request->serial,
            ]);
            if ($prod_order_pos_operation_id) {
                $prodOrderPosOperation = ProdOrderPosOperation::query()->where('id', '=', $prod_order_pos_operation_id)->first();
                $prodOrderPosOperation->status = ProdOrderPosOperationStatus::IN_PRODUCTION();
                $prodOrderPosOperation->status_plan = ProdOrderPosOperationStatus::IN_PRODUCTION();
                $prodOrderPosOperation->save();

                if (!$machineProdOrderPosOperationTime) {
                    MachineProdOrderPosOperationTime::query()->create([
                        'machine_id' => $machine->id,
                        'prod_order_pos_operation_id' => $prod_order_pos_operation_id,
                        'start' => $request->registered_datetime,
                        'status' => ProdOrderPosOperationStatus::IN_PRODUCTION(),
                        'cavity' => $prodOrderPosOperation->cavity
                    ]);
                } else if ($machineProdOrderPosOperationTime->status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                    $machineProdOrderPosOperationTime->end = $request->registered_datetime;
                    $machineProdOrderPosOperationTime->save();
                    MachineProdOrderPosOperationTime::query()->create([
                        'machine_id' => $machineProdOrderPosOperationTime->machine_id,
                        'prod_order_pos_operation_id' => $machineProdOrderPosOperationTime->prod_order_pos_operation_id,
                        'start' => $request->registered_datetime,
                        'status' => ProdOrderPosOperationStatus::IN_PRODUCTION(),
                        'cavity' => $machineProdOrderPosOperationTime->cavity
                    ]);
                }
            }
            DB::commit();
            return response()->json(['success' => true], 201);
        } catch (Throwable $th) {
            DB::rollback();
            throw $th;
        }
    }
}

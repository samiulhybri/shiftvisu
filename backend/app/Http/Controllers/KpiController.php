<?php

namespace App\Http\Controllers;

use App\Enums\ItemStateType;
use App\Enums\StatusBoardCardType;
use App\Models\Machine;
use App\Models\MachineMachineStateTime;
use App\Models\ProdOrderPosOperationQuantity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class KpiController extends Controller
{
    // Get the values based on the ID and array of kpis 
    public function getKpiValues($machineId, Request $request)
    {
        $validator = Validator::make(array_merge($request->all(), ['machine_id' => $machineId]), [
            'machine_id' => 'required|integer',
            'kpis' => 'required|array|min:1',
            'kpis.*' => 'string|in:OEE,PROD_TIME,CAPACITY,MACHINE_USAGE,TARGET_TIME,MACHINE_PERFORMANCE,QUALITY,QUANTITY_GOOD,QUANTITY_BAD,QUANTITY_TOTAL,SCRAP,UNIT_OF_MEASURE'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $results = [];

        $machineBoardHours = Carbon::now()->subHours($this->getMachineBoardPeriod($machineId));
        $kpis = $request['kpis'];
        $results['TIME_PERIOD'] = $this->getMachineBoardPeriod($machineId); // In hours

        try {
            foreach ($kpis as $kpi) {
                switch ($kpi) {
                    case 'PROD_TIME':
                        $results['PROD_TIME'] = $this->calculateProdTime($machineId, $machineBoardHours);
                        break;
                    case 'CAPACITY':
                        $results['CAPACITY'] = $this->calculateCapacity($machineId, $machineBoardHours);
                        break;
                    case 'MACHINE_USAGE':
                        $results['MACHINE_USAGE'] = $this->calculateMachineUsage($machineId, $machineBoardHours);
                        break;
                    case 'TARGET_TIME':
                        $results['TARGET_TIME'] = $this->calculateTargetTime($machineId, $machineBoardHours);
                        break;
                    case 'MACHINE_PERFORMANCE':
                        $results['MACHINE_PERFORMANCE'] = $this->calculateMachinePerformance($machineId, $machineBoardHours);
                        break;
                    case 'QUANTITY_GOOD':
                        $results['QUANTITY_GOOD'] = $this->calculateQuantityGood($machineId, $machineBoardHours);
                        break;
                    case 'QUANTITY_BAD':
                        $results['QUANTITY_BAD'] = $this->calculateQuantityBad($machineId, $machineBoardHours);
                        break;
                    case 'QUANTITY_TOTAL':
                        $results['QUANTITY_TOTAL'] = $this->calculateQuantityTotal($machineId, $machineBoardHours);
                        break;
                    case 'QUALITY':
                        $results['QUALITY'] = $this->calculateQuality($machineId, $machineBoardHours);
                        break;
                    case 'SCRAP':
                        $results['SCRAP'] = $this->calculateScrap($machineId, $machineBoardHours);
                        break;
                    case 'OEE':
                        $results['OEE'] = $this->calculateOEE($machineId, $machineBoardHours);
                        break;
                    case 'UNIT_OF_MEASURE':
                        $results['UNIT_OF_MEASURE'] = $this->getUnitOfMeasure($machineId, $machineBoardHours);
                        break;
                    default:
                        throw new \Exception("Invalid kpi value: $kpi");
                }
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
        return response()->json($results);
    }

    private function getMachineBoardPeriod($machineId)
    {
        return Machine::where('id', $machineId)
            ->pluck('machine_board_hours')
            ->first();
    }

    private function calculateProdTime($machineId, $machineBoardHours)
    {
        return MachineMachineStateTime::whereHas('machineState.machineStateGroup', function ($query) {
            $query->where('is_productive', 1);
        })->where('machine_id', $machineId)
            ->where(function ($query) use ($machineBoardHours) {
                $query->orWhere('end', '>=', $machineBoardHours)
                    ->orWhereNull('end');
            })
            ->get()
            ->reduce(function ($carry, $item) use ($machineBoardHours) {
                $end = $item->end ? Carbon::parse($item->end) : Carbon::now();
                $start = max(Carbon::parse($item->start), Carbon::parse($machineBoardHours));
                return $carry + $start->diffInSeconds($end);
            }, 0);
    }

    private function calculateCapacity($machineId, $machineBoardHours)
    {
        return MachineMachineStateTime::where(function ($query) {
            $query->whereDoesntHave('machineState')
                ->orWhereHas('machineState.machineStateGroup', function ($query) {
                    $query->where('has_capacity', 1);
                });
        })
            ->where('machine_id', $machineId)
            ->where(function ($query) use ($machineBoardHours) {
                $query->orWhere('end', '>=', $machineBoardHours)
                    ->orWhereNull('end');
            })
            ->get()
            ->reduce(function ($carry, $item) use ($machineBoardHours) {
                $end = $item->end ? Carbon::parse($item->end) : Carbon::now();
                $start = max(Carbon::parse($item->start), Carbon::parse($machineBoardHours));
                return $carry + $start->diffInSeconds($end);
            }, 0);
    }

    public function calculateMachineUsage($machineId, $machineBoardHours)
    {
        $prodTime = $this->calculateProdTime($machineId, $machineBoardHours);
        $capacity = $this->calculateCapacity($machineId, $machineBoardHours);
        return $capacity ? ($prodTime / $capacity) : 0.0;
    }

    private function calculateTargetTime($machineId, $machineBoardHours)
    {
        return ProdOrderPosOperationQuantity::where('prod_order_pos_operation_quantities.machine_id', $machineId)
            ->where('confirmed_datetime', '>=', $machineBoardHours)
            ->with('prodOrderPosOperation')
            ->get()
            ->sum(function ($quantity) {
                return $quantity->quantity * $quantity->prodOrderPosOperation->te;
            });
    }

    public function calculateMachinePerformance($machineId, $machineBoardHours)
    {
        $targetTime = $this->calculateTargetTime($machineId, $machineBoardHours);
        $prodTime = $this->calculateProdTime($machineId, $machineBoardHours);
        return $prodTime ? ($targetTime / $prodTime) : 0.0;
    }

    public function calculateQuantityGood($machineId, $machineBoardHours)
    {
        return ProdOrderPosOperationQuantity::query()
            ->where('machine_id', $machineId)
            ->where('confirmed_datetime', '>=', $machineBoardHours)
            ->whereHas('itemState', function ($query) {
                $query->whereIn('item_state_type', [ItemStateType::GOOD(), ItemStateType::REWORK()]);
            })
            ->sum('quantity');
    }

    public function calculateQuantityBad($machineId, $machineBoardHours)
    {
        return ProdOrderPosOperationQuantity::where('machine_id', $machineId)
            ->where('confirmed_datetime', '>=', $machineBoardHours)
            ->whereRelation('itemState', 'item_state_type', ItemStateType::SCRAP())
            ->sum('quantity');
    }

    public function calculateQuantityTotal($machineId, $machineBoardHours)
    {
        $quantityGood = $this->calculateQuantityGood($machineId, $machineBoardHours);
        $quantityBad = $this->calculateQuantityBad($machineId, $machineBoardHours);
        return $quantityGood + $quantityBad;
    }

    public function calculateQuality($machineId, $machineBoardHours)
    {
        $quantityGood = $this->calculateQuantityGood($machineId, $machineBoardHours);
        $quantityTotal = $this->calculateQuantityTotal($machineId, $machineBoardHours);
        return $quantityTotal ? ($quantityGood / $quantityTotal) : 0.0;
    }


    public function calculateScrap($machineId, $machineBoardHours)
    {
        $quantityBad = $this->calculateQuantityBad($machineId, $machineBoardHours);
        $quantityTotal = $this->calculateQuantityTotal($machineId, $machineBoardHours);
        return $quantityTotal ? ($quantityBad / $quantityTotal) : 0.0;
    }

    public function calculateOEE($machineId, $machineBoardHours)
    {
        $machineUsage = $this->calculateMachineUsage($machineId, $machineBoardHours);
        $machinePerformance = $this->calculateMachinePerformance($machineId, $machineBoardHours);
        $quality = $this->calculateQuality($machineId, $machineBoardHours);
        return ($machineUsage * $machinePerformance * $quality);
    }

    public function getUnitOfMeasure($machineId, $machineBoardHours)
    {
        $operationQuantity = ProdOrderPosOperationQuantity::where('prod_order_pos_operation_quantities.machine_id', $machineId)
            ->where('confirmed_datetime', '>=', $machineBoardHours)
            ->with(['prodOrderPosOperation.unitOfMeasure'])
            ->first();

        if (!$operationQuantity) {
            return null;
        }
        return $operationQuantity->prodOrderPosOperation->unitOfMeasure->custom_id ?? null;
    }
}

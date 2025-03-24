<?php

namespace App\Http\Controllers;

use App\Enums\EnergyType;
use App\Models\EnergyConsumer;
use App\Models\EnergyConsumption;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\Request;

class EnergyConsumptionReportController extends Controller
{
    /**
     * Get energy consumption data for a given time range and energy type.
     *
     * @param string $start_time
     * @param string $end_time
     * @param string $energy_type
     * @return \Illuminate\Database\Eloquent\Collection|JsonResponse
     */
    public function consumptionData(Request $request)
    {
        try {
            if (!isset($request->start_time) || !isset($request->end_time) || !isset($request->energy_type)) {
                return response()->json(['error' => 'Send all required parameters'], 422);
            }

            $energy_type = strtoupper($request->energy_type);

            if (!in_array($energy_type, EnergyType::toValues())) {
                return response()->json(['error' => 'Invalid energy type.'], 422);
            }

            if ($request->start_time > $request->end_time) {
                return response()->json(['error' => 'Start time cannot be greater than end time.'], 422);
            }

            $energy_factor = ($request->energy_type === 'ELECTRICITY') ? 1000 : 1;

            $consumptionData = EnergyConsumption::select(
                'energy_consumer_id',
                'consumption_hour',
                'energy_type',
                'date',
                DB::raw("ROUND( (SUM(energy_consumption) / $energy_factor) , 0) AS energy_consumption")
            )
                ->where('energy_type', $energy_type)
                ->where('consumption_hour', '>=', $request->start_time)
                ->where('consumption_hour', '<=', $request->end_time)
                ->groupBy('energy_consumer_id', 'date', 'consumption_hour', 'energy_type')
                ->get();
            return $consumptionData;
        } catch (Exception $e) {
            Log::error($e);
            abort(500, 'An error occurred while fetching the energy consumption data.');
        }
    }
}

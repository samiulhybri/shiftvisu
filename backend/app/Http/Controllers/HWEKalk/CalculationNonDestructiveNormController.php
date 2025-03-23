<?php

namespace App\Http\Controllers\HweKalk;


use App\Http\Controllers\Controller;
use App\Models\MtNorm;
use App\Models\CalculationNonDestructiveNorm;
use App\Models\CalculationNonDestructiveTesting;
use App\Models\PtNorm;
use App\Models\VtNorm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalculationNonDestructiveNormController extends Controller
{
    /**
     * @param CalculationNonDestructiveTesting $CalculationNonDestructiveTesting
     * @param Request $request
     * @return JsonResponse
     * create or update new morph data
     */
    public function createOrUpdateMorph(CalculationNonDestructiveTesting $calculationNonDestructiveTesting, Request $request): JsonResponse
    {
        try {
            $calculationNonDestructiveNorm = $calculationNonDestructiveTesting->calculationNonDestructiveNorm();

            $calculationNonDestructiveNorm?->delete();

            if ($this->getNormType($request->norm_type) && $request->norm_id) {
                $calculationNonDestructiveTesting->calculationNonDestructiveNorm()->create([
                    'norm_type' => $this->getNormType($request->norm_type),
                    'norm_id' => $request->norm_id
                ]);
            }

            $success = true;
        } catch (\Exception $exception) {
            $success = false;
        }

        return response()->json(['success' => $success]);
    }

    /**
     * @param $type
     * @return string
     */

    protected function getNormType($type): string
    {
        return [
            'PT' => PtNorm::class,
            'VT' => VtNorm::class,
            'MT' => MtNorm::class
        ][$type];
    }

    /**
     * @param CalculationNonDestructiveNorm $calculationNonDestructiveNorm
     * @return JsonResponse
     * fetch NonDestructiveNorm data with morph relation (PtNorm,VtNorm,MtNorm)
     */
    public function getNorm(CalculationNonDestructiveNorm $calculationNonDestructiveNorm): JsonResponse
    {
        $calculationNonDestructiveNorm->load('norm:id,custom_id');
        return response()->json(['norm'=>$calculationNonDestructiveNorm->norm]);
    }
}

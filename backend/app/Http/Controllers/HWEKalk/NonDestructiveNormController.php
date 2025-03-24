<?php

namespace App\Http\Controllers\HweKalk;


use App\Http\Controllers\Controller;
use App\Models\MtNorm;
use App\Models\NonDestructiveNorm;
use App\Models\NonDestructiveTesting;
use App\Models\PtNorm;
use App\Models\VtNorm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NonDestructiveNormController extends Controller
{
    /**
     * @param NonDestructiveTesting $nonDestructiveTesting
     * @param Request $request
     * @return JsonResponse
     * create or update new morph data
     */
    public function createOrUpdateMorph(NonDestructiveTesting $nonDestructiveTesting, Request $request): JsonResponse
    {
        try {
            $nonDestructiveNorm = $nonDestructiveTesting->nonDestructiveNorm();

               $nonDestructiveNorm?->delete();
                if($this->getNormType($request->norm_type) && $request->norm_id){
                    $nonDestructiveNorm->create([
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
     * @param NonDestructiveNorm $nonDestructiveNorm
     * @return JsonResponse
     * fetch NonDestructiveNorm data with morph relation (PtNorm,VtNorm,MtNorm)
     */
    public function getNorm(NonDestructiveNorm $nonDestructiveNorm): JsonResponse
    {
        $nonDestructiveNorm->load('norm:id,custom_id');
        return response()->json(['norm'=>$nonDestructiveNorm->norm]);
    }
}

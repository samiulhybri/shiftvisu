<?php

namespace App\Http\Controllers;

use App\Models\IdGeneratorSetting;
use Haruncpi\LaravelIdGenerator\IdGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class IdGeneratorController extends Controller
{
    public static function generateId(string $entity): string
    {
        $idGeneratorSetting = IdGeneratorSetting::where('entity', $entity)->first();

        if(!$idGeneratorSetting)
            throw new \Exception('No Id generator for the requested Entity available', 422);

        $config = [
            'table' => $idGeneratorSetting->table,
            'field' => $idGeneratorSetting->field,
            'length' => $idGeneratorSetting->length,
            'prefix' => $idGeneratorSetting->prefix,
            'reset_on_prefix_change' => $idGeneratorSetting->reset_on_prefix_change
        ];

        if($idGeneratorSetting->is_date_prefix)
            $config['prefix'] = date($idGeneratorSetting->prefix);

        if($idGeneratorSetting->prefix && strlen($idGeneratorSetting->prefix))
            return IdGenerator::generate($config);
        else
            return self::generateIdWithoutPrefix($config);
    }

    private static function generateIdWithoutPrefix(array $config): string
    {
        $maxKey = (int)DB::select("SELECT max({$config['field']}) as value from {$config['table']}")[0]->value + 1;
        return Str::padLeft((string)$maxKey, $config['length'], '0');
    }

    public function generateIdRequest(Request $request): JsonResponse
    {
        try {
            return response()->json(['entity' => $this->generateId($request->get('entity'))]);
        } catch (\Exception $exception) {
            abort($exception->getCode(), $exception->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\DataImport;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SAPIdocImportController extends Controller
{
    public function store(Request $request)
    {
        $responseMessage = "";
        $statusCode = -1;

        try {
            $xmlContent = simplexml_load_string($request->getContent());
            $xmlFileName = $xmlContent ? $xmlContent->getName() : "";

            if ($xmlFileName) {
                DataImport::create([
                    'name' => $xmlFileName,
                    'data' => $xmlContent,
                ]);
                $responseMessage = 'successfully saved ' . $xmlFileName . ' file ';
                $statusCode = 200;
            } else {
                $responseMessage = 'something went wrong';
                $statusCode = 400;
            }
        } catch (Exception $exception) {
            $responseMessage = 'something went wrong';
            $statusCode = 400;
        }

        return response()->json(['message' => $responseMessage, 'data' => []], $statusCode);
    }
}

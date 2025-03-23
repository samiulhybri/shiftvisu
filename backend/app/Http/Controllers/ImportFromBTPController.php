<?php

namespace App\Http\Controllers;


use App\Models\ProdInspectionOperationResource;
use App\Services\ImportFromBTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImportFromBTPController extends Controller
{
    protected $apiService;

    public function __construct(ImportFromBTPService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function getImportedValuesFromBTP(Request $request)
    {
        $url = $request->get('additionalQuery', '');
        $body = $request->get('body', []);
        $method = $request->get('method', 'get');

        $importedValues = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method, $body);

        return response($importedValues)->header('Content-Type', 'application/json');
    }

    public function getImportedImageFromBTP(string $itemIdCustom)
    {
        $url = "sap/opu/odata/SAP/ZAPI_READ_DMS_IMAGE_SRV/DMSSet(DocType='ZFI',ObjKey='{$itemIdCustom}')/\$value?sap-client=" . env('SAP_CLIENT', 100);

        return $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
    }

    public function getAttachmentFromBTP(ProdInspectionOperationResource $prodInspectionOperationResource)
    {
        $json = json_decode($prodInspectionOperationResource->external_id);
        if($json->doc_type && $json->doc_nr && $json->doc_version && $json->doc_part) {
            $url = "sap/opu/odata/SAP/ZAPI_GET_IMG_QM_SRV/QMImageSet(DocType='$json->doc_type',DocNr='$json->doc_nr',DocVersion='$json->doc_version',DocPart='$json->doc_part')/\$value?sap-client=" . env('SAP_CLIENT', 100);

            return $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        }
        return response();
    }
}

<?php

namespace App\Http\Controllers;

use App\Contracts\ExportStrategy;
use App\Enums\DataExportName;
use App\ExportStrategies\ExportResult;
use App\Models\DataExport;
use Illuminate\Support\Facades\Log;

class ExportController extends Controller
{
    private ?ExportStrategy $exportStrategy = null;

    public function __construct()
    {
        try {
            $this->exportStrategy = resolve(ExportStrategy::class);
        } catch (\Exception $e) {
            Log::info("No export strategy defined");
        }
    }

    private function tryLock(DataExport $dataExport): bool
    {
        $updated = DataExport::query()
            ->where('id', $dataExport->id)
            ->where('is_exported', false)
            ->where('is_exporting', false)
            ->update(['is_exporting' => true]);

        $dataExport->refresh();

        return $updated > 0;
    }

    public function export()
    {
        foreach (DataExport::where('is_exported', false)->orderBy("id")->get() as $dataExport) {
            $this->singleExport($dataExport);
        }
    }

    public function singleExport(DataExport $dataExport): ?DataExport
    {
        if (!$this->tryLock($dataExport)) {
            return null;
        }

        $dataExport->refresh();
        $result = ExportResult::FAIL("Export did not run");
        try {
            switch ($dataExport->name) {
                case DataExportName::QUANTITY_COUNT():
                    $result = $this->exportStrategy?->exportQuantityCount($dataExport);
                    break;
                case DataExportName::QUANTITY_PRINT():
                    $result = $this->exportStrategy?->exportQuantityPrint($dataExport);
                    break;
                case DataExportName::TIME_MACHINE():
                    $result = $this->exportStrategy?->exportTimeMachine($dataExport);
                    break;
                case DataExportName::TIME_USER():
                    $result = $this->exportStrategy?->exportTimeUser($dataExport);
                    break;
                case DataExportName::PRODUCTION_ORDER():
                    $result = $this->exportStrategy?->exportProductionOrder($dataExport);
                    break;
                case DataExportName::QUANTITY_CONSUMPTION():
                    $result = $this->exportStrategy?->exportQuantityConsumption($dataExport);
                    break;
                case DataExportName::CASTING_DATA():
                    $result = $this->exportStrategy?->exportCastingData($dataExport);
                    break;
                case DataExportName::ZPP():
                    $result = $this->exportStrategy?->exportZpp($dataExport);
                    break;
                case DataExportName::QUALI_DATA():
                    $result = $this->exportStrategy?->exportQualiData($dataExport);
                    break;
                case DataExportName::OPERATION_PLAN():
                    $result = $this->exportStrategy?->exportOperationPlan($dataExport);
                    break;
                case DataExportName::MACHINE_TIMES():
                    $result = $this->exportStrategy?->exportMachineTimes($dataExport);
                    break;
                case DataExportName::OPERATION_QUANTITIES():
                    $result = $this->exportStrategy?->exportOperationQuantities($dataExport);
                    break;
                case DataExportName::MATERIAL_DOCUMENT():
                    $result = $this->exportStrategy?->exportMaterialDocument($dataExport);
                    break;
                case DataExportName::EQUIPMENT():
                    $result = $this->exportStrategy?->exportEquipment($dataExport);
                    break;
                case DataExportName::WAREHOUSE_TASK():
                    $result = $this->exportStrategy?->exportWarehouseTask($dataExport);
                    break;
                case DataExportName::PRINT_HANDLING_UNIT():
                    $result = $this->exportStrategy?->exportPrintHandlingUnit($dataExport);
                    break;
                case DataExportName::PRINT_BATCH():
                    $result = $this->exportStrategy?->exportPrintBatch($dataExport);
                    break;
                case DataExportName::PRINT_PRODUCTION_ORDER():
                    $result = $this->exportStrategy?->exportPrintProductionOrder($dataExport);
                    break;
                case DataExportName::PRINT_GOODS_MOVEMENT():
                    $result = $this->exportStrategy?->exportPrintGoodsMovement($dataExport);
                    break;
                case DataExportName::INSPECTION_POINT():
                    $result = $this->exportStrategy?->exportInspectionPoint($dataExport);
                    break;
                case DataExportName::OPERATION_USER_TIMES():
                    $result = $this->exportStrategy?->exportOperationUserTimes($dataExport);
                    break;
                case DataExportName::OPERATION_MACHINE_TIMES():
                    $result = $this->exportStrategy?->exportOperationMachineTimes($dataExport);
                    break;
                case DataExportName::OPERATION_CLOSED():
                    $result = $this->exportStrategy?->exportOperationClosed($dataExport);
                    break;
            }
        } catch (\Throwable $e) {
            Log::error($e);
            $result = ExportResult::FAIL("Export threw an unexpected exception:\n" . $e->getMessage());
            $dataExport->is_exporting = false;
            $dataExport->save();
        }

        $dataExport->is_exported = $result->success;
        $dataExport->result_message = $result->message;
        $dataExport->http_method = $result->httpMethod;
        $dataExport->http_url = $result->httpUrl;
        $dataExport->http_payload = $result->httpPayload;
        $dataExport->last_exported_at = now();
        $dataExport->is_exporting = false;
        $dataExport->save();

        return $dataExport;
    }
}

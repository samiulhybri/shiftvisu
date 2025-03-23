<?php

namespace App\Contracts;

use App\ExportStrategies\ExportResult;
use App\Models\DataExport;

class ExportStrategy
{
    public function exportQuantityCount(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportQuantityPrint(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportProductionOrder(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportTimeMachine(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportTimeUser(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportQuantityConsumption(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportQualiData(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportCastingData(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportZpp(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportOperationPlan(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportMachineTimes(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportOperationQuantities(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportOperationClosed(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportOperationMachineTimes(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportOperationUserTimes(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportMaterialDocument(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportEquipment(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportWarehouseTask(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportPrintHandlingUnit(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportPrintBatch(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportPrintProductionOrder(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportPrintGoodsMovement(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportInspectionPoint(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }
}

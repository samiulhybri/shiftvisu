<?php

namespace App\ExportStrategies;

use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use App\Models\ProdOrder;
use Carbon\Carbon;
use PDO;

class SctExportStrategy extends ExportStrategy
{
    private PDO $erp_db;

    public function __construct()
    {
        $this->erp_db = new PDO("mysql:host=" . env('ERP_HOST') . ";port=" . env('ERP_PORT') . ";dbname=task_visu;charset=utf8mb4", env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->erp_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function exportProductionOrder(DataExport $dataExport): ExportResult
    {
        $prodOrder = json_decode($dataExport->data);
        foreach ($prodOrder->pos as $prodOrderPos) {
            foreach ($prodOrderPos->opPlanPos as $prodOrderPosOperation) {
                $operation = ProdOrder::where('custom_id', $prodOrder->custom_id)
                    ->first()
                    ->prodOrderPos()
                    ->where('pos', $prodOrderPos->pos)
                    ->first()
                    ->prodOrderPosOperations()
                    ->where('pos', $prodOrderPosOperation->pos)
                    ->first();
                $operationCustomId = $operation->classifications()
                    ->where('class', 'JPI_SCT')
                    ->where('attribute', 'custom_id')
                    ->first()?->value_string;

                if (!$operationCustomId) {
                    continue;
                }

                $stmt = $this->erp_db->prepare("UPDATE t_dev_status_progress
                SET
                  expected_end_date = :end
                WHERE id = :operation");
                $stmt->setFetchMode(\PDO::FETCH_ASSOC);
                $stmt->execute([
                    'end' => $prodOrderPosOperation->end,
                    'operation' => $operationCustomId,
                ]);
            }
        }

        return ExportResult::SUCCESS();
    }
}

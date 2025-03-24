<?php

namespace App\ExportStrategies;

use App\Contracts\ExportStrategy;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\DataExport;
use Carbon\Carbon;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class IctExportStrategy extends ExportStrategy
{
    private PDO $erp_db;

    public function __construct()
    {
        $this->erp_db = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
    }

    public function exportProductionOrder(DataExport $dataExport): ExportResult
    {
        $prodOrder = json_decode($dataExport->data);
        $lastRes = null;
        foreach ($prodOrder->pos as $prodOrderPos) {
            foreach ($prodOrderPos->opPlanPos as $prodOrderPosOperation) {
                if ($prodOrderPosOperation->status == ProdOrderPosOperationStatus::CLOSED() ||
                    !(
                        collect(['BK-METALLFERTIGUNG', 'DZ-VERBINDUNGSTECHNIK', 'BK-HYDRAULISCH'])->contains($prodOrderPosOperation->hall_custom_id ?? '') ||
                        collect(['M07010', 'AP032', 'V00250'])->contains($prodOrderPosOperation->machine_custom_id ?? '')
                    ) ||
                    !$prodOrderPosOperation->start ||
                    !$prodOrderPosOperation->end ||
                    str_contains($prodOrder->custom_id, 'NA')
                )
                    continue;

                $start = Carbon::createFromTimeString($prodOrderPosOperation->start);
                $end = Carbon::createFromTimeString($prodOrderPosOperation->end);

                if ($start->lte($end)) {
                    $sql = "INSERT INTO MES_TO_ERP
                    (PRODKEY, ARBEITSGANG, STARTDATUM, ENDDATUM, PRODID)
                    VALUES
                    ('{$prodOrder->custom_id}', '{$prodOrderPosOperation->pos}', '{$start->isoFormat('DD.MM.YY')}', '{$end->isoFormat('DD.MM.YY')}', '{$prodOrderPosOperation->ict_prodid}');";
                    $stmt = $this->erp_db->prepare($sql);
                    $stmt->setFetchMode(\PDO::FETCH_ASSOC);
                    $lastRes = $stmt->execute();
                }
            }
        }
        return ExportResult::SUCCESS(message: json_encode($lastRes));
    }
}

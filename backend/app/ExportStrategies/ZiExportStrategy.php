<?php

namespace App\ExportStrategies;

use App\Enums\DataExportName;
use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use Carbon\Carbon;

use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class ZiExportStrategy extends ExportStrategy
{
    public function exportQuantityCount(DataExport $dataExport): ExportResult
    {
        $erp_db = new PDO("odbc:" . env('EXPORT_ERP_HOST'), env('EXPORT_ERP_USERNAME'), env('EXPORT_ERP_PASSWORD'));
        //bab_nr = Order Nr
        //bab_afo_nr = production Step
        //bab_typ = as far as I can tell not imported anywhere in ZI at the moment
        //Table structure can be found in(Link should allow only read access): https://schertech39042.sharepoint.com/:w:/s/SCTBrixen/EffPen3yPmlFh4-OkcG3QBcBQBVsR55oenxB2ZYaS8RiwA?e=TFMa5O
        //Rüstzeit + Gutmenge* fertigungszeit(AVG shottime) = gesamtzeit fertigungzeit in minuten entsprechend auch rüstzeit und gesammtzeit Wert ist als Zahl erwartet
        //Bei ausschuss Rüstzeit fertigungzeit und gesamtzeit immer 0
        $realdata = json_decode($dataExport->data);
        $stmt = $erp_db->prepare("INSERT INTO tlc_schertech_transfer (bab_typ, bab_nr, bab_afo_nr, menge, ausschuss, ausschuss_grund_id, datum_von, datum_bis, erstellt_am, erstellt_von, tr, teg, tg ) VALUES ( 20, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");
        $date = Carbon::now();
        $erp_db->beginTransaction();
        foreach ($realdata as $row) {
            $row->setup_time = $row->setup_time ?? 0.0;
            $row->prod_time = $row->prod_time ?? 0.0;
            $total_time = $row->setup_time + $row->prod_time;
            $stmt->execute([$row->prod_order_custom_id, $row->prod_order_pos, $row->quantity_good_part, 0, '', $row->date_from, $row->date_to, $date, 'Schertech Export Job', $row->setup_time, $row->prod_time, $total_time]);
            foreach ($row->bad_part_list as $details_badparts_main) {
                foreach ($details_badparts_main as $details_badparts) {
                    $stmt->execute([$row->prod_order_custom_id, $row->prod_order_pos, 0, $details_badparts->quantity_bad_part_total, $details_badparts->bad_part_reason_custom_id, $row->date_from, $row->date_to, $date, 'Schertech Export Job', 0, 0, 0]);
                }
            }
        }
        $erp_db->commit();
        return ExportResult::SUCCESS();
    }
}

<?php

namespace App\ExportStrategies;

use PDO;
use App\Models\DataExport;
use App\Contracts\ExportStrategy;
use Illuminate\Support\Facades\Log;

class AGVSExportStrategy extends ExportStrategy
{
    private PDO $erp_db;

    public function __construct()
    {
        $this->erp_db = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
    }

    public function exportOrderStart(DataExport $dataExport): ExportResult
    {
        $exportedData = json_decode($dataExport->data);
        try {
            $this->erp_db->beginTransaction();

            # Prepare the insert statement for schertech.st_header
            $stmt_st_header = $this->erp_db->prepare("INSERT INTO st_header (mitarb_kuerzel, start, ende, bab_nr, afo_nr, tr, te, menge_gut, menge_ausschuss, menge_gespert, maschine_id, werkzeug_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");

            # Insert into schertech.st_header
            foreach ($exportedData as $row) {
                $stmt_st_header->execute([
                    $row->employee_custom_id ?? null,                   // mitarb_kuerzel
                    $row->start ?? null,                                // start
                    $row->end ?? null,                                  // ende
                    $row->prod_order_custom_id ?? null,                 // bab_nr
                    $row->prod_order_pos ?? '',                         // afo_nr
                    $row->tr ?? 0,                                      // tr
                    $row->te ?? 0,                                      // te
                    $row->total_order_quantity_good_part ?? 0,          // menge_gut
                    $row->total_order_quantity_bad_part_total ?? 0,     // menge_ausschuss (set later)
                    $row->quantity_locked ?? 0,                         // menge_gespert
                    $row->machine_custom_id ?? null,                    // maschine_id
                    $row->tool_custom_id ?? null                        // werkzeug_id
                ]);
            }

            $this->erp_db->commit();
            return ExportResult::SUCCESS();
        } catch (\Exception $e) {
            $this->erp_db->rollBack();
            Log::error("Export Order Start failed: " . $e->getMessage());
            return ExportResult::FAIL();
        }
            
    }

    public function exportQuantityCount(DataExport $dataExport): ExportResult
    {
        $exportedData = json_decode($dataExport->data);

        try {
            foreach ($exportedData as $row) {
                $record = $this->get_st_header_by_order_and_machine($row->prod_order_custom_id, $row->machine_custom_id);

                if(!$record) {
                    continue;
                }

                # Update menge_gut & menge_ausschuss in st_header
                $updateStmt = $this->erp_db->prepare("
                    UPDATE st_header
                    SET menge_gut = ?, menge_ausschuss = ?
                    WHERE id = ?
                ");

                $updateStmt->execute([
                    $row->total_order_quantity_good_part ?? 0,
                    $row->total_order_quantity_bad_part_total ?? 0,
                    $record['id']
                ]);

                # Insert into or update schertech.st_ausschuss
                foreach ($row->bad_part_list ?? [] as $badPart) {

                    $badPart = $this->get_st_ausschuss($row->bad_part_reason_custom_id, $record['id']);
                    if($badPart) {
                        $updateStmt = $this->erp_db->prepare("
                            UPDATE st_ausschuss
                            SET menge = ?
                            WHERE st_header_id = ? AND fehler_id = ?
                        ");
                        $updateStmt->execute([
                            $badPart->quantity_bad_part_total ?? 0,  
                            $record['id'],
                            $badPart->bad_part_reason_custom_id ?? ''
                        ]);
                    } else {
                        # Prepare insert for schertech.st_ausschuss
                        $insertStmt = $this->erp_db->prepare("
                            INSERT INTO st_ausschuss (st_header_nr, fehler_id, menge)
                            VALUES (?, ?, ?)
                        ");
                        $insertStmt->execute([
                            $record['id'],
                            $badPart->bad_part_reason_custom_id ?? '',
                            $badPart->quantity_bad_part_total ?? 0
                        ]);
                    }
                }
            }
            return ExportResult::SUCCESS();
        } catch (\Exception $e) {
            Log::error("Export Quantity Count failed: " . $e->getMessage());
            return ExportResult::FAIL();
        }
    }

    public function exportLogin(DataExport $dataExport): ExportResult
    {
        $exportedData = json_decode($dataExport->data);
        try {
            foreach ($exportedData as $row) {
                $record = $this->get_st_header_by_order_and_machine($row->prod_order_custom_id, $row->machine_custom_id);
                if (!$record) {
                    continue;
                }

                if (!empty($row->end)) {
                    // UPDATE existing login
                    $stmt = $this->erp_db->prepare("
                        UPDATE st_mitarb
                        SET ende = ?
                        WHERE st_header_id = ? AND mitarb_kuerzel = ? AND start = ?
                    ");
                    $stmt->execute([
                        $row->end,
                        $record['id'],
                        $row->employee_custom_id ?? '',
                        $row->start ?? null
                    ]);
                }else {
                    // INSERT new login
                    $stmt = $this->erp_db->prepare("
                        INSERT INTO st_mitarb (st_header_id, mitarb_kuerzel, start, ende)
                        VALUES (?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $record['id'],
                        $row->employee_custom_id ?? '',
                        $row->start ?? null,
                        null
                    ]);
                }
            }
            return ExportResult::SUCCESS();
        } catch (\Exception $e) {
            Log::error("Export Login failed: " . $e->getMessage());
            return ExportResult::FAIL();
        }
    }

    private function get_st_header_by_order_and_machine($prod_order_custom_id, $machine_custom_id) 
    {
        $stmt = $this->erp_db->prepare("
            SELECT ifdnr as id FROM st_header
            WHERE bab_nr = ? AND maschine_id = ?
            ORDER BY id DESC
            LIMIT 1;
        ");
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute([$prod_order_custom_id, $machine_custom_id]);
        return $stmt->fetch();
    }

    private function get_st_ausschuss($bad_part_reason_custom_id, $st_header_id)
    {
        $stmt = $this->erp_db->prepare("
            SELECT ifdnr as id FROM st_ausschuss
            WHERE st_header_nr = ? AND fehler_id = ?
            LIMIT 1;
        ");
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute([$st_header_id, $bad_part_reason_custom_id]);
        return $stmt->fetch();
    }
    
}

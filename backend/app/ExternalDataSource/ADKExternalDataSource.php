<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\Enums\ProdOrderPosOperationStatus;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use PDO;

class ADKExternalDataSource extends BaseVisuExternalDataSource
{
    private PDO $erp_db;

    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:sqlsrvadok", "schertech", "Scher2023!#");
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemDto[]|false
     */
    public function itemDtos(int $skip, int $take): array|false
    {
        $query = "SELECT 
            (x.COMPANY + '-' + x.PLANT + '-' + x.MATERIAL) AS custom_id, x.STEXT AS name, mop.MATSTAT AS is_active
            FROM IASMATMOP AS mop
            JOIN IASMATX AS x ON x.MATERIAL = mop.MATERIAL AND x.COMPANY = mop.COMPANY AND x.CLIENT = mop.CLIENT AND x.PLANT = mop.PLANT
            JOIN IASMATBASIC AS mb ON mb.MATERIAL = mop.MATERIAL AND mb.COMPANY = mop.COMPANY AND mb.CLIENT = mop.CLIENT
            WHERE x.LANGU = 'T' AND x.TEXTTYPE = 'P' AND
                x.VALIDFROM < GETDATE() AND x .VALIDUNTIL > GETDATE() AND
                mop.VALIDFROM < GETDATE() AND mop .VALIDUNTIL > GETDATE() AND
                mop.COMPANY in ('01', '03') AND 
                mb.MATTYPE IN ('YRML','URUN')
            ORDER BY (x.COMPANY + '-' + x.PLANT + '-' + x.MATERIAL)
            OFFSET {$skip} ROWS
            FETCH NEXT {$take} ROWS ONLY";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = array();
        foreach ($results as $result) {
            $records[] = new ItemDto(
                $result['custom_id'],
                mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                $result['is_active'] == 'A'
            );

        }

        return $records;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT (x.COMPANY + '-' + x.PLANT + '-' + x.WORKCENTER) AS custom_id, x.STEXT AS name, ((cent.ISDELETE -1) * -1) AS is_active
            FROM IASWORKCENT AS cent
            JOIN IASWORKCENX AS x ON x.WORKCENTER = cent.WORKCENTER AND x.COMPANY = cent.COMPANY AND x.CLIENT = cent.CLIENT AND x.PLANT = cent.PLANT
            WHERE x.LANGU = 'T' AND 
                x.VALIDFROM < GETDATE() AND x .VALIDUNTIL > GETDATE() AND
                cent.VALIDFROM < GETDATE() AND cent .VALIDUNTIL > GETDATE() AND
                cent.COMPANY in ('01', '03')";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push(
                new MachineDto(
                    custom_id: $result['custom_id'],
                    name: mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                    is_active: $result['is_active'],
                ));
        }
        return $records->toArray();
    }

    public function halls(): Collection
    {
        $query = "SELECT (x.COMPANY + '-' + x.PLANT + '-' + x.POTYPE) AS custom_id, 
                x.STEXT AS name, 
                1 AS is_active
            FROM IASPRD001X AS x
            WHERE x.LANGU = 'T' AND
                  x.COMPANY in ('01', '03')";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                'is_active' => $result['is_active'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function machineGroups(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function operations(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        $query = "SELECT (IASPRDORDER.COMPANY + '-' + IASPRDORDER.PLANT + '-' + IASPRDORDER.PRDORDER) AS custom_id, 
                IASPRDORDER.QUANTITY AS quantity, 
                '10' AS custom_pos, 
                (IASPRDORDER.COMPANY + '-' + IASPRDORDER.PLANT + '-' + IASPRDORDER.MATERIAL) AS custom_item_id, 
                IASPRDORDER.STARTDATE AS pos_start, 
                IASPRDORDER.ENDDATE AS pos_end, 
                IASPRDOPR.TARGETSTART AS op_plan_pos_start, 
                IASPRDOPR.TARGETEND AS op_plan_pos_end, 
                COALESCE((SELECT TOP 1 SURE2GKS FROM ADKOPR WHERE IASPRDORDER.MATERIAL = ADKOPR.MATERIAL AND IASPRDOPR.WORKCENTER = ADKOPR.TEZGAHKODU AND IASPRDRST.TOOLNUM = ADKOPR.KALIP AND IASPRDOPR.STEXT = ADKOPR.OPERASYON AND IASPRDORDER.COMPANY = ADKOPR.COMPANY ORDER BY ADKOPR.MUTBAKATDATE desc), 1) AS op_plan_pos_te, 
                IASPRDOPR.STATUS3 AS closed,
                IASPRDOPR.STATUS4 AS in_production,
                (IASPRDORDER.COMPANY + '-' + IASPRDORDER.PLANT + '-' + IASPRDOPR.WORKCENTER) AS op_plan_pos_custom_machine_id, 
                (IASPRDORDER.COMPANY + '-' + IASPRDORDER.PLANT + '-' + IASPRDRST.TOOLNUM) AS op_plan_pos_custom_tool_id, 
                COALESCE((SELECT TOP 1 KALIPGOZ FROM ADKOPR WHERE IASPRDORDER.MATERIAL = ADKOPR.MATERIAL AND IASPRDOPR.WORKCENTER = ADKOPR.TEZGAHKODU AND IASPRDRST.TOOLNUM = ADKOPR.KALIP AND IASPRDOPR.STEXT = ADKOPR.OPERASYON AND IASPRDORDER.COMPANY = ADKOPR.COMPANY ORDER BY ADKOPR.MUTBAKATDATE desc), 1) AS op_plan_pos_cavity, 
                IASPRDOPR.OPERATION as custom_op_plan_pos,
				IASPRDOPR.STEXT as op_plan_pos_name,
                IASPRDOPR.OUTPUT AS op_plan_pos_registered_quantity
            FROM IASPRDORDER 
            JOIN IASPRDOPR 
                ON IASPRDORDER.PRDORDER = IASPRDOPR.PRDORDER AND IASPRDORDER.COMPANY = IASPRDOPR.COMPANY AND IASPRDORDER.CLIENT = IASPRDOPR.CLIENT AND IASPRDORDER.PLANT = IASPRDOPR.PLANT
            LEFT JOIN IASPRDRST 
                ON IASPRDORDER.PRDORDER = IASPRDRST.PRDORDER AND IASPRDORDER.COMPANY = IASPRDRST.COMPANY AND IASPRDORDER.CLIENT = IASPRDRST.CLIENT AND IASPRDORDER.PLANT = IASPRDRST.PLANT AND IASPRDRST.TOOLNUM like 'AD%'
            WHERE IASPRDORDER.COMPANY in ('01', '03') AND IASPRDORDER.STARTDATE > '2022'
            ORDER BY IASPRDORDER.PRDORDER, IASPRDOPR.OPERATION";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $prod_orders = $stmt->fetchAll();

        $records = collect();

        $customOpPlanPos = collect([]);
        $opPlanPosName = collect([]);
        $opPlanPosStatus = collect([]);
        $opPlanPosTe = collect([]);
        $opPlanPosCavity = collect([]);
        $opPlanPosStart = collect([]);
        $opPlanPosEnd = collect([]);
        $opPlanPosCustomMachineId = collect([]);
        $opPlanPosCustomToolId = collect([]);

        $lastCustomId = '';
        $lastCustomPos = '';
        $lastCustomItemId = '';
        $lastQuantity = '';
        $lastStart = '';
        $lastEnd = '';

        foreach ($prod_orders as $prod_order) {

            if (strlen($lastCustomId) && $prod_order['custom_id'] != $lastCustomId) {
                $records->push([
                    'custom_id' => $lastCustomId,
                    'custom_pos' => $lastCustomPos,
                    'custom_item_id' => $lastCustomItemId,
                    'quantity' => $lastQuantity,
                    'start' => $lastStart,
                    'end' => $lastEnd,
                    'custom_op_plan_pos' => $customOpPlanPos,
                    'op_plan_pos_name' => utf8_encode($opPlanPosName),
                    'op_plan_pos_status' => $opPlanPosStatus,
                    'op_plan_pos_te' => $opPlanPosTe,
                    'op_plan_pos_cavity' => $opPlanPosCavity,
                    'op_plan_pos_start' => $opPlanPosStart,
                    'op_plan_pos_end' => $opPlanPosEnd,
                    'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
                    'op_plan_pos_custom_tool_id' => $opPlanPosCustomToolId,
                ]);

                $customOpPlanPos = collect([]);
                $opPlanPosName = collect([]);
                $opPlanPosStatus = collect([]);
                $opPlanPosTe = collect([]);
                $opPlanPosCavity = collect([]);
                $opPlanPosStart = collect([]);
                $opPlanPosEnd = collect([]);
                $opPlanPosCustomMachineId = collect([]);
                $opPlanPosCustomToolId = collect([]);
            }

            $customOpPlanPos->add($prod_order['custom_op_plan_pos']);
            $opPlanPosName->add($prod_order['op_plan_pos_name']);


            $op_plan_pos_status = ProdOrderPosOperationStatus::PLANNED();
            if ($prod_order['closed']) {
                $op_plan_pos_status = ProdOrderPosOperationStatus::CLOSED();
            } else if ($prod_order['in_production']) {
                $op_plan_pos_status = ProdOrderPosOperationStatus::IN_PRODUCTION();
            }

            $opPlanPosStatus->add($op_plan_pos_status);
            $opPlanPosTe->add($prod_order['op_plan_pos_te']);
            $opPlanPosCavity->add($prod_order['op_plan_pos_cavity']);

            $erpDbStartDate = Carbon::createFromTimeString($prod_order['op_plan_pos_start']);
            $erpDbEndDate = Carbon::createFromTimeString($prod_order['op_plan_pos_end']);

            // request from Elias
            if ($erpDbStartDate->year < 2020) {
                $erpDbStartDate = Carbon::now();
                $erpDbEndDate = Carbon::now();
            }
            $opPlanPosStart->add($erpDbStartDate->format('Ymd'));
            $opPlanPosEnd->add($erpDbEndDate->format('Ymd'));

            $opPlanPosCustomMachineId->add($prod_order['op_plan_pos_custom_machine_id']);
            $opPlanPosCustomToolId->add($prod_order['op_plan_pos_custom_tool_id']);

            $lastCustomId = $prod_order['custom_id'];
            $lastCustomPos = $prod_order['custom_pos'];
            $lastCustomItemId = $prod_order['custom_item_id'];
            $lastQuantity = $prod_order['quantity'];
            $lastStart = Carbon::createFromTimeString($prod_order['pos_start'])->format('Ymd');
            $lastEnd = Carbon::createFromTimeString($prod_order['pos_end'])->format('Ymd');
        }

        $records->push([
            'custom_id' => $lastCustomId,
            'custom_pos' => $lastCustomPos,
            'custom_item_id' => $lastCustomItemId,
            'quantity' => $lastQuantity,
            'start' => $lastStart,
            'end' => $lastEnd,
            'custom_op_plan_pos' => $customOpPlanPos,
            'op_plan_pos_name' => $opPlanPosName,
            'op_plan_pos_status' => $opPlanPosStatus,
            'op_plan_pos_te' => $opPlanPosTe,
            'op_plan_pos_cavity' => $opPlanPosCavity,
            'op_plan_pos_start' => $opPlanPosStart,
            'op_plan_pos_end' => $opPlanPosEnd,
            'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
            'op_plan_pos_custom_tool_id' => $opPlanPosCustomToolId,
        ]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function boms(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function tools(): Collection
    {

        $query = "SELECT (x.COMPANY + '-' + x.PLANT + '-' + x.MATERIAL) AS custom_id, x.STEXT AS name, mop.MATSTAT AS is_active
            FROM IASMATMOP AS mop
            JOIN IASMATX AS x ON x.MATERIAL = mop.MATERIAL AND x.COMPANY = mop.COMPANY AND x.CLIENT = mop.CLIENT AND x.PLANT = mop.PLANT
            JOIN IASMATBASIC AS mb ON mb.MATERIAL = mop.MATERIAL AND mb.COMPANY = mop.COMPANY AND mb.CLIENT = mop.CLIENT
            WHERE x.LANGU = 'T' AND x.TEXTTYPE = 'P' AND
                x.VALIDFROM < GETDATE() AND x .VALIDUNTIL > GETDATE() AND
                mop.VALIDFROM < GETDATE() AND mop .VALIDUNTIL > GETDATE() AND
                mop.COMPANY in ('01', '03') AND 
                mb.MATTYPE = 'KALP'";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                'is_active' => $result['is_active'] == 'A',
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function warehouses(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function stocks(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function callOffs(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function shiftModels(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function capacities($skip, $take): array|false
    {
        return false;
    }

    public function customers(): Collection
    {
        $query = "SELECT x.CUSTOMER AS custom_id, 
                x.NAME1 AS name, 
                ((x.ISDELETE -1) * -1) AS is_active
            FROM IASCUSTOMER x 
            WHERE x.ACCLASS = 'M' AND
                x.COMPANY in ('01', '03')";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                'is_active' => $result['is_active'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $query = "SELECT x.CUSTOMER AS custom_id, 
                x.NAME1 AS name, 
                ((x.ISDELETE -1) * -1) AS is_active
            FROM IASCUSTOMER x 
            WHERE x.ACCLASS = 'T' AND
                x.COMPANY in ('01', '03')";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                'is_active' => $result['is_active'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function users(): Collection
    {
        $query = "SELECT DISTINCT IASHCMPER.PERSID AS custom_id, 
                IASHCMPER.DISPLAY AS name, 
                ((IASHCMPER.EMPLTYPE -1) * -1) AS is_active,
                IASHCMPER.CONTACTNUM AS chip_number,
                IASROU008.RESPONSIBLE AS bde_number
            FROM IASHCMPER 
            LEFT JOIN IASROU008 
                ON IASHCMPER.CLIENT=IASROU008.CLIENT
			AND IASHCMPER.CONTACTNUM=IASROU008.PERSID
			AND IASROU008.COMPANY in ('01', '03')";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'UTF-8', 'UTF-8'),
                'is_active' => $result['is_active'],
                'chip_number' => $result['chip_number'],
                'bde_number' => $result['bde_number'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }
}

<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource\TimeLine;

use App\Enums\ProdOrderPosOperationStatus;
use App\ExternalDataSource\BaseVisuExternalDataSource;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class TimeLineExternalDataSource extends BaseVisuExternalDataSource
{
    //Connection to the ERP DB
    protected PDO $erp_db;

    public function __construct()
    {
        parent::__construct();
    }

    public function itemDtos($skip, $take): array|false
    {
        $skip++;
        $query = "select 
            TOP {$take}
            START AT {$skip}
            artnr as custom_id,
            bez1 as name, 
            (IF artgrp = 'LEGIERUNG' THEN 1 ELSE 0 ENDIF ) as is_alloy, 
            (IF ISNULL(artikeltyp_vk, 0) = 1 THEN 1 ELSE 0 ENDIF ) as is_sales_item, 
            (IF ISNULL(artikeltyp_prod, 0) = 1 THEN 1 ELSE 0 ENDIF ) as is_prod_item,
            (IF ISNULL(sperrkz, 0) = 1 THEN 1 ELSE 0 ENDIF ) as is_active
        FROM art 
        WHERE 
            NOT bez1 IS NULL AND
            (artgrp IN ('LEGIERUNG') OR 
            artikeltyp_prod = 1 OR 
            artikeltyp_vk = 1)
        ORDER BY artnr";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = [];
        foreach ($results as $result) {
            $records[] = new ItemDto(
                custom_id: $result['custom_id'],
                name: $result['name'],
                is_alloy: $result['is_alloy'],
                is_active: $result['is_active'],
                is_sales_item: $result['is_sales_item'],
            );
        }

        return $records;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT trim(kst.id) as custom_id, 
                trim(kst.bez1) as name, 
                (IF kst.status = 10 THEN 1 ELSE 0 ENDIF ) as is_active
            FROM kst WHERE kst.typ = 10 or kst.typ = 20";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push(new MachineDto(
                custom_id: $result['custom_id'],
                name: $result['name'],
                is_active: $result['is_active'],

            ));
        }

        return $records->toArray();
    }

    public function halls(): Collection
    {
        $records = collect([]);

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

    public function prodOrders(string|null $onlyCustomId): Collection
    {
        $query = $this->getProdOrderQuery();

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

            if (strlen($lastCustomId) && $lastCustomItemId && ($prod_order['custom_id'] != $lastCustomId || $prod_order['custom_item_id'] != $lastCustomItemId)) {
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
            if ($prod_order['op_plan_pos_status'] == 30) {
                $op_plan_pos_status = ProdOrderPosOperationStatus::IN_PRODUCTION();
            } else if ($prod_order['op_plan_pos_status'] == 99) {
                $op_plan_pos_status = ProdOrderPosOperationStatus::CLOSED();
            }

            $opPlanPosStatus->add($op_plan_pos_status);
            $opPlanPosTe->add($prod_order['op_plan_pos_te']);
            $opPlanPosCavity->add($prod_order['op_plan_pos_cavity']);
            $opPlanPosStart->add($prod_order['op_plan_pos_start'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_start'])->format('Ymd') : now()->format('Ymd'));
            $opPlanPosEnd->add($prod_order['op_plan_pos_end'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_end'])->format('Ymd') : now()->format('Ymd'));
            $opPlanPosCustomMachineId->add($prod_order['op_plan_pos_custom_machine_id']);
            $opPlanPosCustomToolId->add($prod_order['op_plan_pos_custom_tool_id']);

            $lastCustomId = $prod_order['custom_id'];
            $lastCustomPos = $prod_order['custom_pos'];
            $lastCustomItemId = $prod_order['custom_item_id'];
            $lastQuantity = $prod_order['quantity'];
            $lastStart = $prod_order['pos_start'] ? Carbon::createFromTimeString($prod_order['pos_start'])->format('Ymd') : now()->format('Ymd');
            $lastEnd = $prod_order['pos_end'] ? Carbon::createFromTimeString($prod_order['pos_end'])->format('Ymd') : now()->format('Ymd');
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
        $query = "SELECT kst.id as custom_id, 
                kst.bez1 as name, 
                (IF kst.status = 10 THEN 1 ELSE 0 ENDIF ) as is_active
            FROM kst 
            WHERE 
                NOT kst.bez1 IS NULL AND
                kst.typ = 40";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['is_active'],
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
        $query = "SELECT 
                    pers.nr AS custom_id,
                    pers.name1 AS `name`,
                    pers.sperrkz AS is_active
                FROM 
                    pers
                WHERE
                    pers.typ = 1";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['is_active'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $query = "SELECT 
                    pers.nr AS custom_id,
                    pers.name1 AS `name`,
                    pers.sperrkz AS is_active
                FROM 
                    pers
                WHERE
                    pers.typ = 2";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['is_active'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function users(): Collection
    {
        $query = $this->getUsersQuery();

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['is_active'],
                'chip_number' => $result['chip_number'],
                'username' => $result['username'],
                'email' => mb_convert_encoding($result['email'], 'ISO-8859-1', 'UTF-8'),
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function itemStates(): Collection
    {
        $query = "SELECT 
                    qs_fehler.id AS custom_id,
                    qs_fehler.bez AS `name`
                FROM 
                    qs_fehler
                WHERE
                    qs_fehler.typ = 10";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => 1
            ]);
        }

        return $records;
    }

    /**
     * @return string
     */
    public function getProdOrderQuery(): string
    {
        return "SELECT 
            bab.nr as custom_id,
            10 as custom_pos,
            bab.art_nr as custom_item_id,
            bab.menge_bab as quantity,
            (select MIN(einplan_afo.beginn) from einplan_afo WHERE einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr) as pos_start,
            (select MIN(einplan_afo.ende) from einplan_afo WHERE einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr) as pos_end,
            bab_afo.afo_nr as custom_op_plan_pos,
            bab_afo.bez1 as op_plan_pos_name,
            bab_afo.status as op_plan_pos_status,
            kst_mac.id as op_plan_pos_custom_machine_id,
            kst_wkz.id as op_plan_pos_custom_tool_id,
            bab_afo.stueck_pro_te as op_plan_pos_cavity,
            einplan_afo.beginn as op_plan_pos_start,
            einplan_afo.ende as op_plan_pos_end,
            bab_afo.te / bab_afo.stueck_pro_te * bab_afo.rueckm_faktor * 60 AS op_plan_pos_te
        FROM bab 
        JOIN bab_afo on bab.nr = bab_afo.bab_nr and bab.typ = bab_afo.bab_typ and bab.liefertermin > '2023'
        LEFT JOIN einplan_afo ON einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr and einplan_afo.beginn > '2023'
        LEFT JOIN (bab_res 
            LEFT JOIN kst as kst_mac ON kst_mac.id = bab_res.kst_id AND kst_mac.typ in (10, 20))
            ON bab_res.bab_nr = bab.nr AND bab_res.afo_nr = bab_afo.afo_nr AND bab.typ = bab_res.bab_typ
        LEFT JOIN (bab_res as wkz 
            LEFT JOIN kst as kst_wkz ON kst_wkz.id = wkz.kst_id AND kst_wkz.typ = 40)
            ON wkz.bab_nr = bab.nr AND wkz.afo_nr = bab_afo.afo_nr AND bab.typ = wkz.bab_typ
        WHERE NOT bab.art_nr IS NULL and bab.typ = 20
        ORDER BY bab.nr, bab_afo.afo_nr";
    }

    /**
     * @return string
     */
    public function getUsersQuery(): string
    {
        return "SELECT trim(mitarb.kuerzel) as custom_id, 
                trim(mitarb.name + ' ' + mitarb.zeile1) as name, 
                (IF mitarb.ausgeschieden IS NULL THEN 1 ELSE 0 ENDIF ) as is_active,
                trim(mitarb.karten_nr) as chip_number,
                trim(mitarb.email) as email,
                trim(users.name) as username 
            FROM mitarb 
            LEFT OUTER JOIN users ON users.id = mitarb.user_id
                WHERE LENGTH(trim(mitarb.name)) > 0";
    }
}

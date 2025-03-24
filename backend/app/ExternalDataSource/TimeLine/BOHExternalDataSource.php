<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource\TimeLine;

use App\ExternalDataSource\Dto\ItemDto;
use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class BOHExternalDataSource extends TimeLineExternalDataSource
{
    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:erpdb", "schertech", "Bohai123456#");
    }

    public function itemDtos($skip, $take): array|false
    {
        $skip++;
        $query = "select 
            TOP {$take}
            START AT {$skip}
            artnr as custom_id,
            bez1 as name, 
            (IF gs_artikeltyp = 40 THEN 1 ELSE 0 ENDIF ) as is_alloy
        FROM art 
        WHERE 
            NOT bez1 IS NULL
        ORDER BY artnr";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $dtos = [];
        foreach ($results as $result) {
            $dtos[] = new ItemDto(
                $result['custom_id'],
                $result['name'],
                is_alloy: $result['is_alloy'],
            );
        }

        return $dtos;
    }

    public function tools(): Collection
    {
        $query = "SELECT wz.id as custom_id, 
                wz.bez as name
            FROM wz 
            WHERE 
                NOT wz.bez IS NULL";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => true,
            ]);
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }


    public function customers(): Collection
    {
        $query = "SELECT 
                    pers.nr AS custom_id,
                    pers.name1 AS `name`
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
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $query = "SELECT 
                    pers.nr AS custom_id,
                    pers.name1 AS `name`
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
                'name' => $result['name']
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }


    /**
     * @return string
     */
    public function getProdOrderQuery(): string
    {
        return "SELECT 
            bab.nr as custom_id,
            10 as custom_pos,
            coalesce(k.artnr, bab.art_nr) as custom_item_id,
            bab.menge_bab as quantity,
            (select MIN(einplan_afo.beginn) from einplan_afo WHERE einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr) as pos_start,
            (select MIN(einplan_afo.ende) from einplan_afo WHERE einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr) as pos_end,
            bab_afo.afo_nr as custom_op_plan_pos,
            bab_afo.bez1 as op_plan_pos_name,
            bab_afo.status as op_plan_pos_status,
            kst_mac.id as op_plan_pos_custom_machine_id,
            wz.id as op_plan_pos_custom_tool_id,
            bab_afo.stueck_pro_te as op_plan_pos_cavity,
            einplan_afo.beginn as op_plan_pos_start,
            einplan_afo.ende as op_plan_pos_end,
            bab_afo.te / bab_afo.stueck_pro_te * bab_afo.rueckm_faktor * 60 AS op_plan_pos_te
        FROM bab 
        JOIN bab_afo on bab.nr = bab_afo.bab_nr and bab.typ = bab_afo.bab_typ and bab.liefertermin > '2023'
        LEFT JOIN einplan_afo ON einplan_afo.bab_nr = bab.nr and bab_afo.afo_nr = einplan_afo.afo_nr
        LEFT JOIN (bab_res 
            LEFT JOIN kst as kst_mac ON kst_mac.id = bab_res.kst_id AND kst_mac.typ in (10, 20))
            ON bab_res.bab_nr = bab.nr AND bab_res.afo_nr = bab_afo.afo_nr  AND bab.typ = bab_res.bab_typ
        LEFT JOIN wz ON wz.id = bab.wz
        LEFT JOIN bab_koppelprod as k on k.bab_nr = bab.nr
        WHERE (NOT bab.art_nr IS NULL OR NOT k.artnr IS NULL) AND bab.menge_bab > 0
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
                trim(mitarb.kuerzel) as username 
            FROM mitarb 
            LEFT OUTER JOIN users ON users.id = mitarb.user_id
                WHERE LENGTH(trim(mitarb.name)) > 0";
    }
}

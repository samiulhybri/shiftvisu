<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource\TimeLine;

use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class AGVSExternalDataSource extends TimeLineExternalDataSource
{
    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT trim(id) as custom_id, 
                trim(bez) as name, 
                (IF status = 10 THEN 1 ELSE 0 ENDIF ) as is_active
            FROM schertech.v_st_maschinen";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push(
                new MachineDto(
                    custom_id: $result['custom_id'],
                    name: mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                    is_active: $result['is_active'],
                ));
        }

        return $records->toArray();
    }

    public function itemDtos($skip, $take): array|false
    {
        $skip++;
        //(IF legierg != '' THEN 1 ELSE 0 ENDIF ) as is_alloy,
        //(IF sperrkz = 2 THEN 0 ELSE 1 ENDIF ) as is_active,

        # TODO: Will be used when images are available
        $query = "select 
            TOP {$take}
            START AT {$skip}
            v_st_teile.artnr as custom_id,
            (bez1 + ' ' + bez2 + ' ' + suchwort) as name,
            gewicht as total_weight,
            'kg' as unit_of_measure_id_custom,
            content as item_image_blob
        FROM schertech.v_st_teile LEFT JOIN schertech.v_st_fotos ON v_st_teile.hybrid = v_st_fotos.hybrid
        ORDER BY v_st_teile.artnr";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $dtos = [];
        foreach ($results as $result) {
            $dto = new ItemDto(
                custom_id: $result['custom_id'],
                name: mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                total_weight: $result['total_weight'],
                unit_of_measure_id_custom: $result['unit_of_measure_id_custom']
            );
            if(isset($result['item_image_blob'])) {
                $binaryData = hex2bin($result['item_image_blob']);

                $dto->image_exists = true;
                $dto->image_name = $result['custom_id'];
                $dto->image_blob = $binaryData;
                $dto->file_extension = '.jpg';
            } else {
                $dto->image_exists = false;
            }
            $dtos[] = $dto;
        }

        return $dtos;
    }

    public function tools(): Collection
    {
        $query = "SELECT id as custom_id, 
                bez as name
            FROM schertech.v_st_werkzeug";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                'is_active' => true,
            ]);
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }


    public function customers(): Collection
    {
        $query = "SELECT 
                    nr AS custom_id,
                    name1 AS `name`
                FROM schertech.v_st_kunde";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                'is_active' => true,
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $records = collect();
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function machineStates(): Collection
    {
        //TODO: Ask alex for permission to import without group as there is no group assigned
        $query = "SELECT 
                    id AS custom_id,
                    bez AS `name`
                FROM 
                    v_st_stoergrund";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        //'machine_state_custom_id' => null, <- this would be ignored currently anyway
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                'is_active' => true,
            ]);
        }
        return $records;
    }

    public function itemStates(): Collection
    {
        $query = "SELECT 
                    id AS custom_id,
                    bez AS `name`
                FROM v_st_fehler";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => mb_convert_encoding($result['name'], 'utf-8', 'utf-8'),
                'is_active' => true,
            ]);
        }
        return $records;
    }


    /**
     * @return string
     */
    public function getProdOrderQuery(): string
    {
        //bab_afo.bez1 as op_plan_pos_name,
        return "SELECT 
            order_nr as custom_id,
            10 as custom_pos,
            menge as quantity,
            STRING(datum, ' 00:00:00') as pos_start,
            STRING(datum, ' 23:59:00') as pos_end,
            artnr as custom_item_id,
            order_nr as op_plan_pos_name,
            afo_nr as custom_op_plan_pos,
            status as op_plan_pos_status,
            kst_id as op_plan_pos_custom_machine_id,
            werkzeug as op_plan_pos_custom_tool_id,
            nester as op_plan_pos_cavity,
            STRING(datum, ' 00:00:00') as op_plan_pos_start,
            STRING(datum, ' 23:59:00') as op_plan_pos_end,
            te * 60 AS op_plan_pos_te
        FROM schertech.v_st_auftrag
        ORDER BY order_nr, afo_nr";
    }


    /**
     * @return string
     */
    public function getUsersQuery(): string
    {
        return "SELECT 
                    trim(kuerzel) as custom_id, 
                    trim(name) as name, 
                    (IF status = 1 THEN 0 ELSE 1 ENDIF ) as is_active,
                    trim(kuerzel) as username,
                    trim(email) as email,
                    trim(karten_nr) as chip_number
                FROM schertech.v_st_mitarbeiter";
    }
}

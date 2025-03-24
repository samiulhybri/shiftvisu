<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\ExternalDataSource\Dto\DepartmentDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\ExternalDataSource\Dto\TpmSubGroupDto;
use DateTime;
use Illuminate\Support\Collection;
use PDO;

class SKTExternalDataSource extends BaseVisuExternalDataSource
{
    private PDO $erp_db;

    /**
     * This connection is needed for tools.
     * As In SKT Tools also come from werkzeuge database.
     */
    private PDO $sktToolVisuDbConnection;
    private PDO $oldBaseVisuDb;
    private PDO $settingsDbOld;

    public function __construct()
    {
        // skt db credential.
        define('SKT_DB_HOST', env('OLD_DB_HOST'));
        define('SKT_DB_PORT', env('OLD_DB_PORT'));
        define('SKT_DB_USERNAME', env('OLD_DB_USERNAME'));
        define('SKT_DB_PASSWORD', env('OLD_DB_PASSWORD'));

        parent::__construct();

        // ERP connection of skt
        $this->erp_db = new PDO("dblib:host=" . env('ERP_HOST') . ";", env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->erp_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Tool visu (werkzeuge) DB Connection
        $this->sktToolVisuDbConnection = new PDO("mysql:host=" . SKT_DB_HOST . ";port=" . SKT_DB_PORT . ";dbname=werkzeuge;charset=utf8mb4", SKT_DB_USERNAME, SKT_DB_PASSWORD);
        $this->sktToolVisuDbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // old skt base visu connection
        $this->oldBaseVisuDb = new PDO("mysql:host=" . SKT_DB_HOST . ";port=" . SKT_DB_PORT . ";dbname=base_visu;charset=utf8mb4", SKT_DB_USERNAME, SKT_DB_PASSWORD);
        $this->oldBaseVisuDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->settingsDbOld = new PDO("mysql:host=" . SKT_DB_HOST . ";port=" . SKT_DB_PORT . ";dbname=settings;charset=utf8mb4", SKT_DB_USERNAME, SKT_DB_PASSWORD);
        $this->settingsDbOld->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function itemDtos($skip, $take): array|false
    {
        $query = "SELECT 
            RTRIM(LTRIM(ARCODART)) AS custom_id, RTRIM(LTRIM(ARDESART)) AS [name], RTRIM(LTRIM(ARDTOBSO)) as exp_date 
            FROM AHR_SCHERER.dbo.SCHERART_ICOL
            ORDER BY RTRIM(LTRIM(ARCODART))
            OFFSET {$skip} ROWS
            FETCH NEXT {$take} ROWS ONLY";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = [];
        foreach ($results as $result) {
            $records[] = new ItemDto(
                $result['custom_id'],
                $result['name'],
                (new DateTime() <= new DateTime($result['exp_date']) || !$result['exp_date']) ? 1 : 0
            );
        }

        return $records;
    }

    private function sktBaseVisuMachines(): Collection
    {
        // base visu
        $machines = [];
        $query = "SELECT trim(m.maschinenr) AS custom_id,
                trim(m.maschinenbez) AS name,
                m.maschinengruppe_tpm AS custom_tpm_sub_group_id,
                m.tpmvisu AS is_enabled_for_tpm_visu,
                h.hallenr AS custom_hall_id,
                mg.value AS custom_machine_group_id,
                m.nutzung_percentage / 100 as usage_factor,
                1 as is_active
            FROM sd_maschine as m
            LEFT JOIN t_base_combo as mg on mg.type = 1 and m.maschinengruppe = mg.id 
            LEFT JOIN sd_halle as h on h.id = m.halle";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $machines = $stmt->fetchAll();
        $records = collect($machines);
        return $records->map(
            function ($machine) {
                return new MachineDto(
                    custom_id: $machine['custom_id'],
                    name: $machine['name'],
                    is_active: $machine['is_active'],
                    machine_group_id_custom: $machine['custom_machine_group_id'],
                    tpm_sub_group_id_custom: $machine['custom_tpm_sub_group_id'],
                    usage_factor: $machine['usage_factor'],
                    hall_id_custom: $machine['custom_hall_id'],
                    is_enabled_for_tpm_visu: $machine['is_enabled_for_tpm_visu'],
                );
            }
        );
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $v9BaseVisuMachines = $this->sktBaseVisuMachines();
        $query = "SELECT RTRIM(LTRIM(SCHERTAB_RISO.RICODICE)) AS custom_id, RTRIM(LTRIM(SCHERTAB_RISO.RIDESCRI)) AS [name] FROM AHR_SCHERER.dbo.SCHERTAB_RISO WHERE SCHERTAB_RISO.RICODICE != 'F01'";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push(
                new MachineDto(
                    custom_id: $result['custom_id'],
                    name: $result['name'],
                ),
            );
        }
        return $v9BaseVisuMachines->merge($records)->toArray();
    }

    public function operations(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function tools(): Collection
    {
        $query = "SELECT trim(toolingid) AS custom_id, trim(toolingname) AS `name`, toolingenabled from werkzeuge.v_tooling";
        $results = [];
        $stmt = $this->sktToolVisuDbConnection->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['toolingenabled'] ? 1 : 0
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function halls(): Collection
    {
        $query = 'SELECT hallenr AS custom_id,
                hallebez AS name,
                planvisu AS is_enabled_plan_visu,
                aktiv_inaktiv AS is_active
            FROM sd_halle';

        $halls = [];
        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $halls = $stmt->fetchAll();

        $records = collect($halls);
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

    public function customers(): Collection
    {
        $query = "SELECT RTRIM(LTRIM(ANCODICE)) as custom_id, RTRIM(LTRIM(ANDESCRI)) as [name], 1 as is_active FROM AHR_SCHERER.dbo.SCHERCONTI WHERE ANTIPCON = 'C' ";

        $results = [];
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $query = "SELECT RTRIM(LTRIM(ANCODICE)) as custom_id, RTRIM(LTRIM(ANDESCRI)) as [name], 1 as is_active FROM AHR_SCHERER.dbo.SCHERCONTI WHERE ANTIPCON = 'F' ";

        $results = [];
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function users(): Collection
    {
        $query =
            "SELECT 
                LTRIM(RTRIM(a.DPCODICE)) AS custom_id,
                LTRIM(RTRIM(a.DPNOME)) AS first_name,
                LTRIM(RTRIM(a.DPCOGNOM)) AS last_name,
                LTRIM(RTRIM(a.DPINDMAI)) AS email,
                a.DPDATFRA AS end_t
            FROM 
                AHR_SCHERER.dbo.SCHERDIPENDEN a
            WHERE
                LTRIM(RTRIM(a.DPNOME)) <> '' AND LTRIM(RTRIM(a.DPCOGNOM)) <> ''";

        $results = [];
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['first_name'] . " " . $result['last_name'],
                'email' => $result['email'],
                'username' => ($result['first_name'] == "") ? "u_" . $result['custom_id'] : ((strpos($result['first_name'], " ")) ? strtolower(substr($result['first_name'], 0, (strpos($result['first_name'], " ")))) . $result['custom_id'] : $result['first_name'] . $result['custom_id']),
                'is_active' => $this->getActiveStatus($result['end_t']),
            ]);
        }

        $baseVisuRecords = $records->chunk(env('DATA_CHUNK_SIZE'));

        $baseVisuRecords = $baseVisuRecords->merge(parent::users());
        $this->base_visu_db = $this->oldBaseVisuDb;
        $baseVisuRecords = $baseVisuRecords->merge(parent::users());
        parent::__construct();
        return $baseVisuRecords;
    }

    private function getActiveStatus($endDate)
    {
        if (!$endDate) {
            return 1;
        }

        $currentDate = new DateTime(date('d.m.Y'));
        $calculatedDate = new DateTime(date('d.m.Y', strtotime($endDate)));

        return $calculatedDate > $currentDate ? 1 : 0;
    }

    public function departmentDtos(int $skip, int $take): array|false
    {
        if ($skip != 0) {
            return false;
        }

        // prepare a map for hall id to nr (custom_id)
        $sql = "SELECT id, hallenr FROM sd_halle";
        $stmt = $this->oldBaseVisuDb->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $halls = $stmt->fetchAll();

        $hallIdNrMap = [];
        foreach ($halls as $hall) {
            $hallIdNrMap[$hall['id']] = $hall['hallenr'];
        }

        $query = "SELECT id, `name`, dept_id, `value` FROM t_base_combo WHERE `type` = 19";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $hallIds = !$result['dept_id'] ? [] : explode(",", $result['dept_id']);
            $hallCustomIds = [];
            foreach ($hallIds as $hallId) {
                $hallCustomIds[] = isset($hallIdNrMap[$hallId]) ? $hallIdNrMap[$hallId] : null;
            }

            $records->push(
                new DepartmentDto(
                    custom_id: $result['value'],
                    name: $result['name'],
                    is_active: 1,
                    hall_ids_custom: $hallCustomIds
                )
            );
        }
        return $records->toArray();
    }

    public function tpmGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT id AS custom_id, `name` FROM t_base_combo WHERE `type` = 22";

        $results = [];
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->map(
            fn($record) => new TpmGroupDto(
                custom_id: $record['custom_id'],
                name: $record['name']
            )
        )->toArray();
    }

    public function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT id AS custom_id, `name`, `value` AS custom_tpm_group_id FROM t_base_combo WHERE `type` = 3";

        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->map(
            fn($record) => new TpmSubGroupDto(
                custom_id: $record['custom_id'],
                name: $record['name'],
                tpm_group_id_custom: $record['custom_tpm_group_id']
            )
        )->toArray();

    }

    public function settings(): Collection
    {
        $records = parent::settings();
        $this->settings_db = $this->settingsDbOld;
        $records = $records->merge(parent::settings());
        parent::__construct();
        return $records;
    }

}

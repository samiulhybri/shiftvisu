<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\Enums\UserType;
use App\ExternalDataSource\Dto\DepartmentDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\MachineGroupDto;
use App\ExternalDataSource\Dto\MachineStateDto;
use App\ExternalDataSource\Dto\MachineStateGroupDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\ExternalDataSource\Dto\TpmSubGroupDto;
use App\ExternalDataSource\Dto\UserDto;
use DateTime;
use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class AutotestExternalDataSource extends BaseVisuExternalDataSource
{
    private PDO $erp_db;

    private PDO $autotestToolVisuDbConnection;
    private PDO $oldBaseVisuDb;
    private PDO $settingsDbOld;

    public function __construct()
    {
        // Autotest db credential.
        define('AT_DB_HOST', env('OLD_DB_HOST'));
        define('AT_DB_PORT', env('OLD_DB_PORT'));
        define('AT_DB_USERNAME', env('OLD_DB_USERNAME'));
        define('AT_DB_PASSWORD', env('OLD_DB_PASSWORD'));

        parent::__construct();

        // ERP connection of Autotest
        $this->erp_db = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->erp_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->oldBaseVisuDb = new PDO("mysql:host=" . AT_DB_HOST . ";port=" . AT_DB_PORT . ";dbname=base_visu;charset=utf8mb4", AT_DB_USERNAME, AT_DB_PASSWORD);
        $this->oldBaseVisuDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->settingsDbOld = new PDO("mysql:host=" . AT_DB_HOST . ";port=" . AT_DB_PORT . ";dbname=settings;charset=utf8mb4", AT_DB_USERNAME, AT_DB_PASSWORD);
        $this->settingsDbOld->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->autotestToolVisuDbConnection = new PDO("mysql:host=" . AT_DB_HOST . ";port=" . AT_DB_PORT . ";dbname=settings;charset=utf8mb4", AT_DB_USERNAME, AT_DB_PASSWORD);
        $this->autotestToolVisuDbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->autotestToolVisuDbConnection = new PDO("mysql:host=" . AT_DB_HOST . ";port=" . AT_DB_PORT . ";dbname=settings;charset=utf8mb4", AT_DB_USERNAME, AT_DB_PASSWORD);
        $this->autotestToolVisuDbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function itemDtos($skip, $take): array|false
    {
        if ($skip) {
            return false;
        }
        // TODO: "exp_date" hard-coded
        $query = "SELECT t1.[ARTIKEL] AS custom_id,  RTRIM(LTRIM(t1.[NAME])) AS name, '' AS exp_date, t2.[Kundenartikel] AS teilebez_2, '' AS blocked, t1.ARTIKELSTATUS AS status, t2.[Charge] as charge, t2.[MHD] as mhd, t2.[FIFO] as fifo, t2.[produktbuchungsgruppe] as baugruppe, t2.[Packmittel] as material, t2.[Traegerpackmittel] as part_type,t2.[Default Quantity] as default_quantity, t2.[Anzahl Packmittel] as anzahl_packmittel, t2.[Inventurwert] as inventurwert FROM dbo.ANP_ARTSTAMMDATEN_MES_INT t1 LEFT JOIN dbo.ANP_ARTSTAMMDATEN_MES_INT_PACK t2 on t1.[ARTIKEL] = t2.[ARTIKEL] WHERE t1.[NAME] IS NOT NULL";
        if ($skip) {
            return false;
        }
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

    public function machineGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT c.id AS custom_id,
                c.name AS name
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = 'maschinengruppe'";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $groups = $stmt->fetchAll();
        $groupDtos = [];
        foreach ($groups as $group) {
            $groupDtos[] = new MachineGroupDto(
                custom_id: $group["custom_id"],
                name: $group["name"]
            );
        }

        return $groupDtos;
    }

    public function tpmGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT t_base_combo.id AS custom_id,  t_base_combo.`name` FROM t_base_combo JOIN t_base_combo_type ON  t_base_combo.type = t_base_combo_type.id WHERE t_base_combo_type.name = 'main_group'";

        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $groups = $stmt->fetchAll();

        $groupDtos = [];
        foreach ($groups as $group) {
            $groupDtos[] = new TpmGroupDto(
                custom_id: $group["custom_id"],
                name: $group["name"],
            );
        }
        return $groupDtos;
    }

    public function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT c.id AS custom_id,
                c.name AS name, c.value AS tpm_group_id_custom 
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = 'maschinengruppe_tpm'";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $groups = $stmt->fetchAll();
        $groupDtos = [];
        foreach ($groups as $group) {
            $groupDtos[] = new TpmSubGroupDto(
                custom_id: $group["custom_id"],
                name: $group["name"],
                tpm_group_id_custom: $group['tpm_group_id_custom']
            );
        }

        return $groupDtos;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        // base visu v9
        $query = "SELECT trim(m.maschinenr) AS custom_id,
                trim(m.maschinenbez) AS name,
                m.maschinengruppe_tpm AS custom_tpm_sub_group_id,
                m.tpmvisu AS is_enabled_for_tpm_visu,
                h.hallenr AS custom_hall_id,
                m.maschinengruppe AS custom_machine_group_id,
                m.nutzung_percentage / 100 as usage_factor
            FROM sd_maschine as m
            LEFT JOIN sd_halle as h on h.id = m.halle";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $machinesBaseVisuV9 = $stmt->fetchAll();

        // erp
        $query = "SELECT [MAGR] AS custom_id, [NAME] AS name, [AKTIV] AS is_active FROM dbo.ANP_MASCHSTAMMDATEN_MES_INT WHERE [NAME] IS NOT NULL";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $machinesErp = $stmt->fetchAll();

        $machineDtos = [];
        foreach ($machinesBaseVisuV9 as $machine) {
            $machineDtos[$machine["custom_id"]] = new MachineDto(
                custom_id: $machine["custom_id"],
                name: $machine["name"],
                machine_group_id_custom: $machine['custom_machine_group_id'],
                tpm_sub_group_id_custom: $machine['custom_tpm_sub_group_id'],
                usage_factor: $machine['usage_factor'],
                hall_id_custom: $machine['custom_hall_id'],
                is_enabled_for_tpm_visu: $machine['is_enabled_for_tpm_visu'],
            );
        }

        foreach ($machinesErp as $machine) {
            if (isset($machineDtos[$machine["custom_id"]])) {
                $machineDtos[$machine["custom_id"]]->is_active = $machine["is_active"];
            } else {
                $machineDtos[] = new MachineDto(
                    custom_id: $machine["custom_id"],
                    name: $machine["name"],
                    is_active: $machine["is_active"],
                );
            }
        }

        return $machineDtos;
    }

    private function getHallIdToNr(): array
    {
        $halls = [];
        $query = 'SELECT hallenr AS custom_id,
                    id
                    FROM sd_halle';
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        foreach ($stmt->fetchAll() as $hall) {
            $halls[$hall['id']] = $hall['custom_id'];
        }
        return $halls;
    }


    public function machineStateGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT c.id AS custom_id,
                c.name AS name
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = 'stillstandgruppe'";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $machineStates = $stmt->fetchAll();
        $machineStateDtos = [];

        foreach ($machineStates as $machineState) {
            $machineStateDtos[] = new MachineStateGroupDto(
                custom_id: $machineState["custom_id"],
                name: $machineState["name"],
            );
        }

        return $machineStateDtos;
    }

    public function departmentDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT c.id AS custom_id,
                c.name AS name,
                c.dept_id as halls
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = 'abteilung_prod'";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $departments = $stmt->fetchAll();
        $departmentDtos = [];

        $halls = $this->getHallIdToNr();

        foreach ($departments as $department) {
            $hallCustomIds = [];
            foreach (explode(",", $department["halls"]) as $hallId) {
                $hallCustomIds[] = $halls[$hallId];
            }
            $departmentDtos[] = new DepartmentDto(
                custom_id: $department["custom_id"],
                is_active: true,
                name: $department["name"],
                hall_ids_custom: $hallCustomIds,
            );
        }

        return $departmentDtos;
    }

    public function machineStateDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT 
                t_stillstand.name as name,
                t_stillstand.value as custom_id, -- TODO: use value or id here?
                t_stillstand.gruppe_id as group_custom_id
            FROM t_stillstand";
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $machineStates = $stmt->fetchAll();
        $machineStateDtos = [];

        foreach ($machineStates as $machineState) {
            $machineStateDtos[] = new MachineStateDto(
                custom_id: $machineState["custom_id"],
                machine_state_group_id_custom: $machineState["group_custom_id"],
                name: $machineState["name"],
                is_active: true,
            );
        }

        return $machineStateDtos;
    }


    public function machineStates(): Collection
    {
        return collect();
    }

    public function machineStateGroups(): Collection
    {
        return collect();
    }

    public function operations(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function tools(): Collection
    {
        $query = "SELECT trim(werkzeugnr) AS custom_id, trim(werkzeugbez1) AS `name`, aktiv_inaktiv, hoehe AS height, breite AS width, laenge AS length, gesamtgewicht AS total_weight from sd_werkzeuge WHERE werkzeugnr <> ''";
        $results = [];
        $stmt = $this->oldBaseVisuDb->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $erp_sql = "SELECT [BMK] AS custom_id, [NAME] AS name, 1 AS aktiv_inaktiv,'' AS height, '' AS width, '' AS length, '' AS total_weight FROM dbo.ANP_WERKZSTAMMDATEN_MES_INT WHERE [BMK] IS NOT NULL AND [NAME] IS NOT NULL";

        $erp_stmt = $this->erp_db->prepare($erp_sql);
        $erp_stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $erp_stmt->execute();
        $erp_results = $erp_stmt->fetchAll();

        // Merging and filtering unique results based on custom_id
        $mergedResults = array_merge($erp_results,$results);
        $uniqueResults = [];

        foreach ($mergedResults as $item) {
            $uniqueResults[$item['custom_id']] = $item;
        }

        $records = collect();
        foreach ($uniqueResults as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['aktiv_inaktiv'] ? 1 : 0,
                'height' =>  $result['height'],
                'width' =>  $result['width'],
                'length' =>  $result['length'],
                'total_weight' =>  $result['total_weight'],
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

        $stmt = $this->oldBaseVisuDb->prepare($query);
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


    public function userDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $query = "SELECT PERSONAL as custom_id,
                    NAME as name,
                    AKTIV as is_active,
                    LOGIN as username,
                    KARTE as chip_number
                FROM dbo.ANP_MITASTAMMDATEN_MES_INT";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $userDtos = [];
        foreach ($stmt->fetchAll() as $user) {
            $userDtos[] = new UserDto(
                custom_id: $user["custom_id"],
                name: $user["name"] ?? $user["username"],
                user_type: UserType::GUEST(),
                password: "",
                username: $user["username"],
                is_active: $user["is_active"],
                chip_number: $user["chip_number"],
            );
        }


        $query = "SELECT trim(sd_mitarbeiter.mitarbeiternr) AS custom_id, trim(mitarbeiterbez) AS name, trim(email) AS email, trim(password) AS password, trim(username) as username, trim(chip_number) as chip_number, aktiv_inaktiv as is_active, vorgesetzter_flag AS is_supervisor, vorgesetzter as supervisor_1_user, '' as supervisor_2_user, kuerzel as user_short_code, CASE WHEN (user_type IS NULL OR user_type = 'g') THEN '" . UserType::GUEST() . "' ELSE '" . UserType::ADMIN() . "' END as user_type FROM sd_mitarbeiter LEFT JOIN t_user_permission ON sd_mitarbeiter.mitarbeiternr = t_user_permission.mitarbeiternr WHERE sd_mitarbeiter.mitarbeiternr != '' AND sd_mitarbeiter.username != ''";

        $oldDataStmt = $this->oldBaseVisuDb->prepare($query);
        $oldDataStmt->setFetchMode(PDO::FETCH_ASSOC);
        $oldDataStmt->execute();
        $users = $oldDataStmt->fetchAll();

        foreach ($users as $user) {
            $userDtos[] = new UserDto(
                custom_id: $user["custom_id"],
                name: $user["name"] ?? $user["username"],
                user_type: $user["user_type"],
                password: $user["password"],
                username: $user["username"],
                is_active: $user["is_active"],
                chip_number: $user["chip_number"],
                is_supervisor: $user["is_supervisor"],
                supervisor_1_id_custom: $user["supervisor_1_user"],
                supervisor_2_id_custom: $user["supervisor_2_user"],
                user_short_code: $user["user_short_code"],
                email: $user["email"],
            );
        }
        return $userDtos;
    }

    public function capacities($skip, $take): array|false
    {
        $query = "select c.shift_id as shift_model_custom_id,
                cal.date as date,
                c.company_name as client_name,
                m.maschinenr as machine_custom_id,
                sh.hallenr as hall_custom_id,
                not c.is_working as is_day_off
            from t_capacity as c
            join t_calender as cal on cal.id = c.date_id
            left join base_visu.sd_halle as sh on sh.hallebez = c.halle
            left join base_visu.sd_maschine as m on c.maschine_nr = m.maschinenr ";

        $query .= " LIMIT {$take} OFFSET {$skip}";

        $stmt = $this->capacity_planning_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $capacities = $stmt->fetchAll();

        return $capacities;
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

<?php

namespace App\ExternalDataSource;

use App\Contracts\ExternalDataSource;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\UserType;
use App\ExternalDataSource\Dto\AttributeSetDto;
use App\ExternalDataSource\Dto\CapacityDto;
use App\ExternalDataSource\Dto\EquipmentDto;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\InspectionLotDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemStateDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\MachineProdOrderPosOperationTimeDto;
use App\ExternalDataSource\Dto\MachineStateTimeDto;
use App\ExternalDataSource\Dto\MachineUserTimeDto;
use App\ExternalDataSource\Dto\OffDayDto;
use App\ExternalDataSource\Dto\PackagingInstructionDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationDto;
use App\ExternalDataSource\Dto\ProductionSupplyAreaDto;
use App\ExternalDataSource\Dto\SettingsDto;
use App\ExternalDataSource\Dto\ShiftDto;
use App\ExternalDataSource\Dto\StorageBinDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\Http\Controllers\Controller;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use PDO;

class BaseVisuExternalDataSource extends Controller implements ExternalDataSource
{
    protected ?PDO $base_visu_db = null;
    protected ?PDO $capacity_planning_db = null;
    protected ?PDO $settings_db = null;

    /**
     * shuvo (constructor parameter added)
     * I have added host, port, username and password as constructor parameter
     * Because sometimes we need to take other server's base_visu data
     * In that case we will specify the db_host, db_port, db_user_name and db_password
     *
     * Ex: For skt new server we need to take base visu data from skt_live
     * Here we will pass skt live db connection
     */
    public function __construct($host = null, $port = null, $dbUsername = null, $dbPassword = null)
    {
        $host = $host ?? env('DB_HOST'); // default value from env file
        $port = $port ?? env('DB_PORT');
        $dbUsername = $dbUsername ?? env('DB_USERNAME');
        $dbPassword = $dbPassword ?? env('DB_PASSWORD');

        if (env('V10_ENABLED', true)) {
            $this->base_visu_db = new PDO("mysql:host=" . $host . ";port=" . $port . ";dbname=base_visu;charset=utf8mb4", $dbUsername, $dbPassword);
            $this->base_visu_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->capacity_planning_db = new PDO("mysql:host=" . $host . ";port=" . $port . ";dbname=capacity_planning;charset=utf8mb4", $dbUsername, $dbPassword);
            $this->capacity_planning_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->settings_db = new PDO("mysql:host=" . $host . ";port=" . $port . ";dbname=settings;charset=utf8mb4", $dbUsername, $dbPassword);
            $this->settings_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
    }

    /**
     * @param $skip
     * @param $take
     * @return ItemDto[]|false
     */
    public function itemDtos(int $skip, int $take): array|false
    {
        if (!$this->base_visu_db)
            return false;

        $query = "SELECT trim(teilenr) AS custom_id,
                trim(teilenr) AS custom_bom_id,
                trim(teilenr) AS custom_operation_plan_id,
                trim(teilebez_1) AS name,
                CASE WHEN verkauf_teil = 1 THEN 1 ELSE 0 END AS is_sales_item,
                aktiv_inaktiv AS is_active
            FROM sd_teile
            ORDER BY trim(teilenr)
            LIMIT {$take}
            OFFSET {$skip}";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();

        $items = $stmt->fetchAll();

        $itemDtos = [];
        foreach ($items as $item) {
            $itemDtos[] = new ItemDto($item['custom_id'], $item['name'], $item['is_active']);
        }

        return $itemDtos;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip || !$this->base_visu_db)
            return false;

        $query = "SELECT trim(m.maschinenr) AS custom_id,
                trim(m.maschinenbez) AS name,
                coalesce(h.hallenr, '') AS custom_hall_id,
                coalesce(mg.id, '') AS custom_machine_group_id,
                m.nutzung_percentage / 100 as usage_factor,
                m.is_furnace,
                m.is_casting_machine,
                m.aktiv_inaktiv as is_active 
            FROM sd_maschine as m
            LEFT JOIN t_base_combo as mg on mg.type = 1 and m.maschinengruppe = mg.id 
            LEFT JOIN sd_halle as h on h.id = m.halle";
        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $machines = $stmt->fetchAll();

        return collect($machines)->map(function ($machine) {
            return new MachineDto(
                custom_id: $machine['custom_id'],
                name: $machine['name'],
                is_active: $machine['is_active'],
                machine_group_id_custom: $machine['custom_machine_group_id'],
                usage_factor: $machine['usage_factor'],
                is_furnace: $machine['is_furnace'],
                is_casting_machine: $machine['is_casting_machine'],
                hall_id_custom: $machine['custom_hall_id'],
            );
        })->toArray();
    }


    /**
     * @return Collection
     * $records->push([
     *      'custom_id' => 'HAL1',
     *      'name' => 'Giesserei',
     * ]);
     */
    public function halls(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = 'SELECT hallenr AS custom_id,
                hallebez AS name,
                planvisu AS is_enabled_plan_visu,
                aktiv_inaktiv AS is_active
            FROM sd_halle';
        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $halls = $stmt->fetchAll();

        return collect($halls)->chunk(env('DATA_CHUNK_SIZE'));
    }


    /**
     * @return Collection
     * $records->push([
     *      'custom_id' => 'G100',
     *      'name' => '100T Maschinen',
     * ]);
     */
    public function machineGroups(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = 'SELECT c.id AS custom_id,
                c.name AS name
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = "maschinengruppe"';

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        return collect($stmt->fetchAll())->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @return Collection
     * $records->push([
     *      'custom_id' => 'G100',
     *      'custom_item_id' => 'I2000',
     *      'custom_machine_id' => 'M1000',
     *      'name' => 'Giessen',
     * ]);
     */
    public function operations(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }


    public function boms(): Collection
    {
        return collect();
    }


    public function tools(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = "SELECT trim(w.werkzeugnr) AS custom_id, trim(w.werkzeugbez1) AS `name`, w.aktiv_inaktiv AS is_active FROM sd_werkzeuge w";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $tools = $stmt->fetchAll();

        return collect($tools)->chunk(env('DATA_CHUNK_SIZE'));
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
        return collect();
    }

    public function capacityDtos(int $skip, int $take): array|false
    {
        if (!$this->capacity_planning_db)
            return false;

        $query = "select sd.id as shift_custom_id,
                cal.date as date,
                m.maschinenr as machine_custom_id,
                sh.hallenr as hall_custom_id
            from t_capacity as c
            join t_calender as cal on cal.id = c.date_id
            join sd_shift_details as sd on sd.shift_id = c.shift_id
            left join base_visu.sd_halle as sh on sh.hallebez = c.halle
            left join base_visu.sd_maschine as m on m.id = c.maschine_nr
            where sd.calculate = 1 AND c.is_working = 1
            ";

        $query .= " LIMIT {$take} OFFSET {$skip}";

        $stmt = $this->capacity_planning_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $capacities = $stmt->fetchAll();

        $dtos = [];

        foreach ($capacities as $capacity) {
            $dtos[] = new CapacityDto(
                date: $capacity['date'],
                shift_id_custom: $capacity['shift_custom_id'],
                machine_id_custom: $capacity['machine_custom_id'],
                hall_id_custom: $capacity['hall_custom_id'],
            );
        }

        return $dtos;
    }

    public function shiftDtos(int $skip, int $take): array|false
    {
        if (!$this->capacity_planning_db)
            return false;

        $query = "select id,
                shift_name,
                starttime,
                endtime,
                break_time
            from sd_shift_details
            LIMIT $take OFFSET $skip";

        $stmt = $this->capacity_planning_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $shifts = $stmt->fetchAll();

        $shiftDtos = [];
        $localTimeZone = env('EXTERNAL_DS_TARGET') == 'vop' || env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test' ? 'Europe/Berlin' : 0;
        $timeZone = config('app.timezone');

        foreach ($shifts as $shift) {
            $start_time_utc = Carbon::createFromFormat('H:i', $shift['starttime'], $localTimeZone)->setTimezone($timeZone)->format('H:i');
            $end_time_utc = Carbon::createFromFormat('H:i', $shift['endtime'], $localTimeZone)->setTimezone($timeZone)->format('H:i');
            $startTime = $localTimeZone ? $start_time_utc : $shift['starttime'];
            $endTime = $localTimeZone ? $end_time_utc : $shift['endtime'];

            $shiftDtos[] = new ShiftDto(
                custom_id: $shift['id'],
                name: $shift['shift_name'],
                start_time: $startTime,
                end_time: $endTime,
                break_minutes: $shift['break_time'],
            );
        }

        return $shiftDtos;
    }

    public function capacities($skip, $take): array|false
    {
        return false;
    }

    public function customers(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = "SELECT kundeliefnr AS custom_id, kundeliefbez1 AS `name`, aktiv_inaktiv AS is_active FROM sd_kunde_lief WHERE kunde_lief = 1";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $customers = $stmt->fetchAll();

        return collect($customers)->chunk(env('DATA_CHUNK_SIZE'));
    }


    public function suppliers(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = "SELECT kundeliefnr AS custom_id, kundeliefbez1 AS `name`, aktiv_inaktiv AS is_active FROM sd_kunde_lief WHERE kunde_lief <> 1";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $suppliers = $stmt->fetchAll();

        return collect($suppliers)->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @return Collection
     */
    public function users(): Collection
    {
        if (!$this->base_visu_db) 
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = "
            SELECT 
                emp_hall.hall_id,
                TRIM(sd_mitarbeiter.mitarbeiternr) AS custom_id,
                TRIM(mitarbeiterbez) AS name,
                TRIM(sd_mitarbeiter.email) AS email,
                TRIM(sd_mitarbeiter.password) AS password,
                TRIM(sd_mitarbeiter.username) AS username,
                TRIM(sd_mitarbeiter.chip_number) AS chip_number,
                sd_mitarbeiter.aktiv_inaktiv AS is_active,
                vorgesetzter_flag AS is_supervisor,
                vorgesetzter AS supervisor_1_user,
                vorgesetzter2 AS supervisor_2_user,
                kuerzel AS user_short_code,
                sd_halle.hallenr AS hall_id_custom,
                CASE WHEN (user_type IS NULL OR user_type = 'g') THEN '" . UserType::GUEST() . "' ELSE '" . UserType::ADMIN() . "' END AS user_type 
            FROM 
                sd_mitarbeiter 
            LEFT JOIN 
                t_user_permission ON sd_mitarbeiter.mitarbeiternr = t_user_permission.mitarbeiternr 
            LEFT JOIN 
                employee_hall AS emp_hall ON emp_hall.employee_nr = sd_mitarbeiter.mitarbeiternr 
            LEFT JOIN 
                sd_halle ON sd_halle.id = emp_hall.hall_id 
            GROUP BY 
                emp_hall.hall_id,
                sd_mitarbeiter.mitarbeiternr,
                mitarbeiterbez,
                sd_mitarbeiter.email,
                sd_mitarbeiter.password,
                sd_mitarbeiter.username,
                sd_mitarbeiter.chip_number,
                sd_mitarbeiter.aktiv_inaktiv,
                vorgesetzter_flag,
                vorgesetzter,
                vorgesetzter2,
                kuerzel,
                sd_halle.hallenr,
                user_type;
        ";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $users = $stmt->fetchAll();

        return collect($users)->chunk(env('DATA_CHUNK_SIZE'));
    }


    /**
     * @return Collection
     */
    public function permissionsByModuleName($moduleName): Collection
    {
        if (!$this->base_visu_db || !$moduleName)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        if ($moduleName == 'CAST_VISU') {
            $query = "SELECT trim(mitarbeiternr) AS custom_id, trim(user_type) AS permission FROM t_user_permission_castvisu";

            $stmt = $this->base_visu_db->prepare($query);
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $stmt->execute();
            $permissions = $stmt->fetchAll();
            return collect($permissions)->chunk(env('DATA_CHUNK_SIZE'));
        }
        return collect([]);
    }

    public function itemStates(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = 'SELECT c.id AS custom_id,
                c.name AS name,
                1 as is_active
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = "ausschuss"';

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        return collect($stmt->fetchAll());
    }

    public function machineStates(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = 'SELECT custom_id, name, gruppe_id as machine_state_custom_id, 1 AS is_active FROM t_stillstand';

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        return collect($stmt->fetchAll());
    }

    public function machineStateGroups(): Collection
    {
        if (!$this->base_visu_db)
            return collect([])->chunk(env('DATA_CHUNK_SIZE'));

        $query = 'SELECT c.id AS custom_id,
                c.name AS name,
                1 AS is_active
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE t.name = "stillstandgruppe"';

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        return collect($stmt->fetchAll());
    }

    private ?array $cachedProdOrders = null;

    private function getProdOrders(): array
    {
        if ($this->cachedProdOrders !== null)
            return $this->cachedProdOrders;

        $query = 'SELECT auf.auf_nr,
                         auf.auf_nr_alt,
                         auf.teil,
                         auf.arbgang
                    FROM plan_visu.t_auftrag auf
        ';

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $result = $stmt->fetchAll();

        $retVal = [];
        foreach ($result as $record) {
            $retVal[$record['auf_nr']] = [
                'id_custom' => $record['auf_nr_alt'],
                'item_id_custom' => $record['teil'],
                'operation_pos' => $record['arbgang'],
            ];
        }

        $this->cachedProdOrders = $retVal;

        return $retVal;
    }

    public function machineProdOrderPosOperationTimeDtos(int $skip, int $take): array|false
    {
        if (!$this->base_visu_db)
            return false;

        $query = "SELECT
                    bde_nr as machine_custom_id,
                    still_first_entry as start,
                    still_server_end_entry as \"end\",
                    auf_list as orders
                  FROM diecast.t_maschinen_status status
                  LIMIT $take OFFSET $skip";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $result = $stmt->fetchAll();

        if (!$result) {
            return false;
        }

        $prodOrders = $this->getProdOrders();

        $machineProdOrderPosOperationTimeDtos = [];
        foreach ($result as $record) {
            $orders = explode(',', $record['orders']);
            foreach ($orders as $order) {
                if (!$order || !isset($prodOrders[$order])) {
                    continue;
                }

                $machineProdOrderPosOperationTimeDtos[] = new MachineProdOrderPosOperationTimeDto(
                    machine_id_custom: $record['machine_custom_id'],
                    prod_order_id_custom: $prodOrders[$order]['id_custom'],
                    prod_order_pos_item_id_custom: $prodOrders[$order]['item_id_custom'],
                    prod_order_pos_operation_pos: $prodOrders[$order]['operation_pos'],
                    start: $record['start'],
                    end: $record['end'],
                    status: ProdOrderPosOperationStatus::IN_PRODUCTION(),
                );
            }
        }

        return $machineProdOrderPosOperationTimeDtos;
    }

    public function machineStateTimeDtos(int $skip, int $take): array|false
    {
        if (!$this->base_visu_db)
            return false;

        $query = "SELECT
                    trim(status.bde_nr) as machine_custom_id,
                    status.still_grund as machine_state_custom_id,
                    status.still_first_entry as start,
                    status.still_server_end_entry as \"end\"
                  FROM diecast.t_maschinen_status status
                  LIMIT $take OFFSET $skip";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $result = $stmt->fetchAll();

        $machineStateTimeDtos = [];
        foreach ($result as $record) {
            $machineStateTimeDtos[] = new MachineStateTimeDto(
                machine_id_custom: $record['machine_custom_id'],
                machine_state_id_custom: $record['machine_state_custom_id'],
                start: $record['start'],
                end: $record['end'],
            );
        }

        return $machineStateTimeDtos;
    }

    public function machineUserTimeDtos(int $skip, int $take): array|false
    {
        if (!$this->base_visu_db)
            return false;

        $query = "SELECT id_person, shift_id, start_time, end_time, trim(bde_nr) as bde_nr
                  FROM bde_zeiten.t_logging
                  LIMIT $take OFFSET $skip";

        $stmt = $this->base_visu_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $result = $stmt->fetchAll();

        $machineUserTimeDtos = [];
        foreach ($result as $record) {
            $machineUserTimeDtos[] = new MachineUserTimeDto(
                machine_id_custom: $record['bde_nr'],
                user_id_custom: $record['id_person'],
                shift_id_custom: $record['shift_id'],
                start: $record['start_time'],
                end: $record['end_time'],
            );
        }

        return $machineUserTimeDtos;
    }

    public function salesOrders(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function tpmGroupDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT c.id AS custom_id,
                c.name AS name
            FROM t_base_combo c
                JOIN t_base_combo_type t ON c.type = t.id
            WHERE c.type = 28";
        $stmt = $this->base_visu_db->prepare($query);

        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        return collect($stmt->fetchAll())
            ->map(function ($tpmGroup) {
                return new TpmGroupDto(
                    custom_id: $tpmGroup['custom_id'],
                    name: $tpmGroup['name'],
                );
            })->toArray();
    }

    public function costCenters(): Collection
    {
        return collect([]);
    }

    public function settings(): Collection
    {
        if (!$this->settings_db)
            return collect([]);

        $query = "SELECT username as email_username, mail_id as email_address, trim(`password`) as email_password, port as email_port, host as email_host, company_name as client_name FROM mail_settings;";

        $stmt = $this->settings_db->prepare($query);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $mailConfigs = $stmt->fetch();

        return collect($mailConfigs);
    }

    public function classifications($skip, $take): array|false
    {
        return false;
    }

    public function resourceGroups($skip, $take): array|false
    {
        return false;
    }

    public function itemGroups(): Collection
    {
        return collect([]);
    }

    public function userGroups(): Collection
    {
        return collect([]);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return HallDto[]|false
     */
    public function hallDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemGroupDto[]|false
     */
    public function itemGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineGroupDto[]|false
     */
    public function machineGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OperationPlanDto[]|false
     */
    public function operationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @param string|null $onlyCustomId
     * @return ProdOrderDto[]|false
     */
    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return BomDto[]|false
     */
    public function bomDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ToolDto[]|false
     */
    public function toolDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return WarehouseDto[]|false
     */
    public function warehouseDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CallOffDto[]|false
     */
    public function callOffDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftModelDto[]|false
     */
    public function shiftModelDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CustomerDto[]|false
     */
    public function customerDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SupplierDto[]|false
     */
    public function supplierDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return UserDto[]|false
     */
    public function userDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return UserGroupDto[]|false
     */
    public function userGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemStateDto[]|false
     */
    public function itemStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateDto[]|false
     */
    public function machineStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateGroupDto[]|false
     */
    public function machineStateGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SalesOrderDto[]|false
     */
    public function salesOrderDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return DepartmentDto[]|false
     */
    public function departmentDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return TpmSubGroupDto[]|false
     */
    public function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CostCenterDto[]|false
     */
    public function costCenterDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ClassificationDto[]|false
     */
    public function classificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ResourceGroupDto[]|false
     */
    public function resourceGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param string $moduleName
     * @param int $skip
     * @param int $take
     * @return PermissionDto[]|false
     */
    public function permissionsByModuleNameDtos(string $moduleName, int $skip, int $take): array|false
    {
        return false;
    }

    public function settingsDto(): SettingsDto|false
    {
        return false;
    }

    public function qualificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return PackagingInstructionDto[]|false
     */
    public function packagingInstructionDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProductionSupplyAreaDto[]|false
     */
    public function productionSupplyAreaDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StorageBinDto[]|false
     */
    public function storageBinDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return HandlingUnitDto[]|false
     */
    public function handlingUnitDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OffDayDto[]|false
     */
    public function offDayDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return EquipmentDto[]|false
     */
    public function equipmentDtos(int $skip, int $take, ?string $serialFilter = null, ?string $itemFilter = null): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProdInspectionOperationDto[]|false
     */
    public function prodInspectionOperationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionLotDto[]|false
     */
    public function inspectionLotDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return AttributeSetDto[]|false
     */
    public function attributeSetDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionSpecificationDto[]|false
     */
    public function inspectionSpecificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return DocVisuItemFileDto[]|false
     */
    public function docVisuItemFileDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        return false;
    }
}

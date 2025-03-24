<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\ExternalDataSource\Dto\ClassificationDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemPlantDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\Models\Machine;
use App\Services\CapacityPlanService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use PDO;

class SctExternalDatasource extends BaseVisuExternalDataSource
{
    private PDO $erp_db;
    private PDO $accessAlexDbConnection;
    private PDO $baseVisuDbConnection;
    private CapacityPlanService $capacityPlanService;

    public function __construct(CapacityPlanService $capacityPlanService)
    {
        parent::__construct();

        // task_visu db connnection | for now i am going with test db
        $this->erp_db = new PDO("mysql:host=" . env('ERP_HOST') . ";port=" . env('ERP_PORT') . ";dbname=task_visu;charset=utf8mb4", env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->erp_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // for client info
        $this->accessAlexDbConnection = new PDO("mysql:host=" . env('ERP_HOST') . ";port=" . env('ERP_PORT') . ";dbname=access_alex;charset=utf8mb4", env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->accessAlexDbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->baseVisuDbConnection = new PDO("mysql:host=" . env('ERP_HOST') . ";port=" . env('ERP_PORT') . ";dbname=base_visu;charset=utf8mb4", env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->baseVisuDbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Resolve dependant services
        $this->capacityPlanService = $capacityPlanService;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        //By doing that changes from basevisu get also populated back to v11 db (in this case machine_group and hall assignment)
        $records = parent::machineDtos($skip, $take);

        if ($skip) {
            return $records;
        }

        $sql = "SELECT mitarbeiternr as custom_id,
                    mitarbeiterbez as `name`,
                    aktiv_inaktiv as is_active,
                    hallenr as custom_hall_id
                FROM base_visu.sd_mitarbeiter
                    WHERE mitarbeiternr != ''";

        $stmt = $this->baseVisuDbConnection->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $dtos = [];
        foreach($records as $record) {
            $dtos[] = new MachineDto(
                custom_id: $record->custom_id,
                name: $record->name,
                is_active: $record->is_active,
                hall_id_custom: $record->hall_id_custom,
                plant_id_custom: 'sct',
            );
        }

        foreach ($results as $record) {
            $dtos[] = new MachineDto(
                $record['custom_id'],
                $record['name'],
                $record['is_active'],
                hall_id_custom: $record['custom_hall_id'],
                plant_id_custom: 'sct',
            );
        }
        return $dtos;
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

    public function itemDtos($skip, $take): array|false
    {
        $sql = "SELECT id as custom_id, 
                LEFT(requirement, 99) as name,
                client_id as customer_id_custom
            FROM t_dev_status
            ORDER BY id
            LIMIT {$take}
            OFFSET {$skip}";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $records = $stmt->fetchAll();

        $dtos = [];
        foreach ($records as $record) {
            $dtos[] = new ItemDto(
                custom_id: $record['custom_id'],
                name: $record['name'],
                plants: [new ItemPlantDto(plant_id_custom: 'sct')],
                customer_id_custom: $record['customer_id_custom']
            );
        }
        return $dtos;
    }

    /**
     * it will return the status based on progress
     * status map initialized in the above as constant
     */
    private function getOpPlanPosStatus(int $progress): ProdOrderPosOperationStatus
    {
        if ($progress == 0 || $progress == 2) // planned
            return ProdOrderPosOperationStatus::PLANNED();

        // for development when progress 100% then closed
        // for non progress bar related task 1 means it is yes (Ex: QA dev)
        if ($progress == 1 || $progress == 100)
            return ProdOrderPosOperationStatus::CLOSED();

        // rest of the progress should be in_production status
        return ProdOrderPosOperationStatus::IN_PRODUCTION();
    }

    private function getStartTime($machine_id_custom, $task_id, $item_id, $position)
    {
        $status = [
            0 => 22,
            10 => 5,
            20 => 5,
            30 => 7,
            31 => 7,
            40 => 6,
            50 => 6,
            60 => 10,
            70 => 22,
            80 => 22,
        ];

        $query = "SELECT MIN(start_time) as start_time 
                    FROM t_times 
                    WHERE user_id = $machine_id_custom 
                        AND task_id = $task_id 
                        AND control_plan_id = $item_id 
                        AND status_id = $status[$position] 
                    GROUP BY 
                        user_id, task_id, control_plan_id, status_id";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        return $stmt->fetchAll()[0]['start_time'] ?? now()->toDateTimeString();
    }

    public function prodOrderDtos(int $skip, int $take, $onlyCustomId = ''): array|false
    {
        if ($skip) {
            return false;
        }

        $additionalQueryPart = "";
        if(isset($onlyCustomId)) {
            $additionalQueryPart .= " AND t_task.id  = " . $onlyCustomId;
        }

        $machines = Machine::all(['id', 'custom_id'])->pluck('id', 'custom_id');

        $query = "SELECT
                     t_project.erledigt AS project_progress,
                     t_project.is_archived AS project_is_archived,
                     t_project.project_name AS project_name,
                     t_task.erledigt AS task_progress,
                     t_task.id AS custom_id,
                     t_task.problem AS problem,
                     t_task.parent_id AS parent_id,
                     t_dev_status.id AS custom_pos,
                     t_dev_status.delivery_date as due_date,
                     -- t_dev_status.expected_result as notes,
                     t_dev_status.understanding as understanding,
                     t_dev_status.desing_review as design_review, -- note misspelled column name
                     t_task.start_date AS `pos_start`,
                     t_task.end_date AS `pos_end`,
                     NULL AS op_plan_pos_start,
                     NULL AS op_plan_pos_end,
                     100 AS quantity,
                     t_dev_status_progress.dev_id AS prod_order_pos_id,
                     t_dev_status_progress.id AS custom_op_plan_pos,
                     t_dev_status_progress.initial_time AS op_plan_pos_te,
                     t_dev_status_progress.additional_time AS op_plan_pos_additional_te,
                     t_dev_status_progress.expected_end_date AS op_plan_pos_expected_end_date,
                     t_dev_status_progress.user_id AS op_plan_pos_custom_machine_id,
                     NULL AS op_plan_pos_custom_tool_id,
                     t_dev_status_progress.progress AS progress,
                     t_dev_operation_steps.operation AS operation_name,
                     t_dev_operation_steps.seq_order AS operation_pos,
                     t_dev_operation_steps.import_shopfloor AS should_import_operation,
                     t_dev_operation_steps.send_ahead_percent AS send_ahead_percent,
                     t_dev_operation_steps.duration_min AS duration_min,
                     parent_task.problem AS parent_name,
                     parent_task.erledigt AS parent_task_progress,
                     t_options.name AS module_name,
                     sd_mitarbeiter.mitarbeiterbez AS person_name,
                     sd_kunde_lief.kundeliefbez1 AS client_name
                 FROM 
                     t_task 
                 LEFT JOIN 
                     t_dev_status ON t_task.id = t_dev_status.task_id
                 LEFT JOIN 
                     t_dev_status_progress ON t_dev_status.id = t_dev_status_progress.dev_id
                 LEFT JOIN
                     t_project ON t_task.project_id = t_project.id
                 LEFT JOIN
                     t_dev_operation_steps ON t_dev_status_progress.type = t_dev_operation_steps.id
                 LEFT JOIN
                     t_task parent_task ON parent_task.id = t_task.parent_id
                 LEFT JOIN
                     t_options ON t_options.id = t_task.module_id
                 LEFT JOIN
                     base_visu.sd_mitarbeiter ON sd_mitarbeiter.mitarbeiternr = t_task.person_nr
                 LEFT JOIN
                     base_visu.sd_kunde_lief ON t_dev_status.client_id = base_visu.sd_kunde_lief.kundeliefnr
                 WHERE t_task.parent_id IS NOT NULL
                 AND t_task.type_id <> 8 $additionalQueryPart";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $prod_orders = $stmt->fetchAll();

        $dtos = [];

        foreach ($prod_orders as $prod_order) {
            $prodOrderIsClosed = $prod_order['task_progress'] == 100
                || $prod_order['parent_task_progress'] == 100
                || $prod_order['project_progress'] == 100
                || $prod_order['project_is_archived'] == 1;

            // We do not consider any Closed order
            if($prodOrderIsClosed) {
                continue;
            }

            if (!isset($dtos[$prod_order['custom_id']])) {
                $dtos[$prod_order['custom_id']] = new ProdOrderDto(
                    custom_id: $prod_order['custom_id'],
                    assembly: $prod_order['parent_id'],
                    classifications: [
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'Task_name',
                            value_string: $prod_order['problem']
                        ),
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'MainTask',
                            value_string: $prod_order['parent_name']
                        ),
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'Module',
                            value_string: $prod_order['module_name']
                        ),
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'Project',
                            value_string: $prod_order['project_name']
                        ),
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'Task_Progress',
                            value_string: strval($prod_order['task_progress'])
                        ),
                        new ClassificationDto(
                            class: 'JPI_SCT',
                            attribute: 'Creator_Task',
                            value_string: $prod_order['person_name']
                        ),
                    ]
                );
            }
            /**
             * @var ProdOrderDto $prodOrderDto
             */
            $prodOrderDto = $dtos[$prod_order['custom_id']];

            if (!$prod_order['custom_pos']) {
                // Skip if there are no prodOrderPos
                continue;
            }

            if (!isset($prodOrderDto->positions[$prod_order['custom_pos']])) {
                $prodOrderDto->positions[$prod_order['custom_pos']] = new ProdOrderPosDto(
                    pos: $prod_order['custom_pos'],
                    item_id_custom: $prod_order['custom_pos'],
                    start: $prod_order['pos_start'] ? Carbon::createFromTimeString($prod_order['pos_start'])->format('Ymd') : NULL,
                    end: $prod_order['pos_end'] ? Carbon::createFromTimeString($prod_order['pos_end'])->format('Ymd') : NULL,
                    due_date: $prod_order['due_date'],
                    status: ProdOrderPosStatus::CLOSED(),
                    quantity: $prod_order['quantity'],
                    // notes: $prod_order['notes'],
                    classifications: [
                        new ClassificationDto(
                            class: "JPI_SCT",
                            attribute: "understanding",
                            value_string: strval($prod_order['understanding']),
                        ),
                        new ClassificationDto(
                            class: "JPI_SCT",
                            attribute: "design_review",
                            value_string: strval($prod_order['design_review']),
                        ),
                        new ClassificationDto(
                            class: "JPI_SCT",
                            attribute: "client_name",
                            value_string: $prod_order['client_name'],
                        )
                    ]
                );
            }
            /**
             * @var ProdOrderPosDto $prodOrderPosDto
             */
            $prodOrderPosDto = $prodOrderDto->positions[$prod_order['custom_pos']];

            if (!$prod_order['custom_op_plan_pos']) {
                // Skip if there are no prodOrderPosOperations
                continue;
            }

            $timeFromDb = explode(":", $prod_order['op_plan_pos_te']);
            $additionalTimeFromDb = explode(":", $prod_order['op_plan_pos_additional_te']);
            if (!isset($timeFromDb[1])) {
                $timeFromDb[1] = 0;
            }
            if (!isset($additionalTimeFromDb[1])) {
                $additionalTimeFromDb[1] = 0;
            }
            $originalTime = ($timeFromDb[0] * 3600) + ($timeFromDb[1] * 60);
            $additionalTime = ($additionalTimeFromDb[0] * 3600) + ($additionalTimeFromDb[1] * 60);

            if (!isset($prodOrderPosDto->operations[$prod_order['custom_op_plan_pos']])) {
                $status = $this->getOpPlanPosStatus($prod_order['progress']);

                if ($prodOrderIsClosed || !$prod_order['should_import_operation']) {
                    $status = ProdOrderPosOperationStatus::CLOSED();
                }
                if (
                    $status == ProdOrderPosOperationStatus::PLANNED()
                    || $status == ProdOrderPosOperationStatus::IN_PRODUCTION()
                ) {
                    $prodOrderPosDto->status = ProdOrderPosStatus::PLANNED();
                    $status = ProdOrderPosOperationStatus::PLANNED();
                }

                // $durationTime = round($originalTime + $additionalTime) ?: ($prod_order['duration_min'] * 60);
                // $machineId = $machines->get($prod_order['op_plan_pos_custom_machine_id']);

                $operationStartTime = $prod_order['op_plan_pos_expected_end_date'] ? Carbon::createFromFormat('Y-m-d', $prod_order['op_plan_pos_expected_end_date']) : now();
                // $operationEndTime = $this->capacityPlanService->calculateEndTime(Carbon::parse($operationStartTime), $durationTime, $machineId)['end'];

                # START::If End Date is less than today, then modify End Date as today current time
                $operationEndDate = Carbon::createFromFormat('Y-m-d', $operationStartTime->format('Y-m-d'))->format('Y-m-d');
                $todayDate = now()->format('Y-m-d');

                if($operationEndDate < $todayDate) {
                    $operationEndTime = now();
                } else {
                    $operationEndTime = $this->getStartTime($prod_order['op_plan_pos_custom_machine_id'], $prod_order['custom_id'], $prod_order['custom_pos'], $prod_order['operation_pos']);
                }
                # END::If End Date is less than today, then modify End Date as today current time
                
                $prodOrderPosDto->operations[$prod_order['custom_op_plan_pos']] = new ProdOrderPosOperationDto(
                    pos: $prod_order['operation_pos'],
                    name: $prod_order['operation_name'],
                    start: $operationEndTime,
                    // end: $operationEndTime,
                    te: round($originalTime / 100) ?: 36,
                    tr: round($additionalTime),
                    machine_id_custom: $prod_order['op_plan_pos_custom_machine_id'],
                    tool_id_custom: $prod_order['op_plan_pos_custom_tool_id'],
                    status: $status,
                    registered_quantity: $prod_order['progress'] == 1
                        ? 100
                        : ($prod_order['progress'] == 2
                            ? 0
                            : $prod_order['progress']),
                    send_ahead_quantity: $prod_order['send_ahead_percent'] * 100,
                    classifications: [
                        new ClassificationDto(
                            class: "JPI_SCT",
                            attribute: "custom_id",
                            value_string: $prod_order['custom_op_plan_pos'],
                        ),
                    ]
                );
            } else {
                // If the key is already present, increase the 'value' of that specific element
                $prodOrderPosDto->operations[$prod_order['op_plan_pos_map_key']]->te += $originalTime / 100;
            }
        }

        // Modify Next Operation POS
        foreach ($dtos as $prodOrder) {
            foreach ($prodOrder->positions as $prodOrderPos) {
                $allPositions = [];
                foreach ($prodOrderPos->operations as $prodOrderPosOperations) {
                    while(in_array($prodOrderPosOperations->pos, $allPositions)) {
                        $prodOrderPosOperations->pos = $prodOrderPosOperations->pos + 1;
                    }
                    array_push($allPositions, $prodOrderPosOperations->pos);
                }
            }
        }

        return $dtos;
    }

    public function boms(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function tools(): Collection
    {

        $records = collect([]);

        return $records;
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
        $sql = "SELECT Kunden_ID as custom_id, Costumername as `name`, 1 as is_active  FROM access_alex.T_Client";
        $stmt = $this->accessAlexDbConnection->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function users(): Collection
    {
        // Sync V10 Changes to V11
        $records = parent::users();
        return $records;
    }

    public function halls(): Collection
    {
        $records = parent::halls();
        $results = [];
        return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
    }
}

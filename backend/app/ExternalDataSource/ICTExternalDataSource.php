<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ComponentAvailability;
use App\Enums\ProdOrderPosStatus;
use App\ExternalDataSource\Dto\CallOffDto;
use App\ExternalDataSource\Dto\ClassificationDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\OffDayDto;
use App\ExternalDataSource\Dto\QualificationDto;
use App\ExternalDataSource\Dto\ToolDto;
use App\Models\ProdOrderPos;
use App\Models\ResourceGroup;
use App\Models\ToolGroup;
use App\Models\Tool;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class ICTExternalDataSource extends BaseVisuExternalDataSource
{
    private PDO $erp_db;
    private PDO $erp_mssql_db;

    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
        $this->erp_mssql_db = new PDO("odbc:" . env('ADDITIONAL_ERP_HOST'), env('ADDITIONAL_ERP_USERNAME'), env('ADDITIONAL_ERP_PASSWORD'));
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        //Sync V10 Changes to V11
        $records = parent::machineDtos($skip, $take);

        if ($skip) {
            return $records;
        }

        // the \"custom_id\" is there so that the result is in lowercase otherwise it would return it as CUSTOM_ID and that would then need looping through to just change the array param
        $sql = "SELECT TRIM(RSCKODE) as custom_id, 
            RSCBEZEICHNUNG1 as name, CASE RSCINAKTIV WHEN 0 THEN 1 ELSE 0 END as is_active, 
            CASE WHEN RSCBAUJAHR = 0 THEN null WHEN RSCBAUJAHR < 1901 THEN 1901 WHEN RSCBAUJAHR > 2155 THEN 2155 ELSE RSCBAUJAHR END AS construction_year, 
            HALLE as custom_hall_id 
            FROM ERP_TO_MES_RESSOURCEN";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $res = collect($results)
            ->map(function ($result) {
                return new MachineDto(
                    custom_id: $result['CUSTOM_ID'],
                    name: $result['NAME'],
                    is_active: $result['IS_ACTIVE'],
                    construction_year: $result['CONSTRUCTION_YEAR'],
                    hall_id_custom: $result['CUSTOM_HALL_ID'],
                );
            });

        return collect($records)->merge($res)->toArray();
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

    public function itemGroups(): Collection
    {
        $sql = "SELECT KALKODE AS \"custom_id\", CONCAT(KALKODE, CONCAT(' ',KLABEZEICHNUNG)) AS \"name\", 1 as \"is_imported_from_erp\", 1 as \"is_active\" 
            FROM ERP_TO_MES_KLASSIFIZIERUNGEN
            WHERE KLADEFID = '1GC000000002C2'";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect($results);
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @param $skip
     * @param $take
     * @return array or false
     */
    public function itemDtos($skip, $take): array|false
    {
        //INcreased Char length to 230 as on 99 there was a cutoff exactly at a non ASCII Character (that killed the import as a unknown char was created)
        $sql = "SELECT TRIM(ARTKODE) AS CUSTOM_ID, 
                SUBSTR(ARTBEZEICHNUNGNOHTML,0,230) AS NAME, 
                A.ARTIKELGRUPPE as ITEM_GROUP_CUSTOM_ID, 
                CASE WHEN ITEMCAT.KLADEFID = '0590000000001Q' THEN CONCAT(ITEMCAT.KALKODE, CONCAT(' ', ITEMCAT.KLABEZEICHNUNG)) ELSE NULL END AS CATEGORY, 
                CASE ARTINAKTIV WHEN 0 THEN 1 ELSE 0 END as IS_ACTIVE,
                ABC as ABC
                FROM ERP_TO_MES_ARTIKEL A 
                LEFT JOIN ERP_TO_MES_KLASSIFIZIERUNGEN ITEMCAT ON ITEMCAT.KLADEFID = '0590000000001Q' AND A.MATERIALTYP = ITEMCAT.KALKODE
                ORDER BY ARTKODE 
                OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY;";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        $results = $stmt->fetchAll();
        $dtos = [];

        if (is_array($results)) {
            $importFolder = $this->getImportFolder();
            for ($i = 0; $i < count($results); $i++) {
                $dto = new ItemDto(
                    custom_id: $results[$i]['CUSTOM_ID'],
                    name: $results[$i]['NAME'],
                    is_active: $results[$i]['IS_ACTIVE'],
                    category: $results[$i]['CATEGORY'],
                    classifications: [
                        new ClassificationDto(
                            class: "ICT",
                            attribute: "ABC",
                            value_string: $results[$i]['ABC']
                        )
                        ],
                    main_tool_id: $results[$i]['CUSTOM_ID'],
                );

                //only check strings that are numeric(this excludes items that are starting with #)
                if (is_numeric($results[$i]['CUSTOM_ID'])) {
                    //The Customer requested if the item ends with \.[0-9]0 in the cutom_id we should remove that for the image search.
                    // images are of jpg format but JPG I saw also as Linux is casesensitive we have to check twice.

                    $fileExtension = '.jpg';
                    $endsWithNeedels = ['.10', '.20', '.30', '.40', '.50', '.60', '.70', '.80', '.90'];
                    $fileName = (Str::endsWith($results[$i]['CUSTOM_ID'], $endsWithNeedels) ? Str::beforeLast($results[$i]['CUSTOM_ID'], '.') : $results[$i]['CUSTOM_ID']);
                    if (Storage::disk('local')->exists($importFolder . $fileName . $fileExtension)) {
                        $dto->image_exists = true;
                        $dto->path_for_image = Storage::disk('local')->path($importFolder . $fileName . $fileExtension);
                        $dto->image_name = $fileName;
                    } elseif (Storage::disk('local')->exists($importFolder . $fileName . Str::upper($fileExtension))) {
                        $dto->image_exists = true;
                        $dto->path_for_image = Storage::disk('local')->path($importFolder . $fileName . Str::upper($fileExtension));
                        $dto->image_name = $fileName;
                    } else {
                        $dto->image_exists = false;
                        $dto->path_for_image = '';
                    }
                }

                $dtos[] = $dto;
            }
        }
        return $dtos;
    }

    /**
     * Returns the directory path with a trailing slash
     * @return string
     */
    private function getImportFolder(): string
    {
        $pathToImport = env('IMPORT_DIRECTORY', '');
        if (!str_ends_with($pathToImport, '/')) {
            $pathToImport .= '/';
        }
        return $pathToImport;
    }

    public function prodOrders(?string $onlyCustomId, string $ordersTable = "ERP_TO_MES_AUFTRAEGE"): Collection
    {
        $tools = collect();
        foreach (Tool::all() as $tool) {
            $tools[$tool->custom_id] = $tool->cavity;
        }
        $resourceGroupsFirstMachineCustomId = collect();
        foreach (ResourceGroup::with('machines')->get() as $resourceGroup) {
            $resourceGroupsFirstMachineCustomId[$resourceGroup->custom_id] = $resourceGroup->machines->first()?->custom_id ?? null;
        }

        //Field: HALLE currently not saved
        //Attention: Database returns numbers with comma as decimal seperator
        $query = "SELECT TRIM(Auftrag.PRODKEY) as \"custom_id\",
        Auftrag.PRODID AS PROD_ORDER_POS_OPERATIONS_ICT_PRODID,
        10 as \"custom_pos\",
        Auftrag.PRODBEGINN as \"op_plan_pos_start\",
        Auftrag.Babtec_Kennzeichnung as \"op_plan_pos_ict_babtec\",
        Auftrag.Bemerkung as \"op_plan_pos_note\",
        Auftrag.DOKUMENTDATUM as \"document_date\",
        Auftrag.PRODUKTIONSREGISTER as \"production_register\",
        TRIM(Auftrag.TEILENR1) as \"custom_item_id\",
        Auftrag.PRODMENGE as \"prod_order_pos_quantity\",
        Auftrag.BUFFERZEIT as \"prod_order_pos_operations_transfer_time\",
        Auftrag.AUFRÜSTZEIT as \"op_plan_pos_tr\",
        Auftrag.ABRÜSTZEIT as \"prod_order_pos_operations_teardown_time\",
        TRIM(Auftrag.ARBEITSGANGKODE) as \"prod_order_pos_operation_code\",
        Auftrag.SEND_AHEAD_QUANTITY as \"prod_order_pos_operations_send_ahead_quantity\" ,
        Auftrag.ARBEITSGANGBEZEICHNUNG as \"prod_order_pos_operations_name\",
        TRIM(Auftrag.RESSOURCE) as \"user_group_custom_id\",
        CASE WHEN STATUS = 20 THEN 1 ELSE 0 END AS \"is_all_components_available\",
        TRIM(Auftrag.ARBEITSGANG) as \"custom_op_plan_pos\",
        Auftrag.PRODARBDETANZAHLNESTERNUM as \"operator_usage_factor\",
        Auftrag.PRODENDE as \"op_plan_pos_end\",
        Auftrag.TE_SEK AS \"op_plan_pos_te\",
        Auftrag.Variante AS \"batch\",
        ProdSupplied.ZUSFELDLOGISCH AS \"is_production_possible\",
        TRIM(Auftrag.WKZ_STAMMFORM) AS \"op_plan_pos_custom_tool_id\",
        TRIM(Auftrag.WKZ_EINSATZ) AS \"op_plan_pos_custom_tool_insert_id\",
        CASE WHEN ProdErledigt.PRODERLEDIGT > 0 THEN 1 ELSE 0 END AS \"is_completed\",
        CASE WHEN AufState.DOKZUSTANDKODE IN ('ST','E','ZZZ') THEN 1 ELSE 0 END AS \"is_closed\",
        CASE WHEN DruckState.ARBSCHGEDRUCKT = 1 THEN 1 ELSE 0 END AS \"has_labels_prepared\"
        FROM {$ordersTable} Auftrag 
            LEFT JOIN ERP_TO_MES_AUFTRAEGE_ZUSTAND AufState ON Auftrag.PRODID = AufState.PRODID
            LEFT JOIN DRUCKSTATUS_PRODUKTION DruckState ON Auftrag.PRODID = DruckState.PRODID
            LEFT JOIN PRODUTKIONSAUFTRAG_ERLEDIGT ProdErledigt on Auftrag.PRODID = ProdErledigt.PRODID
            LEFT JOIN ERP_TO_MES_BEREITGESTELLT ProdSupplied on Auftrag.PRODID = ProdSupplied.PRODID
            " .
            ($onlyCustomId ? "WHERE Auftrag.PRODKEY LIKE ?\n" : "\n") .
            "ORDER BY Auftrag.PRODKEY, ARBEITSGANGPOSITION";

        $query = mb_convert_encoding($query, "Windows-1252");

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute($onlyCustomId ? ["%$onlyCustomId%"] : []);
        $prod_orders = $stmt->fetchAll();

        $records = collect();
        $customOpPlanPos = collect([]);
        $opPlanPosName = collect([]);
        $opPlanPosNote = collect([]);
        $opPlanPosComment = collect([]);
        $opPlanPosStatus = collect([]);
        $opPlanPosComponent = collect([]);
        $opPlanPosTe = collect([]);
        $opPlanPosCavity = collect([]);
        $opPlanPosStart = collect([]);
        $opPlanPosIctBabtec = collect([]);
        $opPlanPosIctProdId = collect([]);
        $opPlanPosEnd = collect([]);
        $opPlanPosCustomMachineId = collect([]);
        $opPlanPosHasLabelsPrinted = collect([]);
        $opPlanOperatorUsageFactor = collect([]);
        $opPlanUserGroupCustomId = collect([]);
        $opPlanOperationCode = collect([]);
        $opPlanOperationName = collect([]);
        $opPlanSendAheadQuantity = collect([]);
        $opPlanTearDownTime = collect([]);
        $opPlanTransferTime = collect([]);
        $opPlanPosTr = collect([]);
        $opPlanPosTool = collect();
        $opPlanPosToolInsert = collect();

        $lastCustomId = '';
        $lastCustomPos = '';
        $lastCustomItemId = '';
        $lastBatch = '';
        $lastQuantity = '';
        $lastStart = '';
        $lastIctBabtec = '';
        $lastIctProdId = '';
        $lastEnd = '';
        $lastDueDate = '';
        $lastDocumentDate = '';
        $lastProductionRegister = '';
        $lastOrderStatus = '';
        $isProductionPossible = 0;

        foreach ($prod_orders as $prod_order) {
            $prod_order['op_plan_pos_te'] = floatval(str_replace(",", ".", $prod_order['op_plan_pos_te']));
            if (strlen($lastCustomId) && $lastCustomItemId && ($prod_order['custom_id'] != $lastCustomId || $prod_order['custom_item_id'] != $lastCustomItemId)) {
                $records->push([
                    'custom_id' => $lastCustomId,
                    'custom_pos' => $lastCustomPos,
                    'custom_item_id' => $lastCustomItemId,
                    'batch' => $lastBatch,
                    'quantity' => $lastQuantity,
                    'start' => $lastStart,
                    'end' => $lastEnd,
                    'document_date' => $lastDocumentDate,
                    'production_register' => $lastProductionRegister,
                    'custom_op_plan_pos' => $customOpPlanPos,
                    'op_plan_pos_te' => $opPlanPosTe,
                    'operator_usage_factor' => $opPlanOperatorUsageFactor,
                    'op_user_group_custom_id' => $opPlanUserGroupCustomId,
                    'op_plan_pos_status' => $opPlanPosStatus,
                    'op_plan_pos_component_availability' => $opPlanPosComponent,
                    'op_plan_pos_start' => $opPlanPosStart,
                    'op_plan_pos_ict_babtec' => $opPlanPosIctBabtec,
                    'op_plan_pos_ict_prodid' => $opPlanPosIctProdId,
                    'op_plan_pos_note' => $opPlanPosNote,
                    'op_plan_pos_comment' => $opPlanPosComment,
                    'op_plan_pos_tr' => $opPlanPosTr,
                    'op_plan_pos_end' => $opPlanPosEnd,
                    'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
                    'op_plan_pos_has_labels_prepared' => $opPlanPosHasLabelsPrinted,
                    'op_plan_pos_custom_tool_id' => $opPlanPosTool,
                    'op_plan_pos_custom_tool_insert_id' => $opPlanPosToolInsert,
                    'due_date' => $lastDueDate,
                    'status' => $lastOrderStatus,
                    'release_date' => $lastStart,
                    'op_operation_code' => $opPlanOperationCode,
                    'op_plan_pos_name' => $opPlanOperationName,
                    'op_plan_send_ahead_quantity' => $opPlanSendAheadQuantity,
                    'teardown_time' => $opPlanTearDownTime,
                    'transfer_time' => $opPlanTransferTime,
                    'op_plan_pos_cavity' => $opPlanPosCavity,
                    'is_production_possible' => $isProductionPossible
                ]);

                $customOpPlanPos = collect([]);
                $opPlanPosName = collect([]);
                $opPlanPosStatus = collect([]);
                $opPlanPosComponent = collect([]);
                $opPlanPosTe = collect([]);
                $opPlanPosCavity = collect([]);
                $opPlanPosStart = collect([]);
                $opPlanPosIctBabtec = collect([]);
                $opPlanPosIctProdId = collect([]);
                $opPlanPosNote = collect([]);
                $opPlanPosComment = collect([]);
                $opPlanPosHasLabelsPrinted = collect([]);
                $opPlanPosTr = collect([]);
                $opPlanPosEnd = collect([]);
                $opPlanPosCustomMachineId = collect([]);
                $opPlanOperatorUsageFactor = collect([]);
                $opPlanUserGroupCustomId = collect([]);
                $opPlanOperationCode = collect([]);
                $opPlanOperationName = collect([]);
                $opPlanSendAheadQuantity = collect([]);
                $opPlanTearDownTime = collect([]);
                $opPlanTransferTime = collect([]);
                $opPlanPosTool = collect([]);
                $opPlanPosToolInsert = collect([]);
            }

            if ($prod_order['is_closed'] || $prod_order['is_completed']) {
                $op_plan_pos_status = ProdOrderPosOperationStatus::CLOSED();
            } else {
                $op_plan_pos_status = ProdOrderPosOperationStatus::PLANNED();
            }
            $lastOrderStatus = $op_plan_pos_status === ProdOrderPosOperationStatus::CLOSED() ? ProdOrderPosStatus::CLOSED() : ProdOrderPosStatus::PLANNED();

            $opPlanPosStatus->add($op_plan_pos_status);

            if ($prod_order['is_all_components_available']) {
                $op_plan_component = ComponentAvailability::FULL();
            } else {
                $op_plan_component = ComponentAvailability::NONE();
            }
            $opPlanPosComponent->add($op_plan_component);

            $prod_order['operator_usage_factor'] = floatval(str_starts_with($prod_order['operator_usage_factor'], ',') ? str_replace(",", "0.", $prod_order['operator_usage_factor']) : $prod_order['operator_usage_factor']);
            $customOpPlanPos->add($prod_order['custom_op_plan_pos']);
            $opPlanOperatorUsageFactor->add($prod_order['operator_usage_factor']);
            $opPlanUserGroupCustomId->add($prod_order['user_group_custom_id']);
            $opPlanOperationCode->add($prod_order['prod_order_pos_operation_code']);
            $opPlanPosTe->add($prod_order['op_plan_pos_te'] * ($tools[$prod_order['op_plan_pos_custom_tool_id']] ?? 1));
            $opPlanPosTr->add($prod_order['op_plan_pos_tr']);
            $opPlanTransferTime->add($prod_order['prod_order_pos_operations_transfer_time']);
            $opPlanPosCavity->add($tools[$prod_order['op_plan_pos_custom_tool_id']] ?? 1);
            $opPlanOperationName->add($prod_order['prod_order_pos_operations_name']);
            $opPlanSendAheadQuantity->add($prod_order['prod_order_pos_operations_send_ahead_quantity']);
            $opPlanTearDownTime->add($prod_order['prod_order_pos_operations_teardown_time']);
            $opPlanPosStart->add($prod_order['op_plan_pos_start'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_start']) : now());
            $opPlanPosIctBabtec->add($prod_order['op_plan_pos_ict_babtec'] ?: '');
            $opPlanPosIctProdId->add($prod_order['PROD_ORDER_POS_OPERATIONS_ICT_PRODID'] ?: '');
            $opPlanPosEnd->add($prod_order['op_plan_pos_end'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_end']) : now());
            $opPlanPosCustomMachineId->add($resourceGroupsFirstMachineCustomId[$prod_order['prod_order_pos_operation_code']] ?? null);
            $opPlanPosNote->add($prod_order['op_plan_pos_note']);
            $opPlanPosComment->add($prod_order['op_plan_pos_comment'] ?? null);
            $opPlanPosTool->add($prod_order['op_plan_pos_custom_tool_id']);
            $opPlanPosToolInsert->add($prod_order['op_plan_pos_custom_tool_insert_id']);

            $opPlanPosHasLabelsPrinted->add($prod_order['has_labels_prepared']);
            $lastCustomId = $prod_order['custom_id'];
            $lastCustomPos = $prod_order['custom_pos'];
            $lastCustomItemId = $prod_order['custom_item_id'];
            $lastBatch = $prod_order['batch'];
            $lastQuantity = $prod_order['prod_order_pos_quantity'];
            $lastDueDate = $prod_order['op_plan_pos_end'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_end']) : now();
            $lastStart = $prod_order['op_plan_pos_start'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_start']) : now();
            $lastIctBabtec = $prod_order['op_plan_pos_ict_babtec'] ?: '';
            $lastIctProdId = $prod_order['PROD_ORDER_POS_OPERATIONS_ICT_PRODID'] ?: '';
            $lastEnd = $prod_order['op_plan_pos_end'] ? Carbon::createFromTimeString($prod_order['op_plan_pos_end']) : now();
            $lastDocumentDate = $prod_order['document_date'] ? Carbon::createFromTimeString($prod_order['document_date']) : now();
            $lastProductionRegister = $prod_order['production_register'] ? $prod_order['production_register'] : null;
            $isProductionPossible = $prod_order['is_production_possible'] ? : 0;
        }

        $records->push([
            'custom_id' => $lastCustomId,
            'custom_pos' => $lastCustomPos,
            'custom_item_id' => $lastCustomItemId,
            'batch' => $lastBatch,
            'quantity' => $lastQuantity,
            'start' => $lastStart,
            'end' => $lastEnd,
            'document_date' => $lastDocumentDate,
            'production_register' => $lastProductionRegister,
            'custom_op_plan_pos' => $customOpPlanPos,
            'op_plan_pos_te' => $opPlanPosTe,
            'operator_usage_factor' => $opPlanOperatorUsageFactor,
            'op_user_group_custom_id' => $opPlanUserGroupCustomId,
            'op_plan_pos_status' => $opPlanPosStatus,
            'op_plan_pos_component_availability' => $opPlanPosComponent,
            'op_plan_pos_start' => $opPlanPosStart,
            'op_plan_pos_ict_babtec' => $opPlanPosIctBabtec,
            'op_plan_pos_ict_prodid' => $opPlanPosIctProdId,
            'op_plan_pos_note' => $opPlanPosNote,
            'op_plan_pos_comment' => $opPlanPosComment,
            'op_plan_pos_has_labels_prepared' => $opPlanPosHasLabelsPrinted,
            'op_plan_pos_tr' => $opPlanPosTr,
            'op_plan_pos_end' => $opPlanPosEnd,
            'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
            'op_plan_pos_custom_tool_id' => $opPlanPosTool,
            'op_plan_pos_custom_tool_insert_id' => $opPlanPosToolInsert,
            'due_date' => $lastDueDate,
            'status' => $lastOrderStatus,
            'release_date' => $lastStart,
            'op_operation_code' => $opPlanOperationCode,
            'op_plan_pos_name' => $opPlanOperationName,
            'op_plan_send_ahead_quantity' => $opPlanSendAheadQuantity,
            'teardown_time' => $opPlanTearDownTime,
            'transfer_time' => $opPlanTransferTime,
            'op_plan_pos_cavity' => $opPlanPosCavity,
            'is_production_possible' => $isProductionPossible
        ]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function boms(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function halls(): Collection
    {
        //Sync V10 Changes to V11
        $records = parent::halls();

        $query = "SELECT TRIM(HALLENBEZEICHNUNG) as \"custom_id\", 
            TRIM(HALLENBEZEICHNUNG) as \"name\",
            1 as \"is_active\"
            FROM ERP_TO_MES_HALLEN";

        $query = mb_convert_encoding($query, "Windows-1252");

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
    }

    public function toolDtos(int $skip, int $take): array|false
    {
        $defaultToolGroupCustomId = ToolGroup::query()->first()?->custom_id;

        $dtos = parent::toolDtos($skip, $take) ?: [];
        // Nester could be found under: RSCANZAHLSCHUSS when ever that is added to basedata in v11
        // They would also provide the Cunstructionyear in ICT: RSCBAUJAHR
        $sql = "SELECT TRIM(RSCKODE) AS \"custom_id\", 
            RSCBEZEICHNUNG1 AS \"name\", 
            CASE RSCINAKTIV WHEN 0 THEN 1 ELSE 0 END as \"is_active\", 
            RSCANZAHLSCHUSS AS \"cavity\", 
            CASE WHEN RSCBAUJAHR = 0 THEN null WHEN RSCBAUJAHR < 1901 THEN 1901 WHEN RSCBAUJAHR > 2155 THEN 2155 ELSE RSCBAUJAHR END AS \"construction_year\",
            CASE WHEN WERKZEUG = 'Ja' THEN 1 ELSE 0 END as \"is_tool\"
            FROM ERP_TO_MES_WERKZEUGE
            OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        foreach ($results as $result) {
            $dtos[] = new ToolDto(
                custom_id: $result['custom_id'],
                name: $result['name'],
                is_active: $result['is_active'],
                construction_year: $result['construction_year'],
                cavity: $result['cavity'],
                tool_group_custom_ids: $defaultToolGroupCustomId && $result['is_tool'] ? [$defaultToolGroupCustomId] : [],
                main_tool_id: $result['custom_id'],
            );
        }

        return $dtos;
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

    public function callOffDtos(int $skip, int $take): array|false
    {
        $results = ProdOrderPos::with('prodOrder:id,custom_id', "item:id,custom_id")
                    ->whereNotNull('due_date')
                    ->whereNotIn('status', [ProdOrderPosStatus::CLOSED(), ProdOrderPosStatus::DELETED()])
                    ->skip($skip)
                    ->take($take)
                    ->get(['id', 'prod_order_id', 'item_id', 'due_date', 'quantity']);

        $dtos = $results->map(fn($result) => 
                    new CallOffDto(
                        custom_id: $result->prodOrder->custom_id,
                        item_id_custom: $result->item->custom_id,
                        date: $result->due_date,
                        quantity: $result->quantity
                    ))
                    ->all();

        return $dtos;
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
        return parent::customers();
    }

    public function suppliers(): Collection
    {
        return parent::suppliers();
    }

    public function users(): Collection
    {
        //Sync V10 Changes to V11
        $records = parent::users();

        //Trimming just to be sure to get rid of spaces
        //Exited is either NULL or a date value when it's over today person is inactive 100%
        $query = "SELECT TRIM(PERSONAL) as custom_id, 
            TRIM(NAME) as name, 
            null AS hall_id,
            TRIM(USERNAME) as username, 
            CASE WHEN TRIM(MAIL) IS NULL OR TRIM(MAIL) = '' THEN CONCAT(TRIM(PERSONAL), '@intercable.com') ELSE TRIM(MAIL) END as email, 
            Trim(CHIP_NUMBER) as chip_number, 
            CASE WHEN Exited IS NULL THEN 1 WHEN exited >= CONVERT(date,GETDATE()) THEN 1 ELSE 0 END as is_active 
            FROM SCHERTECH_STAMMDATEN WHERE LEN(TRIM(PERSONAL)) > 1";

        $stmt = $this->erp_mssql_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
    }

    public function userGroups(): Collection
    {
        $sql = "SELECT TRIM(RSCKODE) AS \"custom_id\", 
                RSCBEZEICHNUNG1 AS \"name\", 
                CASE RSCINAKTIV WHEN 0 THEN 1 ELSE 0 END as \"is_active\",
                HALLE_MA as \"hall_custom_id\",
                1 as \"is_imported_from_erp\"
                FROM ERP_TO_MES_MITARBEITERGRUPPE";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        return collect($results)->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @param $skip
     * @param $take
     * @return array or false
     */
    public function resourceGroups($skip, $take): array|false
    {
        $sql = "SELECT TRIM(ARBSCHRITTKODE) AS \"custom_id\", 
                ARBSCHRITTBEZEICHNUNG1 AS \"name\", 
                CASE ARBSCHRITTINAKTIV WHEN 0 THEN 1 ELSE 0 END as \"is_active\",
                MES_HALLE as \"hall_custom_id\",
                Faktor as \"jpi_factor\",
                1 as \"is_imported_from_erp\"
                FROM ERP_TO_MES_ARBGANG
                ORDER BY ARBSCHRITTKODE 
                OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return QualificationDto[]|false
     */
    public function qualificationDtos(int $skip, int $take): array|false
    {
        $sql = "SELECT TRIM(ARTKODE) AS \"item_id_custom\", 
                 TRIM(ARBEITSGANGKODE) AS \"operation_code\", 
                ANZAHL as \"min_qualification_operations\",
                ARTINAKTIV as \"is_inactive\"
                FROM ERP_TO_MES_QUALIFIKATIONS
                ORDER BY ARTKODE, ARBEITSGANGKODE
                OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

        $sql = mb_convert_encoding($sql, "Windows-1252");

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();

        $qualifications = $stmt->fetchAll();

        $result = [];
        foreach ($qualifications as $qualification) {
            $result[] = new QualificationDto(
                is_active: !$qualification['is_inactive'],
                item_id_custom: $qualification['item_id_custom'],
                operation_code: $qualification['operation_code'],
                min_qualification_hours: 0,
                min_qualification_operations: $qualification['min_qualification_operations'],
            );
        }
        return $result;
    }

    public function offDayDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $query = "SELECT TRIM(PERSONAL) as custom_id,
            FREE as date
            FROM SCHERTECH_VACATIONS
            WHERE [FROM] = 0 AND [TO] = 0
            ";

        $stmt = $this->erp_mssql_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $dtos = [];
        foreach ($results as $result) {
            $dtos[] = new OffDayDto(
                user_id_custom: $result['custom_id'],
                date: Carbon::parse($result['date']),
            );
        }

        return $dtos;
    }
}

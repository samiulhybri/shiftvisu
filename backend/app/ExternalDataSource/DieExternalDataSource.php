<?php

namespace App\ExternalDataSource;

use App\ExternalDataSource\Dto\CallOffDto;
use App\ExternalDataSource\Dto\CustomerDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemPlantDto;
use App\ExternalDataSource\Dto\ItemStateDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\OperationPlanDto;
use App\ExternalDataSource\Dto\OperationPlanPosDto;
use App\ExternalDataSource\Dto\StockDto;
use App\Models\Item;
use App\Models\Plant;
use App\Models\StorageLocation;
use PDO;

class DieExternalDataSource extends BaseVisuExternalDataSource
{
    protected PDO $erp_db;

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

        //TODO: Add External Machining as Machines with the Prefix E
        $sql = "SELECT 
                'K' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, Nummer))) + CONVERT(VARCHAR, Nummer), 3) AS custom_id, 
                KernAnlBez AS name
                FROM [I-KernAnlagen]
            
            UNION
            
            SELECT 
                'F' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, Nummer))) + CONVERT(VARCHAR, Nummer), 3) AS custom_id, 
                FormAnlage AS name
                FROM [I-FormAnlagen]
            
            UNION
            
            SELECT 
                'P' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, Nummer))) + CONVERT(VARCHAR, Nummer), 3) AS custom_id, 
                Bezeichnung AS name
                FROM [I-PutzAnlagen]
            
            UNION
            
            SELECT 
                'B' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, Nummer))) + CONVERT(VARCHAR, Nummer), 3) AS custom_id, 
                AnlagenBezeichnung AS name
                FROM [I-Bearbeitungsanlagen]
                
            UNION

            SELECT DISTINCT 
                'L' + RIGHT(REPLICATE('0', 6 - LEN(CONVERT(VARCHAR, machine.LieferantNr))) + CONVERT(VARCHAR, machine.LieferantNr), 6) AS custom_id,
                machine.NameKurz AS name
            FROM [Kreditor] AS machine
            JOIN [Auf-Bearb] AS auf ON auf.LieferantenNr = machine.LieferantNr";



        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $res = collect($results)
            ->map(function ($result) {
                return new MachineDto(
                    custom_id: $result['custom_id'],
                    name: $result['name'] ?? '',
                );
            });

        return $res->toArray();
    }

    public function itemDtos(int $skip, int $take): array|false
    {
        $sql = "SELECT DISTINCT
                    TeileNr AS custom_id,
                    ModellBez AS name,
                    KundenNr AS customer_id_custom,
                    ZeichNr AS name2
                FROM Teile
                WHERE TeileNr IS NOT NULL AND ModellBez IS NOT NULL
                ORDER BY TeileNr 
                OFFSET $skip ROWS
                FETCH NEXT $take ROWS ONLY";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $res = collect($results)
            ->map(function ($result) {
                return new ItemDto(
                    custom_id: $result['custom_id'],
                    name: $result['name'],
                    custom_operation_plan_id: $result['custom_id'],
                    plants: [
                        new ItemPlantDto(plant_id_custom: 'DEFAULT'),
                    ],
                    customer_id_custom: $result['customer_id_custom'],
                    name2: $result['name2']
                );
            });

        return $res->toArray();
    }

    public function toolDtos(int $skip, int $take): array|false
    {
        //TODO: Import Modelle
        return parent::toolDtos($skip, $take);
    }

    public function callOffDtos(int $skip, int $take): array|false
    {
        $sql = "SELECT
                a.MengenID AS custom_id,
                a.AuftrNr AS item_id_custom,
                a.PDiTermin AS date,
                a.PMenge AS quantity,
                b.LAB AS is_internal
            FROM [Auf-LAB] a, Auftraege b
            WHERE a.PMenge > 0 AND a.PDiTermin IS NOT NULL AND a.AuftrNr = b.AuftrNr
            ORDER BY a.MengenID
            OFFSET $skip ROWS
            FETCH NEXT $take ROWS ONLY";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $res = collect($results)
            ->map(function ($result) {
                return new CallOffDto(
                    custom_id: $result['custom_id'],
                    item_id_custom: $result['item_id_custom'],
                    date: $result['date'],
                    quantity: $result['quantity'],
                    is_internal: $result['is_internal'],
                );
            });

        return $res->toArray();
    }

    public function itemStateDtos(int $skip, int $take): array|false
    {
        $sql = "SELECT DISTINCT
                Nummer AS custom_id,
                AusGrund AS name
            FROM [I-Ausschuss]
            ORDER BY Nummer
            OFFSET $skip ROWS
            FETCH NEXT $take ROWS ONLY";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $res = collect($results)
            ->map(function ($result) {
                return new ItemStateDto(
                    custom_id: $result['custom_id'],
                    name: $result['name'],
                );
            });

        return $res->toArray();
    }

    public function operationDtos(int $skip, int $take): array|false
    {
        //Do not support skiptake so that we do not run into a problem if one operation plan is split to multiple pages
        if ($skip)
            return false;

        //TODO: Until now this is only the operation plan of Machining, needs to be expanded to have also Cores, ...

        // START:: FETCH DATA FROM 'Auf-Bearb' TABLE
        $sql = "SELECT 
                AuftrNr AS custom_id,
                (Agnr + 300) AS pos,
                LEFT(BearbText, 255) AS name,
                StueckMin * 60 AS te,
                RuestMin * 60 AS tr,
                AgVorlaufTage AS lead_time_days,
                CASE 
                    WHEN Nummer = 0 THEN 'L' + RIGHT(REPLICATE('0', 6 - LEN(CONVERT(VARCHAR, LieferantenNr))) + CONVERT(VARCHAR, LieferantenNr), 6)
                    ELSE 'B' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, Nummer))) + CONVERT(VARCHAR, Nummer), 3)
                END AS machine_id_custom
            FROM [Auf-Bearb]
            WHERE BearbArt IN ('A', 'F')";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results_auf_bearb = $stmt->fetchAll();
        // END:: FETCH DATA FROM 'Auf-Bearb' TABLE

        // START:: FETCH DATA FROM 'Auf-Kerne' TABLE
        $sql = "SELECT 
                AuftrNr AS custom_id,
                KernNr AS pos,
                LEFT(Beschreibung, 255) AS name,
                KernMin * 60 AS te,
                RuestMin * 60 AS tr,
                StProKK AS cavity,
                CASE 
                    WHEN (KernAnID = 0 OR KernAnID = NULL) THEN NULL
                    ELSE 'K' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, KernAnID))) + CONVERT(VARCHAR, KernAnID), 3)
                END AS machine_id_custom
            FROM [Auf-Kerne]";
        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results_auf_kerne = $stmt->fetchAll();
        // END:: FETCH DATA FROM 'Auf-Kerne' TABLE

        // START:: FETCH DATA FROM 'Auftraege' TABLE
        $sql = "SELECT 
                AuftrNr AS custom_id,
                (0 + 100) AS pos,
                LEFT(FormTxt, 255) AS name,
                (FoMin * 60) AS te,
                (FoRuestMin * 60) AS tr,
                1 AS cavity,
                0 AS lead_time_days,
                CASE 
                    WHEN (FoAnlage = 0 OR FoAnlage = NULL) THEN NULL
                    ELSE 'F' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, FoAnlage))) + CONVERT(VARCHAR, FoAnlage), 3)
                END AS machine_id_custom
            FROM [Auftraege]";
        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results_auftraege = $stmt->fetchAll();
        // END:: FETCH DATA FROM 'Auftraege' TABLE

        // START:: FETCH DATA FROM 'Auf-Putz' TABLE
        $sql = "SELECT 
                AuftrNr AS custom_id,
                (IndexNr + 200) AS pos,
                LEFT(Beschreibung, 255) AS name,
                (PutzMin * 60) AS te,
                0 AS tr,
                1 AS cavity,
                0 AS lead_time_days,
                CASE 
                    WHEN (PutzAnlage = 0 OR PutzAnlage = NULL) THEN NULL
                    ELSE 'P' + RIGHT(REPLICATE('0', 3 - LEN(CONVERT(VARCHAR, PutzAnlage))) + CONVERT(VARCHAR, PutzAnlage), 3)
                END AS machine_id_custom
            FROM [Auf-Putz]";
        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results_auf_putz = $stmt->fetchAll();
        // END:: FETCH DATA FROM 'Auf-Putz' TABLE

        $results = array_merge($results_auf_bearb, $results_auf_kerne, $results_auftraege, $results_auf_putz);

        $operationPlanDto = null;
        $operationPlans = collect();
        foreach ($results as $result) {
            if ($operationPlanDto && $operationPlanDto->custom_id != $result['custom_id']) {
                $operationPlans->push($operationPlanDto);

                $operationPlanDto = new OperationPlanDto(
                    custom_id: $result['custom_id'],
                );
            }

            if(!$operationPlanDto) {
                $operationPlanDto = new OperationPlanDto(
                    custom_id: $result['custom_id'],
                );
            }

            $operationPlanDto->operation_plan_pos[] = new OperationPlanPosDto(
                pos: $result['pos'],
                name: $result['name'],
                te: $result['te'] ?? 0,
                tr: $result['tr'],
                machine_id_custom: $result['machine_id_custom'],
                lead_time_days: $result['lead_time_days'] ?? 0,
                cavity: $result['cavity'] ?? 1,
            );
        }

        if ($operationPlanDto)
            $operationPlans->push($operationPlanDto);

        return $operationPlans->toArray();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CustomerDto[]|false
     */
    public function customerDtos(int $skip, int $take): array|false
    {
        $dtos = [];

        $sql = "SELECT KUNDENNR AS CUSTOM_ID, 
                NAMEKURZ AS NAME, 
                1 AS IS_ACTIVE 
                FROM [Debitor] 
                ORDER BY KUNDENNR ASC 
                OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        foreach ($results as $result) {
            if(isset($result['CUSTOM_ID']) && isset($result['NAME'])) {
                $dtos[] = new CustomerDto(
                    custom_id: $result['CUSTOM_ID'],
                    name: $result['NAME'],
                    is_active: $result['IS_ACTIVE']
                );
            }
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false
    {
        $sql = "SELECT 
                    TeileNr AS ITEM_CUSTOM_ID,
                    SUM(LagerHFSt) AS QUANTITY
                FROM Teile
                WHERE TeileNr IS NOT NULL AND ModellBez IS NOT NULL
                GROUP BY TeileNr 
                ORDER BY TeileNr 
                OFFSET $skip ROWS
                FETCH NEXT $take ROWS ONLY";

        $stmt = $this->erp_db->prepare($sql);
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $dtos = [];

        $plant = Plant::with('itemStateDefault')->first();
        $storageLocation = StorageLocation::first();
        $items = Item::where('is_tool', null)->pluck('custom_id')->toArray();

        foreach ($results as $result) {
            if (in_array($result['ITEM_CUSTOM_ID'], $items)) {
                $dtos[] = new StockDto(
                    item_id_custom: $result['ITEM_CUSTOM_ID'],
                    plant_id_custom: $plant->custom_id,
                    item_state_id_custom: $plant->itemStateDefault->custom_id,
                    storage_location_id_custom: $storageLocation->custom_id,
                    quantity: (float) $result['QUANTITY']
                );
            }
        }

        return $dtos;
    }
}

<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderType;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\BomDto;
use App\ExternalDataSource\Dto\BomPosDto;
use App\ExternalDataSource\Dto\ToolDto;
use App\ExternalDataSource\Dto\CallOffDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemPlantDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\ExternalDataSource\Dto\ProdOrderPosBomPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationAltMachineDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationResourceDto;
use App\ExternalDataSource\Dto\OperationPlanDto;
use App\ExternalDataSource\Dto\OperationPlanPosDto;
use App\ExternalDataSource\Dto\StockDto;
use App\Models\Item;
use Illuminate\Support\Carbon;
use App\Models\Machine;
use App\Models\Plant;
use App\Models\ProdOrderPosOperation;
use App\Models\StorageLocation;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class VOPExternalDataSource extends BaseVisuExternalDataSource
{
	private PDO $erp_germany;
	private PDO $erp_bulgaria;

	public function __construct()
	{
		parent::__construct();
		$this->erp_germany = new PDO("odbc:" . env('ERP_HOST'), env('ERP_USERNAME'), env('ERP_PASSWORD'));
		$this->erp_bulgaria = new PDO("odbc:" . env('ADDITIONAL_ERP_HOST'), env('ADDITIONAL_ERP_USERNAME'), env('ADDITIONAL_ERP_PASSWORD'));
	}

	public function machineDtos(int $skip, int $take): array|false
	{
		//Sync V10 Changes to V11
		$records = parent::machineDtos($skip, $take);

		if ($skip) {
			return $records;
		}
		//Can be taht Raint is also 165 (so IN (165,166) would get more data)
		$sql = "SELECT CONCAT('DE-',TRIM(MNr)) as CUSTOM_ID, 
			KTxt as NAME, 
			MDCControlFlag as PlanVisuEnabled,
			1 as IS_ACTIVE
			FROM infor.relAc
			WHERE Raint = 166 AND KTxt IS NOT NULL";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',TRIM(MNr)) as CUSTOM_ID, 
			KTxt as NAME, 
			MDCControlFlag as PlanVisuEnabled,
			1 as IS_ACTIVE
			FROM infor.relAc
			WHERE Raint = 166 AND KTxt IS NOT NULL";

		$stmt = $this->erp_bulgaria->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}

		$dtos = [];

		foreach ($results as $record) {
			$dtos[] = new MachineDto(
				$record['CUSTOM_ID'],
				$record['NAME'],
				$record['IS_ACTIVE'],
                is_enabled_for_plan_visu: $record['PLANVISUENABLED'],
			);
		}
		return array_merge($records, $dtos);
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
		$records = collect([]);
		return $records->chunk(env('DATA_CHUNK_SIZE'));
	}

	/**
	 * @param $skip
	 * @param $take
	 * @return array or false
	 */
	public function itemDtos($skip, $take): array|false
	{
		//Excluded Ktxt with NULL 
		$sql = "SELECT CONCAT('DE-',TRIM(MNr)) AS CUSTOM_ID, 
			KTxt AS NAME, 
			1 AS IS_ACTIVE,
			CONTAINERQUANTITY AS PACKAGING_QUANTITY,
			ME as UNIT_OF_MEASURE_ID_CUSTOM,
			CASE WHEN RVerwend_1 > 0 THEN 1 ELSE 0 END AS IS_PURCHASED_ITEM,
			CASE WHEN RVerwend_2 > 0 THEN 1 ELSE 0 END AS IS_SALES_ITEM,
			CASE WHEN RVerwend_3 > 0 THEN 1 ELSE 0 END AS IS_PRODUCTION_ITEM,
			CASE WHEN RVerwend_4 > 0 THEN 1 ELSE 0 END AS IS_PACKAGING_ITEM
			FROM infor.relAc WHERE Raint = 160 AND KTxt IS NOT NULL
			OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY;";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		/*$sql = "SELECT CONCAT('BG-',TRIM(MNr)) AS CUSTOM_ID,
			KTxt AS NAME, 
			1 AS IS_ACTIVE,
			CONTAINERQUANTITY AS PACKAGING_QUANTITY,
			ME as UNIT_OF_MEASURE_ID_CUSTOM,
			CASE WHEN RVerwend_1 > 0 THEN 1 ELSE 0 END AS IS_PURCHASED_ITEM,
			CASE WHEN RVerwend_2 > 0 THEN 1 ELSE 0 END AS IS_SALES_ITEM,
			CASE WHEN RVerwend_3 > 0 THEN 1 ELSE 0 END AS IS_PRODUCTION_ITEM,
			CASE WHEN RVerwend_4 > 0 THEN 1 ELSE 0 END AS IS_PACKAGING_ITEM
			FROM infor.relAc WHERE Raint = 160 AND KTxt IS NOT NULL
			OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY;";
		$stmt = $this->erp_bulgaria->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			if (!(false === mb_detect_encoding($row['NAME'], 'UTF-8', true))) {
				$results[] = $row;
			}
		}*/
		$dtos = [];

		if (is_array($results)) {
			for ($i = 0; $i < count($results); $i++) {
				$dto = new ItemDto(
					custom_id: $results[$i]['CUSTOM_ID'],
					name: $results[$i]['NAME'],
					custom_bom_id: $results[$i]['CUSTOM_ID'],
					is_active: $results[$i]['IS_ACTIVE'],
					unit_of_measure_id_custom: $results[$i]['UNIT_OF_MEASURE_ID_CUSTOM'],
					packaging_quantity: $results[$i]['PACKAGING_QUANTITY'],
					is_purchased_item: $results[$i]['IS_PURCHASED_ITEM'],
					is_sales_item: $results[$i]['IS_SALES_ITEM'],
					is_production_item: $results[$i]['IS_PRODUCTION_ITEM'],
					is_packaging_item: $results[$i]['IS_PACKAGING_ITEM'],
					main_tool_id: mb_substr($results[$i]['CUSTOM_ID'], 0, 17),
					plants: [
						new ItemPlantDto(plant_id_custom: 'DEFAULT'),
					]
				);
				$dtos[] = $dto;
			}
		}
		return $dtos;
	}

	public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
	{
		# removes either "DE-" or "BG-" from the beginning of $onlyCustomId
		if ($onlyCustomId) {
			$onlyCustomId = preg_replace('/^(DE-|BG-)/', '', $onlyCustomId);
		}

		//Close old Proposed entries
		$closed_before = Carbon::today()->toDateString();
		if (!$skip && is_null($onlyCustomId)) {
			ProdOrderPosOperation::where('status','PROPOSED')
			->where('status_erp','PROPOSED')
			->where('updated_at', '<', $closed_before)
			->update(['status' => ProdOrderPosOperationStatus::CLOSED()->value]);
		}

		$compareDate = new \DateTime('2024-01-01 00:00:00');
		$formatedCompareDate = $compareDate->format('Y-m-d');
		$dateto = date('Y-m-d', strtotime('+18 Weeks'));
		
		$query_proposed = "SELECT CONCAT('DE-',TRIM(header.ANr)) as CUSTOM_ID,header.ANr,
		10 as CUSTOM_POS,
		workplace.SEGM3_TERM as OP_PLAN_POS_START,
		workplace.ENDTERM as OP_PLAN_POS_END,
		workplace.SEGM1_TERM as OP_PLAN_POS_DUE_DATE,
		workplace.TR AS TR,
		'DE-' AS LANGUAGE_CODE,
		CONCAT('DE-',TRIM(header.MNr)) as CUSTOM_ITEM_ID,
		CONCAT('DE-',TRIM(workplace.MNr)) as CUSTOM_MACHINE_ID,
		header.SEGM3_MENG as PROD_ORDER_POS_QUANTITY,
		TRIM(workplace.MNr) as PROD_ORDER_POS_OPERATION_CODE,
		workplace.RNr as REFERENCE_WORKPLACE,
		CASE WHEN tool.Nester = 0 OR tool.Nester IS NULL THEN 1 ELSE tool.Nester END as OPERATION_CAVITY,
		tool.RNr as REFERENCE_TOOL,
		workplace.ZyklusSOLL as PROD_ORDER_POS_OPERATION_TE,
		CASE WHEN workplace.Ipos IS NULL THEN 0 ELSE workplace.Ipos END as PROD_ORDER_POS_OPERATION_POSITION,
		CASE WHEN tool.MNr IS NULL THEN NULL ELSE CONCAT('DE-',TRIM(tool.MNr)) END as PROD_ORDER_POS_OPERATION_CUSTOM_TOOL_ID,
		0 AS IS_COMPLETED,
		0 AS IS_TERMINATED,
		CONCAT('DE-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		bomlist.SEGM3_MENG as BOM_ITEM_QUANTITY_TOTAL,
		bomlist.SEGM3_MENG/header.SEGM3_MENG as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT,
		1 AS IS_PROPOSED
		FROM (SELECT a.ANr, a.MNr, a.SEGM3_MENG, a.WS, a.RNr FROM infor.RELCB a LEFT JOIN infor.relAC i ON a.MNr = i.MNr WHERE i.RVerwend_3 > 0 AND a.saint = 10 AND a.SEGM1_TERM BETWEEN TO_DATE('{$formatedCompareDate}','YYYY-MM-DD') AND TO_DATE('{$dateto}','YYYY-MM-DD') AND a.ANr NOT LIKE 'GK^%' ". ($onlyCustomId ? " AND a.ANR LIKE '%{$onlyCustomId}%'\n" : "\n") . " ORDER BY a.ANR OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY) header 
		LEFT JOIN (SELECT  ANr, MNr, SEGM1_TERM, SEGM3_TERM, ENDTERM, WS, RNr, MSGrp, TR, HOST, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS ZyklusSOLL, 100 - Ipos AS IPos FROM infor.RELCB where saint = 60) workplace ON header.ANr = workplace.ANr 
		LEFT JOIN (SELECT ANr, RNr, MNr, Nester FROM infor.RELCB WHERE saint = 70) tool ON header.ANr = tool.ANr
		LEFT JOIN (SELECT ANr, MNr, IPos, SEGM3_MENG, ME, te, MSGrp FROM infor.RELCB WHERE saint IN (90) ) bomlist ON workplace.ANr = bomlist.ANr AND workplace.MSGrp = bomlist.MSGrp
		ORDER BY header.ANr, workplace.RNr, bomlist.IPos";

		//MSGrp Gruppe zu einem Teil
		//ERP/ODBC will give back everything in uppercase if lowwercase is wanted \"param_name\" needs to be used
		//RELXDB wäre archiv
		//This was removed: AND Term_4 BETWEEN TO_DATE('{$formatedCompareDate}','YYYY-MM-DD') AND TO_DATE('{$dateto}','YYYY-MM-DD')
		$query = "SELECT CONCAT('DE-',TRIM(header.ANr)) as CUSTOM_ID,header.ANr,
		10 as CUSTOM_POS,
		workplace.Term_4 as OP_PLAN_POS_START,
		workplace.EndTerm as OP_PLAN_POS_END,
		workplace.TR AS TR,
		'DE-' AS LANGUAGE_CODE,
		CONCAT('DE-',TRIM(header.MNr)) as CUSTOM_ITEM_ID,
		CONCAT('DE-',TRIM(workplace.MNr)) as CUSTOM_MACHINE_ID,
		header.Meng_4 as PROD_ORDER_POS_QUANTITY,
		TRIM(workplace.MNr) as PROD_ORDER_POS_OPERATION_CODE,
		workplace.RNr as REFERENCE_WORKPLACE,
		CASE WHEN tool.Nester = 0 OR tool.Nester IS NULL THEN 1 ELSE tool.Nester END as OPERATION_CAVITY,
		tool.RNr as REFERENCE_TOOL,
		workplace.ZyklusSOLL as PROD_ORDER_POS_OPERATION_TE,
		CASE WHEN workplace.Ipos IS NULL THEN 0 ELSE workplace.Ipos END as PROD_ORDER_POS_OPERATION_POSITION,
		CASE WHEN tool.MNr IS NULL THEN NULL ELSE CONCAT('DE-',TRIM(tool.MNr)) END as PROD_ORDER_POS_OPERATION_CUSTOM_TOOL_ID,
		CASE WHEN workplace.WS IN (3,1) THEN 1 ELSE 0 END AS IS_COMPLETED,
		CASE WHEN workplace.WS = 0 THEN 1 ELSE 0 END AS IS_TERMINATED,
		CONCAT('DE-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		bomlist.Meng_4 as BOM_ITEM_QUANTITY_TOTAL,
		bomlist.Meng_4/header.Meng_4 as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT,
		0 AS IS_PROPOSED
		FROM (SELECT ANr, MNr, Meng_4, WS, RNr FROM infor.RELDB WHERE saint = 10 AND ANr NOT LIKE 'GK^%' ". ($onlyCustomId ? " AND ANR LIKE '%{$onlyCustomId}%'\n" : "\n") . " ORDER BY ANR OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY) header 
		LEFT JOIN (SELECT  ANr, MNr, HOST, CASE WHEN Term_5 IS NOT NULL THEN TERM_5 ELSE TERM_4 END AS Term_4, EndTerm, WS, RNr, MSGrp, TR*36 as TR, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS ZyklusSOLL, 100 - Ipos AS IPos FROM infor.RELDB where saint = 60) workplace ON header.ANr = workplace.ANr 
		LEFT JOIN (SELECT ANr, RNr, MNr, Nester FROM infor.RELDB WHERE saint = 70) tool ON header.ANr = tool.ANr
		LEFT JOIN (SELECT ANr, MNr, IPos, Meng_4, ME, te, MSGrp FROM infor.RELDB WHERE saint IN (90) ) bomlist ON workplace.ANr = bomlist.ANr AND workplace.MSGrp = bomlist.MSGrp
		ORDER BY header.ANr, workplace.RNr, bomlist.IPos";

		$stmt = $this->erp_germany->prepare($query);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$prod_orders = $stmt->fetchAll();

		$stmt = $this->erp_germany->prepare($query_proposed);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$prod_orders[] = $row;
		}

		$query_proposed = "SELECT CONCAT('BG-',TRIM(header.ANr)) as CUSTOM_ID,header.ANr,
		10 as CUSTOM_POS,
		workplace.SEGM3_TERM as OP_PLAN_POS_START,
		workplace.ENDTERM as OP_PLAN_POS_END,
		workplace.SEGM1_TERM as OP_PLAN_POS_DUE_DATE,
		workplace.TR AS TR,
		'BG-' AS LANGUAGE_CODE,
		CONCAT('BG-',TRIM(header.MNr)) as CUSTOM_ITEM_ID,
		CONCAT('BG-',TRIM(workplace.MNr)) as CUSTOM_MACHINE_ID,
		header.SEGM3_MENG as PROD_ORDER_POS_QUANTITY,
		TRIM(workplace.MNr) as PROD_ORDER_POS_OPERATION_CODE,
		workplace.RNr as REFERENCE_WORKPLACE,
		CASE WHEN tool.Nester = 0 OR tool.Nester IS NULL THEN 1 ELSE tool.Nester END as OPERATION_CAVITY,
		tool.RNr as REFERENCE_TOOL,
		workplace.ZyklusSOLL as PROD_ORDER_POS_OPERATION_TE,
		CASE WHEN workplace.Ipos IS NULL THEN 0 ELSE workplace.Ipos END as PROD_ORDER_POS_OPERATION_POSITION,
		CASE WHEN tool.MNr IS NULL THEN NULL ELSE CONCAT('BG-',TRIM(tool.MNr)) END as PROD_ORDER_POS_OPERATION_CUSTOM_TOOL_ID,
		0 AS IS_TERMINATED,
		0 AS IS_COMPLETED,
		CONCAT('BG-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		bomlist.SEGM3_MENG as BOM_ITEM_QUANTITY_TOTAL,
		bomlist.SEGM3_MENG/header.SEGM3_MENG as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT,
		1 AS IS_PROPOSED
		FROM (SELECT a.ANr, a.MNr, a.SEGM3_MENG, a.WS, a.RNr FROM infor.RELCB a LEFT JOIN infor.relAC i ON a.MNr = i.MNr WHERE i.RVerwend_3 > 0 AND a.saint = 10 AND a.SEGM1_TERM BETWEEN TO_DATE('{$formatedCompareDate}','YYYY-MM-DD') AND TO_DATE('{$dateto}','YYYY-MM-DD') AND a.ANr NOT LIKE 'GK^%' ". ($onlyCustomId ? " AND a.ANR LIKE '%{$onlyCustomId}%'\n" : "\n") . " ORDER BY a.ANR OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY) header 
		LEFT JOIN (SELECT  ANr, MNr, SEGM1_TERM, SEGM3_TERM, ENDTERM, WS, RNr, MSGrp , TR, HOST, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS ZyklusSOLL, 100 - Ipos AS IPos FROM infor.RELCB where saint = 60) workplace ON header.ANr = workplace.ANr 
		LEFT JOIN (SELECT ANr, RNr, MNr, Nester FROM infor.RELCB WHERE saint = 70) tool ON header.ANr = tool.ANr
		LEFT JOIN (SELECT ANr, MNr, IPos, SEGM3_MENG, ME, te, MSGrp FROM infor.RELCB WHERE saint IN (90) ) bomlist ON workplace.ANr = bomlist.ANr AND workplace.MSGrp = bomlist.MSGrp
		ORDER BY header.ANr, workplace.RNr, bomlist.IPos";

		//This was removed: AND Term_4 BETWEEN TO_DATE('{$formatedCompareDate}','YYYY-MM-DD') AND TO_DATE('{$dateto}','YYYY-MM-DD')
		$query = "SELECT CONCAT('BG-',TRIM(header.ANr)) as CUSTOM_ID,header.ANr,
		10 as CUSTOM_POS,
		workplace.Term_4 as OP_PLAN_POS_START,
		workplace.EndTerm as OP_PLAN_POS_END,
		workplace.TR AS TR,
		'BG-' AS LANGUAGE_CODE,
		CONCAT('BG-',TRIM(header.MNr)) as CUSTOM_ITEM_ID,
		CONCAT('BG-',TRIM(workplace.MNr)) as CUSTOM_MACHINE_ID,
		header.Meng_4 as PROD_ORDER_POS_QUANTITY,
		TRIM(workplace.MNr) as PROD_ORDER_POS_OPERATION_CODE,
		workplace.RNr as REFERENCE_WORKPLACE,
		CASE WHEN tool.Nester = 0 OR tool.Nester IS NULL THEN 1 ELSE tool.Nester END as OPERATION_CAVITY,
		tool.RNr as REFERENCE_TOOL,
		workplace.ZyklusSOLL as PROD_ORDER_POS_OPERATION_TE,
		CASE WHEN workplace.Ipos IS NULL THEN 0 ELSE workplace.Ipos END as PROD_ORDER_POS_OPERATION_POSITION,
		CASE WHEN tool.MNr IS NULL THEN NULL ELSE CONCAT('BG-',TRIM(tool.MNr)) END as PROD_ORDER_POS_OPERATION_CUSTOM_TOOL_ID,
		CASE WHEN workplace.WS IN (3,1) THEN 1 ELSE 0 END AS IS_COMPLETED,
		CASE WHEN workplace.WS = 0 THEN 1 ELSE 0 END AS IS_TERMINATED,
		CONCAT('BG-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		bomlist.Meng_4 as BOM_ITEM_QUANTITY_TOTAL,
		bomlist.Meng_4/header.Meng_4 as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT,
		0 AS IS_PROPOSED
		FROM (SELECT ANr, MNr, Meng_4, WS, RNr FROM infor.RELDB WHERE saint = 10 AND ANr NOT LIKE 'GK^%' ". ($onlyCustomId ? " AND ANR LIKE '%{$onlyCustomId}%'\n" : "\n") . " ORDER BY ANR OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY) header 
		LEFT JOIN (SELECT  ANr, MNr, HOST, CASE WHEN Term_5 IS NOT NULL THEN TERM_5 ELSE TERM_4 END AS Term_4, EndTerm, WS, RNr, Nester, MSGrp , TR, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS ZyklusSOLL, 100 - Ipos AS IPos FROM infor.RELDB where saint = 60) workplace ON header.ANr = workplace.ANr 
		LEFT JOIN (SELECT ANr, RNr, MNr, Nester FROM infor.RELDB WHERE saint = 70) tool ON header.ANr = tool.ANr
		LEFT JOIN (SELECT ANr, MNr, IPos, Meng_4, ME, te, MSGrp FROM infor.RELDB WHERE saint IN (90) ) bomlist ON workplace.ANr = bomlist.ANr AND workplace.MSGrp = bomlist.MSGrp
		ORDER BY header.ANr, workplace.RNr, bomlist.IPos";

		$stmt = $this->erp_bulgaria->prepare($query);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$prod_orders[] = $row;
		}

		$stmt = $this->erp_bulgaria->prepare($query_proposed);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$prod_orders[] = $row;
		}

		$dtos = [];
		foreach ($prod_orders as $record) {
			if (!isset($dtos[$record['CUSTOM_ID']])) {
				$dtos[$record['CUSTOM_ID']] = new ProdOrderDto(
					custom_id: $record['CUSTOM_ID'],
					order_type: ($record['IS_PROPOSED'] === '1') ? ProdOrderType::PROPOSED() : ProdOrderType::PRODUCTION(),
				);
			}

			$prodOrderDto = $dtos[$record['CUSTOM_ID']];

			if (!$record['CUSTOM_POS']) {
				// Skip if there are no prodOrderPos
				continue;
			}
			if (!isset($prodOrderDto->positions[$record['CUSTOM_POS']])) {
				$prodOrderDto->positions[$record['CUSTOM_POS']] = new ProdOrderPosDto(
					pos: $record['CUSTOM_POS'],
					item_id_custom: $record['CUSTOM_ITEM_ID'],
					quantity: (float) $record['PROD_ORDER_POS_QUANTITY'],
//TODO: Add due date in import                    due_date:
				);
			}
			$prodOrderPosDto = $prodOrderDto->positions[$record['CUSTOM_POS']];

			if (!$record['CUSTOM_MACHINE_ID']) {
				// Skip if there are no prodOrderPosOperations
				continue;
			}

			if (!isset($prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']])) {
				$operationStartDate = new \DateTime($record['OP_PLAN_POS_START']);
				
				$status = ProdOrderPosOperationStatus::PLANNED();
				if ($record['IS_COMPLETED'] === '1' || $operationStartDate < $compareDate) {
					$status = ProdOrderPosOperationStatus::CLOSED();
				} elseif ($record['IS_PROPOSED'] === '1') {
					$status = ProdOrderPosOperationStatus::PROPOSED();
				} elseif ($record['IS_TERMINATED'] === '1') {
					$status = ProdOrderPosOperationStatus::TERMINATED();
				}
				
				$prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']] = new ProdOrderPosOperationDto(
					pos: (int) (100000000 - (int) trim($record['REFERENCE_WORKPLACE'])),
                    name: Machine::where('custom_id', $record['CUSTOM_MACHINE_ID'])->first()->name ?? '',
                    start: $record['OP_PLAN_POS_START'],
                    end: $record['OP_PLAN_POS_END'],
                    te: $this->floatvalue($record['PROD_ORDER_POS_OPERATION_TE']),
                    tr: 0,
                    cavity: $record['OPERATION_CAVITY'],
                    machine_id_custom: $record['CUSTOM_MACHINE_ID'],
                    tool_id_custom: $record['PROD_ORDER_POS_OPERATION_CUSTOM_TOOL_ID'],
                    operation_code: $record['REFERENCE_WORKPLACE'],
                    tool_reference_nr: intval($record['REFERENCE_TOOL']),
                    status: $status,
                    registered_quantity: 0,
                    send_ahead_quantity: 0,
				);
				if ($record['IS_COMPLETED'] !== '1' ) {
					$query_for_alt_wkz = "SELECT  ANR, CONCAT('".$record['LANGUAGE_CODE']."',TRIM(MNr)) as CUSTOM_ALT_TOOL_ID, RNR, IPOS FROM infor.RELDB where saint = 76 AND ANr='".$record['ANR']."' ";
					$query_for_alt_machine = "SELECT  ANR, CONCAT('".$record['LANGUAGE_CODE']."',TRIM(MNr)) as CUSTOM_ALT_MACHINE_ID, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS TE, RNR, IPOS FROM infor.RELDB where saint = 66 AND ANr='".$record['ANR']."' ";
					if ($record['IS_PROPOSED'] === '1') {
						$query_for_alt_wkz = "SELECT  ANR, CONCAT('".$record['LANGUAGE_CODE']."',TRIM(MNr)) as CUSTOM_ALT_TOOL_ID, RNR, IPOS FROM infor.RELCB where saint = 76 AND ANr='".$record['ANR']."' ";
						$query_for_alt_machine = "SELECT  ANR, CONCAT('".$record['LANGUAGE_CODE']."',TRIM(MNr)) as CUSTOM_ALT_MACHINE_ID, CASE WHEN ZBKNZ_1 != 0 AND Zeitbasis > 0 THEN (te*36)/Zeitbasis ELSE ZyklusSOLL END AS TE, RNR, IPOS FROM infor.RELCB where saint = 66 AND ANr='".$record['ANR']."' ";
					}
					if ($record['LANGUAGE_CODE'] === 'DE-') {
						$stmtAlttool = $this->erp_germany->prepare($query_for_alt_wkz);
						$stmtAltmachine = $this->erp_germany->prepare($query_for_alt_machine);
					}elseif ($record['LANGUAGE_CODE'] === 'BG-') {
						$stmtAlttool = $this->erp_bulgaria->prepare($query_for_alt_wkz);
						$stmtAltmachine = $this->erp_bulgaria->prepare($query_for_alt_machine);
					}
					$stmtAlttool->setFetchMode(\PDO::FETCH_ASSOC);
					$stmtAlttool->execute();
					while ($alt_tool = $stmtAlttool->fetch()) {
						$prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']]->resources[] = new ProdOrderPosOperationResourceDto(
							pos: $alt_tool['IPOS'],
							item_id_tool_custom: $alt_tool['CUSTOM_ALT_TOOL_ID'],
							reference_nr: $alt_tool['RNR'],
						);
					}

					// add the selected tool as the alt tool resouce
					$currentOperation = $prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']];
					// Find the highest pos value in the resources
					$maxPos = 0;
					foreach ($currentOperation->resources as $resource) {
						$maxPos = max($maxPos, (int) $resource->pos);
					}

					// Add the new ProdOrderPosOperationResourceDto with pos + 1
					$currentOperation->resources[] = new ProdOrderPosOperationResourceDto(
						pos: (string) $maxPos + 1,
						item_id_tool_custom: $currentOperation->tool_id_custom ?? null,
						reference_nr:  $currentOperation->tool_reference_nr ?? null
					);

					$stmtAltmachine->setFetchMode(\PDO::FETCH_ASSOC);
					$stmtAltmachine->execute();
					while ($alt_machines = $stmtAltmachine->fetch()) {
						$prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']]->alt_machines[] = new ProdOrderPosOperationAltMachineDto(
							pos: $alt_machines['IPOS'],
							machine_id_custom: $alt_machines['CUSTOM_ALT_MACHINE_ID'],
							te: $this->floatvalue($alt_machines['TE']),
							reference_nr: $alt_machines['RNR'],
						);
					}

                    $prodOrderPosDto->operations[$record['CUSTOM_MACHINE_ID']]->alt_machines[] = new ProdOrderPosOperationAltMachineDto(
                        pos: 0,
                        machine_id_custom: $record['CUSTOM_MACHINE_ID'],
                        te: $this->floatvalue($record['PROD_ORDER_POS_OPERATION_TE']),
                        reference_nr: $record['REFERENCE_WORKPLACE'],
                    );
				}
			}


			if (!$record['BOM_POS']) {
				continue;
			}

			$record['BOM_ITEM_QUANTITY_TOTAL'] = $this->floatvalue($record['BOM_ITEM_QUANTITY_TOTAL']);
			$per_part = $record['BOM_ITEM_QUANTITY_TOTAL'] / $this->floatvalue($record['PROD_ORDER_POS_QUANTITY']);
			$prodOrderPosDto->components[] = new ProdOrderPosBomPosDto(
				pos: $record['BOM_POS'],
				item_id_custom: $record['BOM_ITEM_CUSTOM_ID'],
				qty_for_one_parent: $per_part,
				quantity_total: $this->floatvalue($record['BOM_ITEM_QUANTITY_TOTAL']),
				unit_of_measure_id_custom: $record['BOM_UNIT'],
				is_active: 1,
			);
		}

		return $dtos;
	}

	public function operationDtos(int $skip, int $take): array|false
	{
		$dtos = [];
		if ($skip) {
			return false;
		}
		$sql = "SELECT CONCAT('DE-',bomlist.item) as BOM_ITEM_CUSTOM_ID_MAIN,
		CONCAT('DE-',bomlist.MNr) as BOM_MACHINE_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		(CASE WHEN ZEITbasis <> 0 THEN (te*36)/Zeitbasis ELSE te*36 END) as TE,
		(CASE WHEN ZEITbasis <> 0 THEN (tr*36)/Zeitbasis ELSE tr*36 END) as TR,
		bomlist.ME as BOM_UNIT
		FROM (SELECT bom.MNr,bom.RNR, bom.IPos, bom.ZEITbasis, bom.tr, bom.ME, bom.te, art.MNr as item FROM infor.RELAB bom LEFT JOIN infor.relac art ON bom.rlnr = art.rlnr AND art.KTxt IS NOT NULL WHERE bom.saint IN (60) AND art.MNr IS NOT NULL) bomlist ORDER BY bomlist.item,bomlist.IPos";
		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',bomlist.item) as BOM_ITEM_CUSTOM_ID_MAIN,
		CONCAT('BG-',bomlist.MNr) as BOM_MACHINE_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		(CASE WHEN ZEITbasis <> 0 THEN (te*36)/Zeitbasis ELSE te*36 END) as TE,
		(CASE WHEN ZEITbasis <> 0 THEN (tr*36)/Zeitbasis ELSE tr*36 END) as TR,
		bomlist.ME as BOM_UNIT
		FROM (SELECT bom.MNr,bom.RNR, bom.IPos, bom.ZEITbasis, bom.tr, bom.ME, bom.te, art.MNr as item FROM infor.RELAB bom LEFT JOIN infor.relac art ON bom.rlnr = art.rlnr AND art.KTxt IS NOT NULL WHERE bom.saint IN (60) AND art.MNr IS NOT NULL) bomlist ORDER BY bomlist.item,bomlist.IPos";
		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}
		foreach ($results as $record) {
			if (!isset($dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']])) {
				$dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']] = new OperationPlanDto(
					custom_id: $record['BOM_ITEM_CUSTOM_ID_MAIN'],
					isImported: true
				);
			}
			$operationDto = $dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']];
			if (!isset($operationDto->operation_plan_pos[$record['BOM_MACHINE_CUSTOM_ID']])) {
				$operationDto->operation_plan_pos[$record['BOM_MACHINE_CUSTOM_ID']] = new OperationPlanPosDto(
					pos: $record['BOM_POS'],
					machine_id_custom: $record['BOM_MACHINE_CUSTOM_ID'],
					te: $this->floatvalue($record['TE']),
					tr: $this->floatvalue($record['TR']),
				);
			}
		}
		return $dtos;
	}

	/**
	 * @param int $skip
	 * @param int $take
	 * @return BomDto[]|false
	 */
	public function bomDtos(int $skip, int $take): array|false
	{
		$dtos = [];
		if ($skip) {
			return false;
		}
		$sql = "SELECT CONCAT('DE-',bomlist.item) as BOM_ITEM_CUSTOM_ID_MAIN,
		CONCAT('DE-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		(CASE WHEN ZEITbasis <> 0 THEN te/Zeitbasis ELSE te END) as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT
		FROM (SELECT bom.MNr,bom.RNR, bom.IPos, bom.ZEITbasis, bom.ME, bom.te, art.MNr as item FROM infor.RELAB bom LEFT JOIN infor.relac art ON bom.rlnr= art.rlnr AND art.Raint = 160 AND art.KTxt IS NOT NULL WHERE bom.saint IN (90) AND art.MNr IS NOT NULL ) bomlist ORDER BY bomlist.item,bomlist.IPos";
		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',bomlist.item) as BOM_ITEM_CUSTOM_ID_MAIN,
		CONCAT('BG-',bomlist.MNr) as BOM_ITEM_CUSTOM_ID,
		bomlist.IPos as BOM_POS,
		(CASE WHEN bomlist.ZEITbasis <> 0 THEN bomlist.te/bomlist.Zeitbasis ELSE te END) as BOM_ITEM_QUANTITY_PER_PART,
		bomlist.ME as BOM_UNIT
		FROM (SELECT bom.MNr,bom.RNR, bom.IPos, bom.ZEITbasis, bom.ME, bom.te, art.MNr as item FROM infor.RELAB bom LEFT JOIN infor.relac art ON bom.rlnr = art.rlnr AND art.Raint = 160 AND art.KTxt IS NOT NULL WHERE bom.saint IN (90) AND art.MNr IS NOT NULL) bomlist ORDER BY bomlist.item,bomlist.IPos";
		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}
		foreach ($results as $record) {
			if (!isset($dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']])) {
				$dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']] = new BomDto(
					custom_id: $record['BOM_ITEM_CUSTOM_ID_MAIN'],
				);
			}
			$bomDto = $dtos[$record['BOM_ITEM_CUSTOM_ID_MAIN']];
			if (!isset($bomDto->bom_pos[$record['BOM_ITEM_CUSTOM_ID']])) {
				$bomDto->bom_pos[$record['BOM_ITEM_CUSTOM_ID']] = new BomPosDto(
					pos: $record['BOM_POS'],
					custom_pos: $record['BOM_POS'],
					item_id_custom: $record['BOM_ITEM_CUSTOM_ID'],
					qty_for_one_parent: $this->floatvalue($record['BOM_ITEM_QUANTITY_PER_PART']),
				);
			}
		}
		return $dtos;
	}

	public function floatvalue($val){
		$val = str_replace(",",".",$val);
		$val = preg_replace('/\.(?=.*\.)/', '', $val);
		return floatval($val);
	}

	public function halls(): Collection
	{
		//Sync V10 Changes to V11
		$records = parent::halls();
		$results = [];
		return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
	}

	public function tools(): Collection
	{
		//Sync V10 Changes to V11
		$records = parent::tools();

		// the \"custom_id\" is there so that the result is in lowercase otherwise it would return it as CUSTOM_ID and that would then need looping through to just change the array param
		// 
		$sql = "SELECT CONCAT('DE-',TRIM(a.MNr)) AS \"custom_id\", 
			a.KTxt AS \"name\", 
			1 as \"is_active\",
			t.NoOfFormNests AS \"cavity\"
			FROM infor.relAc a
			LEFT JOIN infor.relTool t ON a.MNr = t.ToolNr AND t.RecordType = 1
			WHERE a.Raint = 180 AND a.KTxt IS NOT NULL";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',TRIM(a.MNr)) AS \"custom_id\", 
			a.KTxt AS \"name\", 
			1 as \"is_active\",
			t.NoOfFormNests AS \"cavity\"
			FROM infor.relAc a
			LEFT JOIN infor.relTool t ON a.MNr = t.ToolNr AND t.RecordType = 1
			WHERE a.Raint = 180 AND a.KTxt IS NOT NULL";

		$stmt = $this->erp_bulgaria->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}

		return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
	}

	public function toolDtos(int $skip, int $take): array|false
	{
		$dtos = parent::toolDtos($skip, $take) ?: [];
		$sql = "SELECT CONCAT('DE-',TRIM(a.MNr)) AS CUSTOM_ID, 
			a.KTxt AS NAME, 
			1 as IS_ACTIVE,
			t.NoOfFormNests AS CAVITY,
			stor.X as STORAGE_SHELF,
			stor.Y as STORAGE_LEVEL,
			stor.Z as STORAGE_COMPARTMENT,
			stor.STORENO as STORAGE_LOCATION,
			CASE WHEN t.CUTTINGTIMEUNIT = 'Sch' THEN t.MAXCUTTINGTIME WHEN t.CUTTINGTIMEUNIT = 'Stk' AND t.NoOfFormNests != 0 THEN t.MAXCUTTINGTIME / t.NoOfFormNests ELSE 0 END as guaranteed_quantity
			FROM infor.relAc a
			LEFT JOIN infor.relTool t ON a.MNr = t.ToolNr AND t.RecordType = 1
			LEFT JOIN (SELECT X,Y,Z,STORENO,ss.ITEMNO fROM infor.relWMSLocation Ic LEFT JOIN infor.relWMSStockSum ss on ss.LocationID = Ic.LocationID) stor ON stor.ITEMNO = a.MNR
			WHERE a.Raint = 180 AND a.KTxt IS NOT NULL
			OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',TRIM(a.MNr)) AS CUSTOM_ID, 
			a.KTxt AS NAME, 
			1 as IS_ACTIVE,
			t.NoOfFormNests AS CAVITY,
			stor.X as STORAGE_SHELF,
			stor.Y as STORAGE_LEVEL,
			stor.Z as STORAGE_COMPARTMENT,
			stor.STORENO as STORAGE_LOCATION,
			CASE WHEN t.CUTTINGTIMEUNIT = 'Sch' THEN t.MAXCUTTINGTIME WHEN t.CUTTINGTIMEUNIT = 'Stk' AND t.NoOfFormNests != 0 THEN t.MAXCUTTINGTIME / t.NoOfFormNests ELSE 0 END as guaranteed_quantity
			FROM infor.relAc a
			LEFT JOIN infor.relTool t ON a.MNr = t.ToolNr AND t.RecordType = 1
			LEFT JOIN (SELECT X,Y,Z,STORENO,ss.ITEMNO fROM infor.relWMSLocation Ic LEFT JOIN infor.relWMSStockSum ss on ss.LocationID = Ic.LocationID) stor ON stor.ITEMNO = a.MNR
			WHERE a.Raint = 180 AND a.KTxt IS NOT NULL
			OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

		$stmt = $this->erp_bulgaria->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}

		foreach ($results as $result) {
			$result['GUARANTEED_QUANTITY'] = $result['GUARANTEED_QUANTITY'] ?? 0;
			$dtos[] = new ToolDto(
				custom_id: $result['CUSTOM_ID'],
				name: $result['NAME'],
				is_active: $result['IS_ACTIVE'],
				cavity: $result['CAVITY'] ?? 0,
				guaranteed_quantity: $this->floatvalue($result['GUARANTEED_QUANTITY']),
				storage_shelf: $result['STORAGE_SHELF'] ?? '',
				storage_level: $result['STORAGE_LEVEL'] ?? '',
				storage_compartment: $result['STORAGE_COMPARTMENT'] ?? '',
				storage_location: $result['STORAGE_LOCATION'] ?? '',
				main_tool_id:  mb_substr($result['CUSTOM_ID'], 0,17),
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

	/**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false
    {
		$sql = "SELECT CONCAT('DE-', ITEMNO) AS ITEM_CUSTOM_ID, 
				SUM(QUANTITY) AS QUANTITY
				FROM INFOR.RELWMSSTOCKITEM 
				WHERE QASTATUS NOT IN (20, 40, 60) AND ARCHIVESTATUS IN (0) AND (ISAVAILABLE > 0 OR ASSIGNOR_ORDERTYPE IN(4, 9))
				GROUP BY ITEMNO
				OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$dtos = [];

		$plant = Plant::with('itemStateDefault')->first();
		$storageLocation = StorageLocation::first();
		$items = Item::where('is_tool', null)->pluck('custom_id')->toArray();

		foreach ($results as $result) {
			if(in_array($result['ITEM_CUSTOM_ID'], $items)) {
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

	/**
	 * @param int $skip
	 * @param int $take
	 * @return CallOffDto[]|false
	 */
	public function callOffDtos(int $skip, int $take): array|false
	{
		$dtos = [];

		$sql = "(
					SELECT CONCAT('DE-', ANR) AS CUSTOM_ID, RNR, 
					CONCAT('DE-', MNR) AS CUSTOM_ITEM_ID, 
					SEGM1_TERM AS CALLOFFDATE,
					SEGM1_MENG AS QUANTITY
					FROM infor.RELCB 
					WHERE SAINT = 90 AND SEGM1_TERM IS NOT NULL
				)
				UNION
				(
					SELECT CONCAT('DE-', ANR) AS CUSTOM_ID, RNR, 
					CONCAT('DE-',MNR) as CUSTOM_ITEM_ID, 
					TERM_4 as CALLOFFDATE,
					MENG_4 AS QUANTITY
					FROM infor.RELDB
					WHERE SAINT = 90 AND ZUST <= 4 AND TERM_4 IS NOT NULL
				)
				UNION
				(
					SELECT CONCAT('DE-', ANR) AS CUSTOM_ID, RNR, 
					CONCAT('DE-',MNR) as CUSTOM_ITEM_ID, 
					SEGM1_TERM AS CALLOFFDATE,
					OFFENLIEF AS QUANTITY
					FROM infor.RELFB
					WHERE OFFENLIEF > 0 AND SEGM1_TERM IS NOT NULL
				)
				OFFSET {$skip} ROWS FETCH NEXT {$take} ROWS ONLY";

		$stmt = $this->erp_germany->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		foreach ($results as $result) {
			$dtos[] = new CallOffDto(
				custom_id: $result['CUSTOM_ID'].'-'.$result['RNR'],
				item_id_custom: $result['CUSTOM_ITEM_ID'],
				date: $result['CALLOFFDATE'],
				quantity: (float) $result['QUANTITY']
			);
		}
		
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
		$query = "SELECT CONCAT('DE-',TRIM(PersonNr)) as \"custom_id\", 
			CONCAT(TRIM(Surname),CONCAT(' ',TRIM(Name))) as \"name\", 
			TRIM(UserName) as \"username\", 
			CASE WHEN TRIM(EMailAdress1) IS NULL OR TRIM(EMailAdress1) = '' THEN NULL ELSE TRIM(EMailAdress1) END as \"email\", 
			CASE WHEN DeleteFlag > 0 THEN 0 ELSE 1 END as \"is_active\"
			FROM infor.relODCPerson";

		$stmt = $this->erp_germany->prepare($query);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		$results = $stmt->fetchAll();

		$sql = "SELECT CONCAT('BG-',TRIM(PersonNr)) as \"custom_id\", 
			CONCAT(TRIM(Surname),CONCAT(' ',TRIM(Name))) as \"name\", 
			TRIM(UserName) as \"username\", 
			CASE WHEN TRIM(EMailAdress1) IS NULL OR TRIM(EMailAdress1) = '' THEN NULL ELSE TRIM(EMailAdress1) END as \"email\", 
			CASE WHEN DeleteFlag > 0 THEN 0 ELSE 1 END as \"is_active\"
			FROM infor.relODCPerson";
		$stmt = $this->erp_bulgaria->prepare($sql);
		$stmt->setFetchMode(\PDO::FETCH_ASSOC);
		$stmt->execute();
		while ($row = $stmt->fetch()) {
			$results[] = $row;
		}

		return $records->merge(collect($results)->chunk(env('DATA_CHUNK_SIZE')));
	}

	public function userGroups(): Collection
	{
		$results = [];
		return collect($results)->chunk(env('DATA_CHUNK_SIZE'));
	}
}

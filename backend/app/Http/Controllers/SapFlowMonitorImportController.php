<?php

namespace App\Http\Controllers;

use App\Enums\DataImportName;
use App\Enums\PackagingInstructionMachineStopType;
use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdInspectionOperationResourceType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\HandlingUnitItemDto;
use App\ExternalDataSource\Dto\PackagingInstructionDto;
use App\ExternalDataSource\Dto\PackagingInstructionPosDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationResourceDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosBomPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationResourceDto;
use App\ExternalDataSource\Dto\StockDto;
use App\Models\DataImport;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SapFlowMonitorImportController extends Controller
{

    public function storeHandlingUnit(Request $request)
    {
        $now = now();

        $dto = new HandlingUnitDto(
            custom_id: ltrim($request->get('HandlingUnitExternalID'), '0'),
            handling_unit_item_id_custom: $request->get('PackagingMaterial'),
            is_complete: $request->get('UserStatus') === 'PN',
            storage_location_id_custom: $request->get('StorageLocation'),
            items: collect($request->get('to_Item'))->map(function ($item) use ($request) {
                return new HandlingUnitItemDto(
                    item_id_custom: $item['Material'],
                    quantity: $item['HandlingUnitQuantity'],
                    batch: $item['Batch'],
                );
            })->toArray(),
            plant_id_custom: $request->get('Plant'),
        );

        $dataImport = DataImport::query()->create([
            'data' => $dto,
            'name' => DataImportName::HANDLING_UNIT,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storeStock(Request $request)
    {
        $now = now();

        $dto = new StockDto(
            item_id_custom: $request->get('Material'),
            plant_id_custom: $request->get('Plant'),
            storage_location_id_custom: $request->get('StorageLocation'),
            quantity: $request->get('MatlWrhsStkQtyInMatlBaseUnit'),
            batch: $request->get('Batch'),
        );

        $dataImport = DataImport::query()->create([
            'data' => $dto,
            'name' => DataImportName::STOCK,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storeProductionOrder(Request $request)
    {
        $now = now();

        $dto = new ProdOrderDto(
            custom_id: ltrim($request->get('ManufacturingOrder'), '0'),
            document_date: $this->parseDateTimeString($request->get('MfgOrderCreationDate'), $request->get('MfgOrderCreationTime')),
            order_type: $request->get('ManufacturingOrderCategory') == '10' ? ProdOrderType::PRODUCTION() : ProdOrderType::MAINTENANCE(),
            plant_id_production_custom: $request->get('ProductionPlant'),
            plant_id_custom: $request->get('Plant'),
            update_only: $request->get('OrderIsCreated') || !$request->get('OrderIsReleased')
        );


        $posStatus = ProdOrderPosStatus::PLANNED();

        if ($request->get("OrderIsLocked") || $request->get("OrderIsTechnicallyCompleted") || $request->get("OrderIsClosed")) {
            $posStatus = ProdOrderPosStatus::CLOSED();
        }
        if ($request->get("OrderIsMarkedForDeletion") || $request->get("OrderIsDeleted")) {
            $posStatus = ProdOrderPosStatus::DELETED();
        }
        $batch = $request->get('to_ProductionOrderItem')[0]['Batch'] ?? null ?: null;
        //TODO: NEEDS TO BE ADDED???
        if (env('EXTERNAL_DS_TARGET') == 'benacchio' && !$batch && $request->get("ManufacturingOrderType") == 'ZT01') {
            $batch = "#";
        }

        $orderPosition = new ProdOrderPosDto(
            pos: "10",
            item_id_custom: strlen($request->get('Material')) > 0 ? $request->get('Material') : null,
            start: $request->get("MfgOrderScheduledStartDate") && $request->get("MfgOrderScheduledStartTime") ?
                $this->parseDateTimeString($request->get('MfgOrderScheduledStartDate'), $request->get('MfgOrderScheduledStartTime')) :
                $this->parseDateTimeString($request->get('MfgOrderPlannedStartDate'), $request->get('MfgOrderPlannedStartTime'))
            ,
            end: $request->get("MfgOrderScheduledEndDate") && $request->get("MfgOrderScheduledEndTime") ?
                $this->parseDateTimeString($request->get('MfgOrderScheduledEndDate'), $request->get('MfgOrderScheduledEndTime')) :
                $this->parseDateTimeString($request->get('MfgOrderPlannedEndDate'), $request->get('MfgOrderPlannedEndTime'))
            ,
            status: $posStatus,
            quantity: $request->get('TotalQuantity'),
            //Serials not yet supported for flow import
            serials: [],
            storage_location_id_custom: $request->get('StorageLocation'),
            unit_of_measure_id_custom: $request->get('ProductionUnit'),
            notes: $request->get('OrderLongText'),
            batch: $batch,
        );

        $dto->positions[] = $orderPosition;

        foreach ($request->get('to_ProductionOrderComponent') as $component) {
            //TODO: NEEDED?
            if (($component['BOMItemCategory'] ?? 'L') != 'L' || ($component['MaterialComponentIsPhantomItem'] ?? false)) {
                continue;
            }

            $orderPosition->components[] = new ProdOrderPosBomPosDto(
                pos: $component['ReservationItem'],
                item_id_custom: $component['Material'],
                qty_for_one_parent: $component['RequiredQuantity'] / $orderPosition->quantity,
                quantity_total: $component['RequiredQuantity'],
                unit_of_measure_id_custom: $component['BaseUnit'],
                //TODO: CHECK not available
                is_active: !($component['MatlCompIsMarkedForDeletion'] ?? false),
                is_backflush: $component['MatlCompIsMarkedForBackflush'],
                is_quantity_fixed: $component['QuantityIsFixed'] == 'X',
                storage_location_id_custom: $component['StorageLocation'],
                batch: $component['Batch'],
                prod_order_pos_operation_pos: $component['ManufacturingOrderSequence'] . '-' . $component['ManufacturingOrderOperation'],
                is_bulk: $component['IsBulkMaterialComponent'],
                item_type: $component['ItemTyp'] ?? null,
                reference_document: $component['DocNumb'] ?? null,
                storage_bin_id_custom: $component['UbicaPostIss'] ?? null,
                item_number: $component['Itemnumb'] ?? null,
                warehouse_id_custom: $component['NMagcompl'] ?? null,
                warehouse_process_type: $component['TypeProcess'] ?? null,
                stock_type: $component['StockType'] ?? null,
                entitled_to_dispose_party: $component['OwnerAuth'] ?? null,
                stock_owner: $component['StockOwner'] ?? null,
                component_preparation_state: $component['stat_stage'] ?? null,
            );
        }

        $prodOrderPosOperationDto = null;
        foreach ($request->get('to_ProductionOrderOperation') as $operation) {
            $pos = $operation['ManufacturingOrderSequence'] . '-' . $operation['ManufacturingOrderOperation'];

            if (str_starts_with($operation['OperationControlProfile'], 'Q')) {
                //TODO: new fields need to be added
                $frequency = $this->getFrequency($operation['OperationControlProfile'], $operation['qrastereh'], $operation['qrastzeht']);

                if ($frequency !== null && $prodOrderPosOperationDto !== null) {
                    $prodOrderPosOperationDto->inspectionOperations[$pos] = new ProdInspectionOperationDto(
                        pos: $pos,
                        internal_id: $operation['OrderIntBillOfOperationsItem'] ?? null,
                        frequency: $frequency,
                        name: $operation['MfgOrderOperationText'] ?? null,
                        //TODO: new fields need to be added
                        interval_cycles: ($operation['qrastereh'] ?? '') == 'PZ' ? intval($operation['qrastmeng']) : null,
                        interval_seconds: strlen($operation['qrastzeht'] ?? '') ? intval($operation['qrastzfak'] * $this->getMultipleOfSecondsFromUnit($operation['qrastzeht'])) : null,
                    );
                }
            } else {
                if ($prodOrderPosOperationDto !== null) {
                    $orderPosition->operations[$prodOrderPosOperationDto->pos] = $prodOrderPosOperationDto;
                }

                $operationStatus = ProdOrderPosOperationStatus::PLANNED();

                if ($operation["OperationIsTechlyCompleted"] || $operation["OperationIsClosed"]) {
                    $operationStatus = ProdOrderPosOperationStatus::CLOSED();
                }
                if ($operation["OperationIsDeleted"]) {
                    $operationStatus = ProdOrderPosOperationStatus::DELETED();
                }

                $processingDurationSeconds =
                    $this->getMultipleOfSecondsFromUnit(
                        $operation['ProcUnit'] ?? // Custom api benacchio
                        $operation['ProcessinUM'] ?? // Custom api fna (note typo)
                        null
                    ) *
                    (
                        $operation['ProcessingTime'] ?? // Custom api benacchio
                        $operation['ProcessingDuration'] ?? // Custom api fna
                        0
                    );

                $setupDurationSeconds =
                    $this->getMultipleOfSecondsFromUnit(
                        $operation['SetupUnit'] ?? // Custom api benacchio
                        $operation['SetupUm'] ?? // Custom api fna
                        null
                    ) *
                    (
                        $operation['SetupTime'] ?? // Custom api benacchio
                        $operation['SetupDuration'] ?? // Custom api fna
                        0
                    );

                $prodOrderPosOperationDto = new ProdOrderPosOperationDto(
                    pos: $pos,
                    name: $operation['MfgOrderOperationText'],
                    start: $this->parseDateTimeString($operation['OpErlstSchedldExecStrtDte'], $operation['OpErlstSchedldExecStrtTme']),
                    end: $this->parseDateTimeString($operation['OpErlstSchedldExecEndDte'], $operation['OpErlstSchedldExecEndTme']),
                    te: $processingDurationSeconds / $operation['OpPlannedTotalQuantity'],
                    tr: $setupDurationSeconds,
                    //TODO: Needs to be added
                    cavity: strlen($request->get('ZZ1_COEFFICIENTESTAMPO_PLT') ?? '') ? intval($request->get('ZZ1_COEFFICIENTESTAMPO_PLT')) : 1,
                    machine_id_custom: $operation['WorkCenter'],
                    status: $operationStatus,
                    registered_quantity: $operation['OpTotalConfirmedYieldQty'],
                    plant_id_production_custom: $operation['ProductionPlant'],
                    operation_control_profile_id_custom: $operation['OperationControlProfile'],
                    quantity: $operation['OpPlannedTotalQuantity'],
                    unit_of_measure_id_custom: $operation['OperationUnit'],
                    prod_lot_id_custom: $request->get('ZZ1_IDSTAMPAGGIO_ORD') ?? null,
                );
            }
        }

        if ($prodOrderPosOperationDto !== null) {
            $orderPosition->operations[$prodOrderPosOperationDto->pos] = $prodOrderPosOperationDto;
        }

        foreach ($request->get('to_ProductionRsceTools') as $tool) {

            $opPos = '0' . '-' . $tool['ManufacturingOrderOperation'];

            if (isset($orderPosition->operations[$opPos])) {
                //Check if this is an equipment
                if ($tool['ProdnRsceToolCategory'] == 'E') {
                    $orderPosition->operations[$opPos]->resources[] = new ProdOrderPosOperationResourceDto(
                        pos: $tool['MfgOrderOpProdnRsceToolIntID'],
                        equipment_id_custom: $tool['ProductionResourceTool'],
                    );
                }
            }

            if (isset($orderPosition->operations[$prodOrderPosOperationDto->pos]->inspectionOperations[$opPos]) && $prodOrderPosOperationDto !== null) {
                if(collect(['E', 'D'])->contains($tool['ProdnRsceToolCategory'])) {
                    $external_id = null;

                    if($tool['ProdnRsceToolCategory'] == 'D') {
                        [$docNr, $docType, $docPart, $docVersion] = explode(' ', $tool['ProductionResourceTool'], 4);

                        $external_id = json_encode([
                            'doc_type' => $docType,
                            'doc_nr' => ltrim($docNr, '0'),
                            'doc_version' => $docVersion,
                            'doc_part' => $docPart,
                        ]);
                    }

                    $orderPosition->operations[$prodOrderPosOperationDto->pos]->inspectionOperations[$opPos]->prodInspectionOperationResourceDtos[] = new ProdInspectionOperationResourceDto(
                        pos: $tool['MfgOrderOpProdnRsceToolIntID'],
                        equipment_id_custom: $tool['ProdnRsceToolCategory'] == 'E' ? $tool['ProductionResourceTool'] : null,
                        type: $tool['ProdnRsceToolCategory'] == 'E' ? ProdInspectionOperationResourceType::EQUIPMENT : ($tool['ProdnRsceToolCategory'] == 'D' ? ProdInspectionOperationResourceType::SAP_DOCUMENT : null),
                        external_id: $external_id,
                    );
                }
            }
        }

        $dataImport = DataImport::query()->create([
            'data' => $dto,
            'name' => DataImportName::PROD_ORDER,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storePackagingInstruction(Request $request)
    {
        $now = now();

        $dto = new PackagingInstructionDto(
            custom_id: $request->get('PackingInstructionNumber'),
            uuid: $request->get('PackingInstructionID'),
            positions: collect($request->get('to_PackingInstructionComponent'))->map(function ($pos) {
                return new PackagingInstructionPosDto(
                    pos: ltrim($pos['PackingInstructionItem'], '0'),
                    is_container: ltrim($pos['PackingInstructionItem'], '0') == 10,
                    packed_item_id_custom: $pos['Material'] ?: null,
                    subordinate_packaging_instruction_uuid: $pos['PackingInstructionID'] ?: null,
                    target_quantity: $pos['PackingInstructionItmTargetQty'],
                    unit_of_measure_id_custom: $pos['UnitOfMeasure'],
                    is_active: !(isset($pos['PackingInstructionItemIsDel']) && strlen($pos['PackingInstructionItemIsDel'])),
                );
            })->toArray(),
            is_active: !$request->get('PackingInstructionIsDeleted'),
            machineStopType: $request->get('vegr2') === '1' ? PackagingInstructionMachineStopType::HU_FULL : PackagingInstructionMachineStopType::NO_STOP
        );

        $dataImport = DataImport::query()->create([
            'data' => $dto,
            'name' => DataImportName::PACKAGING_INSTRUCTION,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storeDefaultPackagingInstructions(Request $request)
    {
        $now = now();
        $dataImport = DataImport::query()->create([
            'data' => $request->all(),
            'name' => DataImportName::DEFAULT_PACKAGING_INSTRUCTION,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storeUsers(Request $request)
    {
        $now = now();
        $dataImport = DataImport::query()->create([
            'data' => $request->all(),
            'name' => DataImportName::USER,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function storeItems(Request $request)
    {
        $now = now();
        $dataImport = DataImport::query()->create([
            'data' => $request->all(),
            'name' => DataImportName::ITEM,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ImportController::singleImport($dataImport);

        return response()->json();
    }

    public function parseDateTime(string $date, ?string $time = null): Carbon
    {
        // $date is of form "/Date(1470268800000)/", time is of form "PT00H00M00S"

        if (!$time) {
            return Carbon::createFromFormat('Ymd', $date);
        }
        return Carbon::createFromFormat('Ymd His', "{$date} {$time}");
    }

    public function parseDateTimeString(string $date, ?string $time = null): string
    {
        return $this->parseDateTime($date, $time)->toDateTimeString();
    }

    private function getMultipleOfSecondsFromUnit(?string $unit): int
    {
        return match ($unit) {
            'S' => 1,
            'MIN' => 60,
            'H' => 60 * 60,
            'DAY' => 60 * 60 * 24,
            default => 0
        };
    }


    /**
     * @param $operationControlProfile
     * @return ProdInspectionOperationFrequency|null
     */
    public function getFrequency(string $operationControlProfile, ?string $cycleUnit = null, ?string $timeUnit = null): ?ProdInspectionOperationFrequency
    {
        switch ($operationControlProfile) {
            case 'QAPR':
                return ProdInspectionOperationFrequency::COMPONENT_SCANNED;
            case 'QFPR':
                return ProdInspectionOperationFrequency::OPERATION_CLOSED;
            case 'QFRQ':
                if ($cycleUnit == 'PZ') {
                    return ProdInspectionOperationFrequency::CYCLE_FREQUENCY;
                } else if (strlen($timeUnit ?? '')) {
                    return ProdInspectionOperationFrequency::TIME_FREQUENCY;
                }
                return null;
            case 'QIPR':
                return ProdInspectionOperationFrequency::OPERATION_IN_PRODUCTION;
            case 'QRST':
                return ProdInspectionOperationFrequency::MACHINE_STATE_QUALITY_RELEVANT;
            case 'QSET':
                return ProdInspectionOperationFrequency::OPERATION_IN_SETUP;
            case 'QTUR':
                return ProdInspectionOperationFrequency::MACHINE_SHIFT;
            case 'QUMV':
                return ProdInspectionOperationFrequency::HANDLING_UNIT_CREATED;
            default:
                return null;
        }
    }
}

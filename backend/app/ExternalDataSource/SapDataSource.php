<?php

namespace App\ExternalDataSource;

use App\Enums\CostType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\ExternalDataSource\Dto\ClassificationDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosBomPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\ExternalDataSource\Dto\SalesOrderDto;
use App\ExternalDataSource\Dto\SalesOrderPosDto;
use App\Models\DataImport;
use App\Models\Item;
use App\Models\Machine;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Date;

class SapDataSource extends BaseVisuExternalDataSource
{
    protected function getNonImportedXmlContent($name, $take = null)
    {
        if ($take)
            return DataImport::where('name', $name)->where('is_imported', 0)->orderBy("id")->take($take)->get();
        else
            return DataImport::where('name', $name)->where('is_imported', 0)->orderBy("id")->get();
    }

    private static function asArray(mixed $input): array
    {
        return is_array($input) ? $input : [$input];
    }

    /**
     * @param null $skip
     * @param null $take
     * @return array|false
     */
    public function itemDtos($skip, $take): array|false
    {
        $items = [];
        $itemChunk = $this->getNonImportedXmlContent('MATMAS05', $take);
        foreach ($itemChunk as $item) {
            $i = new ItemDto(
                ltrim($item->data->IDOC->E1MARAM->MATNR, '0'),
                $item->data->IDOC->E1MARAM->E1MAKTM->MAKTX,
                xml_id: $item->id
            );

            if (isset($item->data->IDOC->E1MARAM->NORMT))
                $i->hwe_norm_name = $item->data->IDOC->E1MARAM->NORMT;

            if (isset($item->data->IDOC->E1MARAM->WRKST))
                $i->hwe_warehouse_material = $item->data->IDOC->E1MARAM->WRKST;

            if (isset($item->data->IDOC->E1MARAM->E1MBEWM)) {
                $E1MBEWM = $item->data->IDOC->E1MARAM->E1MBEWM;
                if ($E1MBEWM) {
                    if (is_array($E1MBEWM)) {
                        $E1MBEWM = $E1MBEWM[0];
                    }

                    $i->hwe_period_year = $E1MBEWM->LFGJA;
                    $i->hwe_period_month = $E1MBEWM->LFMON;
                    $i->price = $E1MBEWM->VERPR;
                    $i->stock = $E1MBEWM->VVMLB;
                    $i->price_plan = $E1MBEWM->ZPLP1 ?? 0;
                    $i->price_plan_date = $E1MBEWM->ZPLD1 > 0 ? (Carbon::createFromFormat('Ymd', $E1MBEWM->ZPLD1) ?? null) : null;
                }
            }

            $items[] = $i;
        }

        return $items;
    }

    /**
     * @return Collection
     */
    public function machineDtos(int $skip, int $take): array|false
    {
        $baseVisuMachines = parent::machineDtos($skip, $take);

        if ($skip) {
            return $baseVisuMachines;
        }

        $records = collect([]);
        $items = json_decode($this->getNonImportedXmlContent('LOIWCS03'));
        foreach ($items as $item) {
            $dto = new MachineDto(
                custom_id: $item->data->IDOC->E1CRHDL->ARBPL,
                name: $item->data->IDOC->E1CRHDL->E1CRTXL->KTEXT,
                is_active: ($item->data->IDOC->E1CRHDL->STAND ?? '') != '099',
                xml_id: $item->id,
                lead_time_days: floatval($item->data->IDOC->E1CRHDL->PARV6) ?? 0
            );

            if (isset($item->data->IDOC->E1CRHDL->E1CRCOL)) {
                if (is_array($item->data->IDOC->E1CRHDL->E1CRCOL)) {
                    $dto->cost_center_id_custom = $item->data->IDOC->E1CRHDL->E1CRCOL[0]->KOSTL;
                } else {
                    $dto->cost_center_id_custom = $item->data->IDOC->E1CRHDL->E1CRCOL->KOSTL;
                }
            }

            $records->push($dto);
        }
        return $records->merge($baseVisuMachines)->toArray();
    }

    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        if ($skip != 0) {
            return false;
        }
        $dtos = [];
        /**
         * LOIPRO04 is for order
         */
        $items = collect(json_decode($this->getNonImportedXmlContent('LOIPRO04')))
            ->merge(json_decode($this->getNonImportedXmlContent('ZLOIPRO04')));


        $machines = collect();

        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = [
                'machine_group_custom_id' => $machine->machineGroup->custom_id ?? null,
                'auto_assign_machine' => $machine->machineGroup ? $machine->machineGroup->auto_assign_machine : true,
            ];
        }

        foreach ($items as $item) {
            if (gettype($item->data->IDOC->E1AFKOL->E1AFPOL) != "array") {
                $dto = new ProdOrderDto(
                    custom_id: ltrim($item->data->IDOC->E1AFKOL->AUFNR, '0'),
                    xml_id: $item->id,
                );
                $posDto = new ProdOrderPosDto(
                    pos: ltrim($item->data->IDOC->E1AFKOL->E1AFPOL->POSNR ?? '', '0'),
                    item_id_custom: ltrim($item->data->IDOC->E1AFKOL->E1AFPOL->MATNR ?? '', '0'),
                    due_date: Carbon::parse($item->data->IDOC->E1AFKOL->GLTRS)->toDateString(),
                    quantity: $item->data->IDOC->E1AFKOL->E1AFPOL->PSMNG,
                );

                $E1JSTKL = $item->data->IDOC->E1AFKOL->E1JSTKL;
                if (gettype($E1JSTKL) == 'object') {
                    $E1JSTKL = [$E1JSTKL];
                }
                foreach ($E1JSTKL as $status) {
                    if ($status->STAT == 'I0045') {
                        $posDto->status = ProdOrderPosStatus::CLOSED();
                    }
                }

                $dto->positions[] = $posDto;

                $prodOrderPosSerials = isset($item->data->IDOC->E1AFKOL->Z1EDL11) ? $item->data->IDOC->E1AFKOL->Z1EDL11 : [];

                if (gettype($prodOrderPosSerials) == 'object') {
                    $prodOrderPosSerials = [$prodOrderPosSerials];
                }

                // now iterate over prodOrderPosSerialNumbers
                foreach ($prodOrderPosSerials as $prodOrderPosSerial) {
                    if (isset($prodOrderPosSerial->SERNR)) {
                        $posDto->serials[] = ltrim(trim($prodOrderPosSerial->SERNR), '0');
                    }
                }

                $opPlanPoses = $item->data->IDOC->E1AFKOL->E1AFFLL->E1AFVOL;
                if (gettype($opPlanPoses) == 'object') {
                    $opPlanPoses = [$opPlanPoses];
                }

                // spliting items into separate array
                foreach ($opPlanPoses as $opPlanPos) {
                    $opDto = new ProdOrderPosOperationDto(
                        pos: $opPlanPos->VORNR ?? '',
                        name: $opPlanPos->LTXA1 ?? '',
                        start: isset($opPlanPos->ARBPL) ? $opPlanPos->FSSBD : null,
                        end: isset($opPlanPos->ARBPL) ? $opPlanPos->SSEVD : null,
                        te: isset($opPlanPos->BEARZ) ? ($opPlanPos->BEARZ / $posDto->quantity * 60) : 0,
                        tr: isset($opPlanPos->RUEST) ? ($opPlanPos->RUEST * 60) : 0,
                        registered_quantity: $opPlanPos->LMNGA ?? 0,
                        quantity: $opPlanPos->MGVRG ?: $posDto->quantity,
                    );

                    $statusList = $opPlanPos->E1JSTVL;
                    if (gettype($statusList) == 'object') {
                        $statusList = [$statusList];
                    }

                    foreach ($statusList as $attribute) {
                        if (
                            $attribute->STAT == 'I0009' ||
                            $attribute->STAT == 'I0052' ||
                            $attribute->STAT == 'I0010' ||
                            $attribute->STAT == 'I0045'
                        ) {
                            $opDto->status = ProdOrderPosOperationStatus::CLOSED();
                        }
                    }
                    foreach ($statusList as $attribute) {
                        if ($attribute->STAT == 'I0013') {
                            $opDto->status = ProdOrderPosOperationStatus::DELETED();
                        }
                    }

                    if (isset($opPlanPos->ARBPL) && isset($machines[$opPlanPos->ARBPL])) {
                        $opDto->machine_group_id_custom = $machines[$opPlanPos->ARBPL]['machine_group_custom_id'];
                        $opDto->machine_id_custom = $machines[$opPlanPos->ARBPL]['auto_assign_machine'] ? $opPlanPos->ARBPL : null;
                    }
                    $posDto->operations[] = $opDto;
                    $posDto->start = $posDto->start ?? $opDto->start;
                    $posDto->end = $opDto->end ?? $posDto->end;
                }

                $bomPoses = $item->data->IDOC->E1AFKOL->Z1PP_FAUFEN ?? [];
                if (gettype($bomPoses) == 'object') {
                    $bomPoses = [$bomPoses];
                }
                foreach ($bomPoses as $bomPos) {
                    $posDto->components[] = new ProdOrderPosBomPosDto(
                        pos: $bomPos->Z_EINSATZ_GEW,
                        item_id_custom: ltrim($bomPos->MATNR, '0'),
                        qty_for_one_parent: $bomPos->Z_STUECK_ANZ,
                        classifications: [
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "Z_SCHMELZE",
                                value_string: $bomPos->Z_SCHMELZE
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "Z_BLOCKIDENT",
                                value_string: $bomPos->Z_BLOCKIDENT
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "ISTABMESSUNG1",
                                value_string: $bomPos->ISTABMESSUNG1
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "ISTABMESSUNG2",
                                value_string: $bomPos->ISTABMESSUNG2
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "BLOCKGEOMETRIE",
                                value_string: $bomPos->BLOCKGEOMETRIE
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "Z_RESERV_LAENGE",
                                value_string: $bomPos->Z_RESERV_LAENGE
                            ),
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "Z_GEW_EINGABE",
                                value_string: $bomPos->Z_GEW_EINGABE
                            ),
                        ]
                    );
                }

                if (isset($item->data->IDOC->E1AFKOL->E1AFPOL->KDAUF) && isset($item->data->IDOC->E1AFKOL->E1AFPOL->KDPOS)) {
                    $posDto->sales_order_id_custom = ltrim($item->data->IDOC->E1AFKOL->E1AFPOL->KDAUF, '0');
                    $posDto->sales_order_pos_custom = ltrim($item->data->IDOC->E1AFKOL->E1AFPOL->KDPOS, '0');
                }

                $dtos[] = $dto;
            }
        }

        return $dtos;
    }

    /**
     * @return Collection
     */
    public function boms(): Collection
    {
        $records = collect([]);
        $boms = json_decode($this->getNonImportedXmlContent('LOIBOM01'));

        foreach ($boms as $bom) {
            $object = isset($bom->data->IDOC->E1MASTL->E1MASAL->E1STKOL->E1STPOL) ? $bom->data->IDOC->E1MASTL->E1MASAL->E1STKOL->E1STPOL : '';
            $records->push([
                'custom_id' => ltrim($bom->data->IDOC->E1MASTL->STLNR, '0'),
                'custom_item_id' => $object ? $object->IDNRK : '',
                'custom_pos' => $object ? $object->POSNR : '',
                'qty_for_one_parent' => $object ? $object->MENGE : 1,
                'xml_id' => $bom->id
            ]);
        }
        return $records;
    }

    public function customers(): Collection
    {
        $records = collect([]);
        $customers = collect(json_decode($this->getNonImportedXmlContent('DEBMAS05')))
            ->merge(json_decode($this->getNonImportedXmlContent('ZDEBMAS05')));
        foreach ($customers as $customer) {
            $record = [];
            $record['custom_id'] = ltrim($customer->data->IDOC->E1KNA1M->KUNNR, '0');
            $record['name'] = $customer->data->IDOC->E1KNA1M->NAME1;
            $record['name2'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->EIKTO ?? null;
            $record['address'] = $customer->data->IDOC->E1KNA1M->STRAS ?? null;
            $record['postal_code'] = $customer->data->IDOC->E1KNA1M->PSTLZ ?? null;
            $record['city'] = $customer->data->IDOC->E1KNA1M->ORT01 ?? null;
            $record['country_custom_id'] = $customer->data->IDOC->E1KNA1M->LAND1 ?? null;
            $record['telephone'] = $customer->data->IDOC->E1KNA1M->TELF1 ?? null;
            $record['vat'] = $customer->data->IDOC->E1KNA1M->STCEG ?? null;
            $record['total_insured'] = $customer->data->IDOC->E1KNA1M->E1KNB1M->VLIBB ?? null;
            $record['total_production'] = $customer->data->IDOC->E1KNA1M->Z1KNA1M->ZZAUB ?? null;
            $record['total_outstanding'] = $customer->data->IDOC->E1KNA1M->Z1KNA1M->SKFOR && is_numeric($customer->data->IDOC->E1KNA1M->Z1KNA1M->SKFOR) ? $customer->data->IDOC->E1KNA1M->Z1KNA1M->SKFOR : null;
            $record['total_revenue'] = $customer->data->IDOC->E1KNA1M->Z1KNA1M->ZZAUE ?? null;
            $record['sales_group_custom_id'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->VKBUR ?? null;
            $record['sales_area_custom_id'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->VKGRP ?? null;
            $record['sector_custom_id'] = $customer->data->IDOC->E1KNA1M->BRSCH ?? null;
            $record['customer_group_custom_id'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->KDGRP ?? null;
            $record['delivery_term_custom_id'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->INCO1 ?? null;
            $record['payment_term_custom_id'] = $customer->data->IDOC->E1KNA1M->E1KNVVM->ZTERM ?? null;

            //Do only import users of the following two user groups
            $record['is_active'] = $customer->data->IDOC->E1KNA1M->KTOKD == 'ZINT' ||
                ($customer->data->IDOC->E1KNA1M->KTOKD == 'ZDEB' &&
                    (
                        !property_exists($customer->data->IDOC->E1KNA1M, 'KUKLA') ||
                        $customer->data->IDOC->E1KNA1M->KUKLA == 'Z1')
                );
            $record['xml_id'] = $customer->id;
            $records->push($record);
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $records = collect([]);
        $suppliers = json_decode($this->getNonImportedXmlContent('CREMAS05'));
        foreach ($suppliers as $supplier) {
            $records->push([
                'custom_id' => ltrim($supplier->data->IDOC->E1LFA1M->LIFNR, '0'),
                'name' => $supplier->data->IDOC->E1LFA1M->NAME1,
                'is_active' => 1,
                'xml_id' => $supplier->id
            ]);
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function users(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function itemStates(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function salesOrderDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }
        $dtos = [];
        $salesOrders = json_decode($this->getNonImportedXmlContent('ORDERS05'));
        foreach ($salesOrders as $salesOrder) {
            $customCustomerId = null;

            foreach ($this::asArray($salesOrder->data->IDOC->E1EDKA1) as $partner) {
                if ($partner->PARVW == 'AG') {
                    $customCustomerId = ltrim($partner->PARTN, '0');
                }
            }

            $dto = new SalesOrderDto(
                custom_id: ltrim($salesOrder->data->IDOC->E1EDK01->BELNR, '0'),
                customer_id_custom: $customCustomerId,
                xml_id: $salesOrder->id,
            );


            foreach ($this::asArray($salesOrder->data->IDOC->E1EDK02) as $entry) {
                if (isset($entry->QUALF) && $entry->QUALF == '001') {
                    $dto->customer_reference = $entry->BELNR;
                }
            }

            foreach ($this::asArray($salesOrder->data->IDOC->E1EDP01) as $position) {
                $positionDto = new SalesOrderPosDto(
                    pos: ltrim($position->POSEX, '0'),
                    quantity: $position->MENGE ?? 0,
                );

                if (isset($position->LPRIO_BEZ)) {
                    $positionDto->classifications[] = new ClassificationDto(
                        class: "HWE",
                        attribute: "LPRIO_BEZ",
                        value_string: $position->LPRIO_BEZ ?? '',
                    );
                }

                foreach ($this::asArray($position->E1EDP02 ?? []) as $entry) {
                    if ($entry->QUALF == '002') {
                        $positionDto->customer_reference = $entry->ZEILE ?? null;
                    }
                }

                foreach ($this::asArray($position->E1EDP19 ?? []) as $entry) {
                    if ($entry->QUALF == '002') {
                        $positionDto->classifications[] =
                            new ClassificationDto(
                                class: "HWE",
                                attribute: "IDTNR",
                                value_string: ltrim($entry->IDTNR, '0'),
                            );
                    } else if ($entry->QUALF == '001') {
                        $positionDto->customer_material_number = ltrim($entry->IDTNR, '0');
                    }
                }

                foreach ($this::asArray($position->E1EDP35 ?? []) as $entry) {
                    $qualz_to_import = [
                        '002', // Kennzeichnung
                        '003' // Rostschutz
                    ];

                    if (in_array($entry->QUALZ, $qualz_to_import)) {
                        $positionDto->classifications[] = new ClassificationDto(
                            class: "HWE",
                            attribute: $entry->CUSADD,
                            value_string: $entry->CUSADD_BEZ,
                        );
                    }
                }

                $fieldsToImport = collect([
                    "ZHF",
                    "ZAP",
                    "ZZV",
                    "MVGR"
                ]);

                foreach ($this::asArray($position->E1EDPT1 ?? []) as $entry) {
                    $shouldImport = $fieldsToImport->contains(
                        fn($field) => str_starts_with($entry->TDID, $field)
                    );

                    if (!$shouldImport) {
                        continue;
                    }

                    $E1EDPT2 = $entry->E1EDPT2;

                    if (gettype($E1EDPT2) == 'object') {
                        $E1EDPT2 = [$E1EDPT2];
                    }
                    $lines = [];
                    foreach ($E1EDPT2 as $entry2) {
                        if (isset($entry2->TDLINE)) {
                            $lines[] = $entry2->TDLINE;
                        }
                    }
                    $positionDto->classifications[] = new ClassificationDto(
                        class: "HWE",
                        attribute: $entry->TDID,
                        value_string: implode("\n", $lines),
                    );
                }

                $dto->sales_order_pos[] = $positionDto;
            }

            $dtos[] = $dto;
        }
        return $dtos;
    }

    public function costCenters(): Collection
    {
        $costCenters = collect([]);

        $costCenterXmls = $this->getNonImportedXmlContent('COACTV01');
        foreach ($costCenterXmls as $costCenterXml) {
            if (isset($costCenterXml->data->IDOC->E1KOKRS) &&
                isset($costCenterXml->data->IDOC->E1KOKRS->E1COST)) {

                foreach ($this::asArray($costCenterXml->data->IDOC->E1KOKRS->E1COST) as $singleCostCenter) {
                    foreach (range(1, 12) as $month) {
                        $costTypeStr = substr($singleCostCenter->OBJNR, 16, 4);

                        $costType = match ($costTypeStr) {
                            'ZSTK1', 'ZSTK' => CostType::QUANTITY(),
                            'ZGEW1', 'ZGEW' => CostType::WEIGHT(),
                            default => CostType::TIME(),
                        };

                        $customId = substr($singleCostCenter->OBJNR, 6, 10);

                        $costCenter = [
                            'custom_id' => $customId,
                            'cost' => $customId == '0000231010' ? 1 : $singleCostCenter->{"TKF" . str_pad($month, 3, "0", STR_PAD_LEFT)},
                            'cost_type' => $costType,
                            'valid_from' => Date::createFromDate($singleCostCenter->GJAHR, $month, 1)->firstOfMonth()->toDateString(),
                            'valid_to' => Date::createFromDate($singleCostCenter->GJAHR, $month, 1)->lastOfMonth()->toDateString(),
                            'is_active' => true,
                            'xml_id' => $costCenterXml->id
                        ];
                        $costCenters->push($costCenter);
                    }
                }
            }
        }

        return $costCenters;
    }

    public function classifications($skip, $take): array|false
    {

        $classifications = collect([]);
        foreach ($this->getNonImportedXmlContent('CLFMAS02', $take) as $clf) {

            if (in_array($clf->data->IDOC->E1OCLFM->E1KSSKM->CLASS, ['HWE_MATERIALSTAMM', 'HWE_MATERIALCHARGE'])) {

                if (isset($clf->data->IDOC->E1OCLFM->E1AUSPM)) {
                    if (is_array($clf->data->IDOC->E1OCLFM->E1AUSPM)) {
                        foreach ($clf->data->IDOC->E1OCLFM->E1AUSPM as $class) {
                            $classification = [
                                'custom_id' => ltrim($clf->data->IDOC->E1OCLFM->OBJEK, '0'),
                                'model_type' => Item::class,
                                'xml_id' => $clf->id,
                                'class' => $clf->data->IDOC->E1OCLFM->E1KSSKM->CLASS,
                                'attribute' => $class->ATNAM,
                                'value_string' => $class->ATWRT ?? null,
                                'value_double' => floatval($class->ATFLV) ?? null,
                            ];

                            $classifications->push($classification);
                        }
                    } else {
                        $classification = [
                            'custom_id' => ltrim($clf->data->IDOC->E1OCLFM->OBJEK, '0'),
                            'model_type' => Item::class,
                            'xml_id' => $clf->id,
                            'class' => $clf->data->IDOC->E1OCLFM->E1KSSKM->CLASS,
                            'attribute' => $clf->data->IDOC->E1OCLFM->E1AUSPM->ATNAM,
                            'value_string' => $clf->data->IDOC->E1OCLFM->E1AUSPM->ATWRT ?? null,
                            'value_double' => floatval($clf->data->IDOC->E1OCLFM->E1AUSPM->ATFLV) ?? null,
                        ];

                        $classifications->push($classification);
                    }
                }
            }
        }

        return $classifications->toArray();
    }
}

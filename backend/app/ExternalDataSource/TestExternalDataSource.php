<?php

namespace App\ExternalDataSource;

use App\Contracts\ExternalDataSource;
use App\Enums\ComponentPreparationState;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosBomPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\ExternalDataSource\Dto\SettingsDto;
use Illuminate\Support\Collection;

class TestExternalDataSource implements ExternalDataSource
{
    public function halls(): Collection
    {
        return collect([]);
    }

    public function hallDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function itemDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function itemGroups(): Collection
    {
        return collect([]);
    }

    public function itemGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function machineGroups(): Collection
    {
        return collect([]);
    }

    public function machineGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function operations(): Collection
    {
        return collect([]);
    }

    public function operationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        return collect([]);
    }

    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        if ($skip)
            return false;

        $prodOrderDto = new ProdOrderDto(
            custom_id: "X1000040",
            document_date: "2025-01-11 14:58:05",
            positions: [
                new ProdOrderPosDto(
                    pos: "10",
                    item_id_custom: "C419261011",
                    start: "2025-01-10 09:00:00",
                    end: "2025-01-10 09:00:00",
                    status: ProdOrderPosStatus::PLANNED(),
                    quantity: 45.0,
                    operations: [
                        "0-0010" => new ProdOrderPosOperationDto(
                            pos: "0-0010",
                            name: "Montaggio",
                            start: "2025-01-10 09:00:00",
                            end: "2025-01-10 09:00:00",
                            te: 0.0,
                            tr: 0.0,
                            cavity: 1,
                            machine_id_custom: "85015",
                            status: ProdOrderPosOperationStatus::PLANNED(),
                            teardown_time: 0,
                            transfer_time: 0,
                            registered_quantity: 2,
                            operator_usage_factor: 1.0,
                            plant_id_production_custom: "2332",
                            operation_control_profile_id_custom: "YBP8",
                            quantity: 45.0,
                            unit_of_measure_id_custom: "PC",
                        )
                    ],
                    serials: [
                        "2332032500000537",
                        "2332032500000538",
                        "2332032500000539",
                        "2332032500000540",
                        "2332032500000541",
                        "2332032500000542",
                        "2332032500000543",
                        "2332032500000544",
                        "2332032500000545",
                        "2332032500000546",
                        "2332032500000547",
                        "2332032500000548",
                        "2332032500000549",
                        "2332032500000550",
                        "2332032500000551",
                        "2332032500000552",
                        "2332032500000553",
                        "2332032500000554",
                        "2332032500000555",
                        "2332032500000556",
                        "2332032500000557",
                        "2332032500000558",
                        "2332032500000559",
                        "2332032500000560",
                        "2332032500000561",
                        "2332032500000562",
                        "2332032500000563",
                        "2332032500000564",
                        "2332032500000565",
                        "2332032500000566",
                        "2332032500000567",
                        "2332032500000568",
                        "2332032500000569",
                        "2332032500000570",
                        "2332032500000571",
                        "2332032500000572",
                        "2332032500000573",
                        "2332032500000574",
                        "2332032500000575",
                        "2332032500000576",
                        "2332032500000577",
                        "2332032500000578",
                        "2332032500000579",
                        "2332032500000580",
                        "2332032500000581",
                    ],
                    storage_location_id_custom: "F1",
                    unit_of_measure_id_custom: "PC",
                    notes: "694876; ",
                )
            ],
            order_type: ProdOrderType::PRODUCTION(),
            plant_id_production_custom: "2332",
            plant_id_custom: "2332",
        );


        $orderDto = new ProdOrderDto(
            custom_id: "1008023",
            document_date: "2025-01-17 16:56:59",
            positions: [
                new ProdOrderPosDto(
                    pos: "10",
                    item_id_custom: "SZHC541VRB049",
                    start: "2025-02-17 09:00:00",
                    end: "2025-02-17 09:22:51",
                    status: ProdOrderPosStatus::PLANNED(),
                    quantity: 3.0,
                    operations: [
                        "0-0005" => new ProdOrderPosOperationDto(
                            pos: "0-0005",
                            name: "Preparazione Motore",
                            start: "2025-02-17 09:00:00",
                            end: "2025-02-17 09:07:51",
                            te: 156.0,
                            tr: 0.0,
                            cavity: 1,
                            machine_id_custom: "30009",
                            status: ProdOrderPosOperationStatus::PLANNED(),
                            teardown_time: 0,
                            transfer_time: 0,
                            registered_quantity: 3,
                            operator_usage_factor: 1.0,
                            plant_id_production_custom: "2331",
                            operation_control_profile_id_custom: "YBP1",
                            quantity: 3.0,
                            unit_of_measure_id_custom: "PC"
                        ),
                        "0-0010" => new ProdOrderPosOperationDto(
                            pos: "0-0010",
                            name: "Montaggio Collaudo Imballo",
                            start: "2025-02-17 09:07:51",
                            end: "2025-02-17 09:22:51",
                            te: 300.0,
                            tr: 0.0,
                            cavity: 1,
                            machine_id_custom: "30030",
                            status: ProdOrderPosOperationStatus::PLANNED(),
                            teardown_time: 0,
                            transfer_time: 0,
                            registered_quantity: 0,
                            operator_usage_factor: 1.0,
                            plant_id_production_custom: "2331",
                            operation_control_profile_id_custom: "YBP8",
                            quantity: 3.0,
                            unit_of_measure_id_custom: "PC"
                        ),
                    ],
                    components: [
                        new ProdOrderPosBomPosDto(
                            pos: 144,
                            item_id_custom: "9220202",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 106,
                            item_id_custom: "9122333",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 113,
                            item_id_custom: "9122333",
                            qty_for_one_parent: 8.0,
                            quantity_total: 24.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 147,
                            item_id_custom: "9220201",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 146,
                            item_id_custom: "9070394",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 102,
                            item_id_custom: "9069364",
                            qty_for_one_parent: 6.0,
                            quantity_total: 18.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 127,
                            item_id_custom: "9412453",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 79,
                            item_id_custom: "9047097",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 78,
                            item_id_custom: "9050626",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 92,
                            item_id_custom: "9053420",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 143,
                            item_id_custom: "9220047",
                            qty_for_one_parent: 5.5,
                            quantity_total: 16.5,
                            unit_of_measure_id_custom: "M",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 124,
                            item_id_custom: "9412016",
                            qty_for_one_parent: 4.0,
                            quantity_total: 12.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 82,
                            item_id_custom: "9050372",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 93,
                            item_id_custom: "9270046",
                            qty_for_one_parent: 0.9,
                            quantity_total: 2.7,
                            unit_of_measure_id_custom: "M",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 80,
                            item_id_custom: "9047020",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 142,
                            item_id_custom: "9415841",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 126,
                            item_id_custom: "9280038",
                            qty_for_one_parent: 0.9,
                            quantity_total: 2.7,
                            unit_of_measure_id_custom: "KG",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 121,
                            item_id_custom: "S37302430",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 141,
                            item_id_custom: "9094620",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 100,
                            item_id_custom: "4100800",
                            qty_for_one_parent: 5.0,
                            quantity_total: 15.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 125,
                            item_id_custom: "9131681",
                            qty_for_one_parent: 8.0,
                            quantity_total: 24.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 90,
                            item_id_custom: "9107290",
                            qty_for_one_parent: 3.0,
                            quantity_total: 9.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 105,
                            item_id_custom: "9107290",
                            qty_for_one_parent: 5.0,
                            quantity_total: 15.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 112,
                            item_id_custom: "9107287",
                            qty_for_one_parent: 4.0,
                            quantity_total: 12.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 123,
                            item_id_custom: "9107287",
                            qty_for_one_parent: 4.0,
                            quantity_total: 12.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 122,
                            item_id_custom: "S37502320",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 108,
                            item_id_custom: "4100789",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 109,
                            item_id_custom: "9415853",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 120,
                            item_id_custom: "S30502330",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 101,
                            item_id_custom: "4101314",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 84,
                            item_id_custom: "4100770",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 104,
                            item_id_custom: "9104151",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 107,
                            item_id_custom: "4100254",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 89,
                            item_id_custom: "9107244",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 140,
                            item_id_custom: "9038046",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 103,
                            item_id_custom: "9101194",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 116,
                            item_id_custom: "S30500160",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 115,
                            item_id_custom: "S16900480",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: true,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 77,
                            item_id_custom: "85HZS00127",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 114,
                            item_id_custom: "SD00066",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 137,
                            item_id_custom: "9096296",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 138,
                            item_id_custom: "9094166",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 139,
                            item_id_custom: "9091285",
                            qty_for_one_parent: 4.0,
                            quantity_total: 12.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "01",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: null,
                            reference_document: null,
                            storage_bin_id_custom: null,
                            item_number: null,
                            warehouse_id_custom: null,
                            warehouse_process_type: null,
                            stock_type: null,
                            entitled_to_dispose_party: null,
                            stock_owner: null,
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 149,
                            item_id_custom: "845S0CA",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "300",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 152,
                            item_id_custom: "9220209",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: false,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "320",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::NOT_PREPARED
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 150,
                            item_id_custom: "9076021",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "310",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 81,
                            item_id_custom: "D078001",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "20",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 83,
                            item_id_custom: "9051087",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "30",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: null,
                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 85,
                            item_id_custom: "9043683",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "40",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 86,
                            item_id_custom: "9053912",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "50",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 87,
                            item_id_custom: "9083812",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "60",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 88,
                            item_id_custom: "9416615",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "70",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 91,
                            item_id_custom: "9421436",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "80",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 94,
                            item_id_custom: "9050651",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "90",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 95,
                            item_id_custom: "9420460",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "100",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 96,
                            item_id_custom: "S13400020",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "110",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 97,
                            item_id_custom: "S13400190",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "120",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 98,
                            item_id_custom: "9082026",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "130",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 99,
                            item_id_custom: "9082025",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "140",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 110,
                            item_id_custom: "P021250",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "150",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 111,
                            item_id_custom: "9075022",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "160",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 117,
                            item_id_custom: "4100809",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "170",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 118,
                            item_id_custom: "S31004680",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCCO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "180",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y320",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 119,
                            item_id_custom: "9421716",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "190",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 128,
                            item_id_custom: "9070165",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "200",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 129,
                            item_id_custom: "9016532",
                            qty_for_one_parent: 2.0,
                            quantity_total: 6.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "210",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 130,
                            item_id_custom: "9017353",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "220",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 131,
                            item_id_custom: "9026836",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "230",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 132,
                            item_id_custom: "9019617",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "240",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 133,
                            item_id_custom: "R_753053",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "250",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 134,
                            item_id_custom: "9019688",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "260",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 135,
                            item_id_custom: "9019690",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "270",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 136,
                            item_id_custom: "9018731",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "280",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                        new ProdOrderPosBomPosDto(
                            pos: 145,
                            item_id_custom: "9070561",
                            qty_for_one_parent: 1.0,
                            quantity_total: 3.0,
                            unit_of_measure_id_custom: "PC",
                            name: null,
                            is_active: true,
                            is_backflush: true,
                            is_quantity_fixed: false,
                            storage_location_id_custom: "02",
                            batch: "",
                            prod_order_pos_operation_pos: "0-0010",
                            classifications: [],
                            is_bulk: false,
                            item_type: "PCSO",
                            reference_document: "5356",
                            storage_bin_id_custom: "A30030",
                            item_number: "290",
                            warehouse_id_custom: "RO01",
                            warehouse_process_type: "Y220",
                            stock_type: "FN",
                            entitled_to_dispose_party: "BP2331",
                            stock_owner: "BP2331",
                            component_preparation_state: ComponentPreparationState::PREPARED,

                        ),
                    ],
                    serials: [
                        "2331072500005133",
                        "2331072500005134",
                        "2331072500005135",
                    ],
                    storage_location_id_custom: "M6",
                    unit_of_measure_id_custom: "PC",
                    notes: "",
                ),
            ],
            xml_id: null,
            order_type: ProdOrderType::PRODUCTION(),
            plant_id_production_custom: "2331",
            plant_id_custom: "2331",
            update_only: false,
            classifications: [],
            is_closed: false,
        );

        $orders = collect();
        foreach (range(0, 99) as $i) {
            $orders->push($orderDto);
        }

        return $orders->toArray();
    }

    public
    function boms(): Collection
    {
        return collect([]);
    }

    public
    function bomDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function tools(): Collection
    {
        return collect([]);
    }

    public
    function toolDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function warehouses(): Collection
    {
        return collect([]);
    }

    public
    function warehouseDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function storageBinDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function stocks(): Collection
    {
        return collect([]);
    }

    public
    function stockDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function callOffs(): Collection
    {
        return collect([]);
    }

    public
    function callOffDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function shiftModelDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function shiftDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function capacityDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function customers(): Collection
    {
        return collect([]);
    }

    public
    function customerDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function suppliers(): Collection
    {
        return collect([]);
    }

    public
    function supplierDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function users(): Collection
    {
        return collect([]);
    }

    public
    function userDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function userGroups(): Collection
    {
        return collect([]);
    }

    public
    function userGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function permissionsByModuleName($moduleName): Collection
    {
        return collect([]);
    }

    public
    function permissionsByModuleNameDtos(string $moduleName, int $skip, int $take): array|false
    {
        return false;
    }

    public
    function itemStates(): Collection
    {
        return collect([]);
    }

    public
    function itemStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function machineStates(): Collection
    {
        return collect([]);
    }

    public
    function machineStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function machineStateGroups(): Collection
    {
        return collect([]);
    }

    public
    function machineStateGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function salesOrders(): Collection
    {
        return collect([]);
    }

    public
    function salesOrderDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function departmentDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function tpmGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function costCenters(): Collection
    {
        return collect([]);
    }

    public
    function costCenterDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function settings(): Collection
    {
        return collect([]);
    }

    public
    function settingsDto(): SettingsDto|false
    {
        return false;
    }

    public
    function classifications($skip, $take): array|false
    {
        return false;
    }

    public
    function classificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function resourceGroups($skip, $take): array|false
    {
        return false;
    }

    public
    function resourceGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function qualificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function packagingInstructionDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function productionSupplyAreaDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function handlingUnitDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function machineUserTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function machineProdOrderPosOperationTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function machineStateTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function offDayDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function equipmentDtos(int $skip, int $take, ?string $serialFilter = null, ?string $itemFilter = null): array|false
    {
        return false;
    }

    public
    function prodInspectionOperationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function inspectionLotDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public
    function attributeSetDtos(int $skip, int $take): array|false
    {
        return false;
    }
}

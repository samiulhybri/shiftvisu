<?php

namespace App\Contracts;

use App\ExternalDataSource\Dto\AttributeSetDto;
use App\ExternalDataSource\Dto\EquipmentDto;
use App\ExternalDataSource\Dto\InspectionLotDto;
use App\ExternalDataSource\Dto\InspectionSpecificationDto;
use App\ExternalDataSource\Dto\ItemStateDto;
use App\ExternalDataSource\Dto\BomDto;
use App\ExternalDataSource\Dto\CallOffDto;
use App\ExternalDataSource\Dto\CapacityDto;
use App\ExternalDataSource\Dto\ClassificationDto;
use App\ExternalDataSource\Dto\CostCenterDto;
use App\ExternalDataSource\Dto\CustomerDto;
use App\ExternalDataSource\Dto\DepartmentDto;
use App\ExternalDataSource\Dto\HallDto;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemGroupDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\MachineGroupDto;
use App\ExternalDataSource\Dto\MachineProdOrderPosOperationTimeDto;
use App\ExternalDataSource\Dto\MachineStateDto;
use App\ExternalDataSource\Dto\MachineStateGroupDto;
use App\ExternalDataSource\Dto\MachineStateTimeDto;
use App\ExternalDataSource\Dto\MachineUserTimeDto;
use App\ExternalDataSource\Dto\OffDayDto;
use App\ExternalDataSource\Dto\OperationPlanDto;
use App\ExternalDataSource\Dto\PackagingInstructionDto;
use App\ExternalDataSource\Dto\PermissionDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProductionSupplyAreaDto;
use App\ExternalDataSource\Dto\QualificationDto;
use App\ExternalDataSource\Dto\ResourceGroupDto;
use App\ExternalDataSource\Dto\SalesOrderDto;
use App\ExternalDataSource\Dto\SettingsDto;
use App\ExternalDataSource\Dto\ShiftDto;
use App\ExternalDataSource\Dto\ShiftModelDto;
use App\ExternalDataSource\Dto\StockDto;
use App\ExternalDataSource\Dto\StorageBinDto;
use App\ExternalDataSource\Dto\SupplierDto;
use App\ExternalDataSource\Dto\ToolDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\ExternalDataSource\Dto\TpmSubGroupDto;
use App\ExternalDataSource\Dto\UserDto;
use App\ExternalDataSource\Dto\UserGroupDto;
use App\ExternalDataSource\Dto\WarehouseDto;
use Illuminate\Support\Collection;

interface ExternalDataSource
{
    public function halls(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return HallDto[]|false
     */
    public function hallDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ItemDto[]|false
     */
    public function itemDtos(int $skip, int $take): array|false;

    public function itemGroups(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return ItemGroupDto[]|false
     */
    public function itemGroupDtos(int $skip, int $take): array|false;

    public function machineGroups(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineGroupDto[]|false
     */
    public function machineGroupDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineDto[]|false
     */
    public function machineDtos(int $skip, int $take): array|false;

    public function operations(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return OperationPlanDto[]|false
     */
    public function operationDtos(int $skip, int $take): array|false;

    public function prodOrders(?string $onlyCustomId): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @param string|null $onlyCustomId
     * @return ProdOrderDto[]|false
     */
    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false;

    public function boms(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return BomDto[]|false
     */
    public function bomDtos(int $skip, int $take): array|false;

    public function tools(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return ToolDto[]|false
     */
    public function toolDtos(int $skip, int $take): array|false;

    public function warehouses(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return WarehouseDto[]|false
     */
    public function warehouseDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return StorageBinDto[]|false
     */
    public function storageBinDtos(int $skip, int $take): array|false;

    public function stocks(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false;

    public function callOffs(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return CallOffDto[]|false
     */
    public function callOffDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftModelDto[]|false
     */
    public function shiftModelDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftDto[]|false
     */
    public function shiftDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return CapacityDto[]|false
     */
    public function capacityDtos(int $skip, int $take): array|false;

    public function customers(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return CustomerDto[]|false
     */
    public function customerDtos(int $skip, int $take): array|false;

    public function suppliers(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return SupplierDto[]|false
     */
    public function supplierDtos(int $skip, int $take): array|false;

    public function users(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return UserDto[]|false
     */
    public function userDtos(int $skip, int $take): array|false;

    public function userGroups(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return UserGroupDto[]|false
     */
    public function userGroupDtos(int $skip, int $take): array|false;

    public function permissionsByModuleName($moduleName): Collection;

    /**
     * @param string $moduleName
     * @param int $skip
     * @param int $take
     * @return PermissionDto[]|false
     */
    public function permissionsByModuleNameDtos(string $moduleName, int $skip, int $take): array|false;

    public function itemStates(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return ItemStateDto[]|false
     */
    public function itemStateDtos(int $skip, int $take): array|false;

    public function machineStates(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateDto[]|false
     */
    public function machineStateDtos(int $skip, int $take): array|false;

    public function machineStateGroups(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateGroupDto[]|false
     */
    public function machineStateGroupDtos(int $skip, int $take): array|false;

    public function salesOrders(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return SalesOrderDto[]|false
     */
    public function salesOrderDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return DepartmentDto[]|false
     */
    public function departmentDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return TpmGroupDto[]|false
     */
    public function tpmGroupDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return TpmSubGroupDto[]|false
     */
    public function tpmSubGroupDtos(int $skip, int $take): array|false;

    public function costCenters(): Collection;

    /**
     * @param int $skip
     * @param int $take
     * @return CostCenterDto[]|false
     */
    public function costCenterDtos(int $skip, int $take): array|false;

    public function settings(): Collection;

    public function settingsDto(): SettingsDto|false;

    public function classifications($skip, $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ClassificationDto[]|false
     */
    public function classificationDtos(int $skip, int $take): array|false;

    public function resourceGroups($skip, $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ResourceGroupDto[]|false
     */
    public function resourceGroupDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return QualificationDto[]|false
     */
    public function qualificationDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return PackagingInstructionDto[]|false
     */
    public function packagingInstructionDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ProductionSupplyAreaDto[]|false
     */
    public function productionSupplyAreaDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return HandlingUnitDto[]|false
     */
    public function handlingUnitDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineUserTimeDto[]|false
     */
    public function machineUserTimeDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineProdOrderPosOperationTimeDto[]|false
     */
    public function machineProdOrderPosOperationTimeDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateTimeDto[]|false
     */
    public function machineStateTimeDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return OffDayDto[]|false
     */
    public function offDayDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @param string|null $serialFilter
     * @param string|null $itemFilter
     * @return EquipmentDto[]|false
     */
    public function equipmentDtos(int $skip, int $take, ?string $serialFilter = null, ?string $itemFilter = null): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return ProdInspectionOperationDto[]|false
     */
    public function prodInspectionOperationDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionLotDto[]|false
     */
    public function inspectionLotDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return AttributeSetDto[]|false
     */
    public function attributeSetDtos(int $skip, int $take): array|false;

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionSpecificationDto[]|false
     */
    public function inspectionSpecificationDtos(int $skip, int $take): array|false;
}

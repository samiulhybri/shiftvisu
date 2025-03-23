<?php

namespace App\Http\Controllers;

use App\Contracts\ExternalDataSource;
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
use App\ExternalDataSource\Dto\SupplierDto;
use App\ExternalDataSource\Dto\ToolDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\ExternalDataSource\Dto\TpmSubGroupDto;
use App\ExternalDataSource\Dto\UserDto;
use App\ExternalDataSource\Dto\UserGroupDto;
use App\ExternalDataSource\Dto\WarehouseDto;
use App\ExternalDataSource\Dto\StorageBinDto;
use Illuminate\Support\Collection;

class ExternalDataSourceController extends Controller
{
    private ExternalDataSource $external_data_source;

    /**
     * ExternalDataSourceController constructor.
     */
    public function __construct()
    {
        $this->external_data_source = resolve(ExternalDataSource::class);
    }

    public function halls(): Collection
    {
        return $this->external_data_source->halls();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return HallDto[]|false
     */
    public function hallDtos($skip, $take): array|false
    {
        return $this->external_data_source->hallDtos($skip, $take);
    }


    /**
     * @param int $skip
     * @param int $take
     * @return ItemDto[]|false
     */
    public function itemDtos($skip, $take): array|false
    {
        return $this->external_data_source->itemDtos($skip, $take);
    }

    public function itemGroups(): Collection
    {
        return $this->external_data_source->itemGroups();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemGroupDto[]|false
     */
    public function itemGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->itemGroupDtos($skip, $take);
    }


    public function machineGroups(): Collection
    {
        return $this->external_data_source->machineGroups();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineGroupDto[]|false
     */
    public function machineGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineGroupDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineDto[]|false
     */
    public function machineDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineDtos($skip, $take);
    }

    public function operations(): Collection
    {
        return $this->external_data_source->operations();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OperationPlanDto[]|false
     */
    public function operationDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->operationDtos($skip, $take);
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        return $this->external_data_source->prodOrders($onlyCustomId);
    }

    /**
     * @param int $skip
     * @param int $take
     * @param string|null $onlyCustomId
     * @return ProdOrderDto[]|false
     */
    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        return $this->external_data_source->prodOrderDtos($skip, $take, $onlyCustomId);
    }

    public function boms(): Collection
    {
        return $this->external_data_source->boms();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return BomDto[]|false
     */
    public function bomDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->bomDtos($skip, $take);
    }

    public function tools(): Collection
    {
        return $this->external_data_source->tools();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ToolDto[]|false
     */
    public function toolDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->toolDtos($skip, $take);
    }

    public function warehouses(): Collection
    {
        return $this->external_data_source->warehouses();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return WarehouseDto[]|false
     */
    public function warehouseDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->warehouseDtos($skip, $take);
    }

    public function stocks(): Collection
    {
        return $this->external_data_source->stocks();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->stockDtos($skip, $take);
    }

    public function callOffs(): Collection
    {
        return $this->external_data_source->callOffs();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CallOffDto[]|false
     */
    public function callOffDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->callOffDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftModelDto[]|false
     */
    public function shiftModelDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->shiftModelDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftDto[]|false
     */
    public function shiftDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->shiftDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CapacityDto[]|false
     */
    public function capacityDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->capacityDtos($skip, $take);
    }

    public function customers(): Collection
    {
        return $this->external_data_source->customers();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CustomerDto[]|false
     */
    public function customerDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->customerDtos($skip, $take);
    }

    public function suppliers(): Collection
    {
        return $this->external_data_source->suppliers();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SupplierDto[]|false
     */
    public function supplierDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->supplierDtos($skip, $take);
    }

    public function users(): Collection
    {
        return $this->external_data_source->users();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return UserDto[]|false
     */
    public function userDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->userDtos($skip, $take);
    }

    public function userGroups(): Collection
    {
        return $this->external_data_source->userGroups();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return UserGroupDto[]|false
     */
    public function userGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->userGroupDtos($skip, $take);
    }

    public function permissionsByModuleName($moduleName): Collection
    {
        return $this->external_data_source->permissionsByModuleName($moduleName);
    }

    /**
     * @param string $moduleName
     * @param int $skip
     * @param int $take
     * @return PermissionDto[]|false
     */
    public function permissionsByModuleNameDtos(string $moduleName, int $skip, int $take): array|false
    {
        return $this->external_data_source->permissionsByModuleNameDtos($moduleName, $skip, $take);
    }

    public function itemStates(): Collection
    {
        return $this->external_data_source->itemStates();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemStateDto[]|false
     */
    public function itemStateDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->itemStateDtos($skip, $take);
    }

    public function machineStates(): Collection
    {
        return $this->external_data_source->machineStates();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateDto[]|false
     */
    public function machineStateDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineStateDtos($skip, $take);
    }

    public function machineStateGroups(): Collection
    {
        return $this->external_data_source->machineStateGroups();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateGroupDto[]|false
     */
    public function machineStateGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineStateGroupDtos($skip, $take);
    }

    public function salesOrders(): Collection
    {
        return $this->external_data_source->salesOrders();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SalesOrderDto[]|false
     */
    public function salesOrderDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->salesOrderDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return DepartmentDto[]|false
     */
    public function departmentDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->departmentDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return TpmGroupDto[]|false
     */
    public function tpmGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->tpmGroupDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return TpmSubGroupDto[]|false
     */
    public function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->tpmSubGroupDtos($skip, $take);
    }

    public function costCenters(): Collection
    {
        return $this->external_data_source->costCenters();
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CostCenterDto[]|false
     */
    public function costCenterDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->costCenterDtos($skip, $take);
    }

    public function settings(): Collection
    {
        return $this->external_data_source->settings();
    }

    public function settingsDto(): SettingsDto|false
    {
        return $this->external_data_source->settingsDto();
    }


    public function classifications($skip, $take): array|false
    {
        return $this->external_data_source->classifications($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ClassificationDto[]|false
     */
    public function classificationDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->classificationDtos($skip, $take);
    }


    public function resourceGroups($skip, $take): array|false
    {
        return $this->external_data_source->resourceGroups($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ResourceGroupDto[]|false
     */
    public function resourceGroupDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->resourceGroupDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return QualificationDto[]|false
     */
    public function qualificationDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->qualificationDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return PackagingInstructionDto[]|false
     */
    public function packagingInstructionDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->packagingInstructionDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProductionSupplyAreaDto[]|false
     */
    public function productionSupplyAreaDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->productionSupplyAreaDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StorageBinDto[]|false
     */
    public function storageBinDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->storageBinDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return HandlingUnitDto[]|false
     */
    public function handlingUnitDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->handlingUnitDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineUserTimeDto[]|false
     */
    public function machineUserTimeDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineUserTimeDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineProdOrderPosOperationTimeDto[]|false
     */
    public function machineProdOrderPosOperationTimeDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineProdOrderPosOperationTimeDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateTimeDto[]|false
     */
    public function machineStateTimeDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->machineStateTimeDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OffDayDto[]|false
     */
    public function offDayDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->offDayDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return EquipmentDto[]|false
     */
    public function equipmentDtos(int $skip, int $take, ?string $serialFilter = null, ?string $itemFilter = null): array|false
    {
        return $this->external_data_source->equipmentDtos($skip, $take, $serialFilter, $itemFilter);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionLotDto[]|false
     */
    public function inspectionLotDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->inspectionLotDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProdInspectionOperationDto[]|false
     */
    public function prodInspectionOperationDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->prodInspectionOperationDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return AttributeSetDto[]|false
     */
    public function attributeSetDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->attributeSetDtos($skip, $take);
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionSpecificationDto[]|false
     */
    public function inspectionSpecificationDtos(int $skip, int $take): array|false
    {
        return $this->external_data_source->inspectionSpecificationDtos($skip, $take);
    }
}

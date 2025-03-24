import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseVisuComponent } from "./base-visu.component";
import { BaseVisuRoutingModule } from "./base-visu-routing.module";
import { MachineComponent } from "@app/modules/base-visu/machine/machine.component";
import { SharedModule } from "@app/shared/shared.module";
import { HallComponent } from "@app/modules/base-visu/hall/hall.component";
import { MachineGroupComponent } from "@app/modules/base-visu/machine-group/machine-group.component";
import { ToolsComponent } from "@app/modules/base-visu/tools/tools.component";
import { ItemsComponent } from "@app/modules/base-visu/items/items.component";
import { SuppliersComponent } from "@app/modules/base-visu/suppliers/suppliers.component";
import { CustomerComponent } from "@app/modules/base-visu/customer/customer.component";
import { EnergyConsumerComponent } from "@app/modules/base-visu/energy-consumer/energy-consumer.component";
import { CruciblesComponent } from "@app/modules/base-visu/crucibles/crucibles.component";
import { CustomerGroupComponent } from "@app/modules/base-visu/customer-group/customer-group.component";
import { UserGroupComponent } from "@app/modules/base-visu/user-group/user-group.component";
import { MachineStateGroupsComponent } from "@app/modules/base-visu/machine-state-groups/machine-state-groups.component";
import { PermissionComponent } from "./permission/permission.component";
import { PermissionDialogComponent } from "./permission/permission-dialog/permission-dialog.component";
import { RoleComponent } from "./role/role.component";
import { RoleDialogComponent } from "./role/role-dialog/role-dialog.component";
import { UserComponent } from "@app/modules/base-visu/user/user.component";
import { ItemGroupComponent } from "@app/modules/base-visu/item-group/item-group.component";
import { QualificationsComponent } from "@app/modules/base-visu/qualifications/qualifications.component";
import { ItemStateComponent } from "@app/modules/base-visu/item-state/item-state.component";
import { MachineStateComponent } from "@app/modules/base-visu/machine-state/machine-state.component";
import { ShiftModelComponent } from "@app/modules/base-visu/shift-model/shift-model.component";
import { SettingsComponent } from "@app/modules/base-visu/settings/settings.component";
import { TpmSubGroupComponent } from "@app/modules/base-visu/tpm-sub-group/tpm-sub-group.component";
import { TpmGroupComponent } from "@app/modules/base-visu/tpm-group/tpm-group.component";
import { AssociateTableComponent } from "@app/modules/base-visu/machine/associate-table/associate-table.component";
import { CapacityPlanComponent } from "@app/modules/base-visu/capacity-plan/capacity-plan.component";
import { CapacityChangeComponent } from "@app/modules/base-visu/capacity-plan/capacity-change/capacity-change.component";
import { PlantComponent } from "@app/modules/base-visu/plant/plant.component";
import { StorageLocationComponent } from "@app/modules/base-visu/storage-location/storage-location.component";
import { WarehouseComponent } from "@app/modules/base-visu/warehouse/warehouse.component";
import { StorageTypeComponent } from "@app/modules/base-visu/storage-type/storage-type.component";
import { StorageSectionComponent } from "@app/modules/base-visu/storage-section/storage-section.component";
import { StorageBinComponent } from "@app/modules/base-visu/storage-bin/storage-bin.component";
import { ProductionSupplyAreaComponent } from "@app/modules/base-visu/production-supply-area/production-supply-area.component";
import { ShiftComponent } from '@app/modules/base-visu/shift/shift.component';
import { PrintersComponent } from "@app/modules/base-visu/printers/printers.component";
import { TerminalsComponent } from "@app/modules/base-visu/terminals/terminals.component";
import { StandardValueKeyComponent } from "@app/modules/base-visu/standard-value-key/standard-value-key.component";
import { ItemStateGroupComponent } from "@app/modules/base-visu/item-state-group/item-state-group.component";
import { CapacitiesComponent } from "@app/modules/base-visu/user-capacities/capacities/capacities.component";
import { UserCapacitiesComponent } from "@app/modules/base-visu/user-capacities/user-capacities.component";
import { LanguageComponent } from "@app/modules/base-visu/language/language.component";
import { CountryComponent } from "@app/modules/base-visu/country/country.component";
import { SalesStatusComponent } from "@app/modules/base-visu/sales-status/sales-status.component";
import { RevenueClassificationsComponent } from '@app/modules/base-visu/revenue-classifications/revenue-classifications.component';
import { EmployeeClassificationsComponent } from '@app/modules/base-visu/employee-classifications/employee-classifications.component';
import { MarketSegmentsComponent } from '@app/modules/base-visu/market-segments/market-segments.component';
import { EnergyConsumerGroupsComponent } from '@app/modules/base-visu/energy-consumer-groups/energy-consumer-groups.component';
import { PotentialClassificationComponent } from '@app/modules/base-visu/potential-classification/potential-classification.component';
import { MachineClassificationComponent } from '@app/modules/base-visu/machine-classification/machine-classification.component';
import { NotificationGroupComponent } from '@app/modules/base-visu/notification-group/notification-group.component';
import { TransportOrderTypeComponent } from '@app/modules/base-visu/transport-order-type/transport-order-type.component';
import { OperationControlProfilesComponent } from "@app/modules/base-visu/operation-controls/operation-control-profiles.component";
import { SerialNumberProfileComponent } from '@app/modules/base-visu/serial-number-profile/serial-number-profile.component';
import { EnergyMeterComponent } from '@app/modules/base-visu/energy-meter/energy-meter.component';
import { ShiftChangeDateRangeComponent } from '@app/modules/base-visu/user-capacities/shift-change-date-range/shift-change-date-range.component';
import { CrmActionsComponent } from '@app/modules/base-visu/crm-actions/crm-actions.component';
import { AreasComponent } from '@app/modules/base-visu/areas/areas.component';
import { CustomerCategoriesComponent } from '@app/modules/base-visu/customer-categories/customer-categories.component';
import { HallCapacitySettingsComponent } from '@app/modules/base-visu/hall-capacity-settings/hall-capacity-settings.component';
import { ItemTypeComponent } from '@app/modules/base-visu/item-type/item-type.component';

@NgModule({
	declarations: [
		BaseVisuComponent,
		MachineComponent,
		HallComponent,
		MachineGroupComponent,
		ToolsComponent,
		ItemsComponent,
		SuppliersComponent,
		MachineGroupComponent,
		CustomerComponent,
		EnergyConsumerComponent,
		CruciblesComponent,
		CustomerGroupComponent,
		PermissionComponent,
		PermissionDialogComponent,
		RoleComponent,
		RoleDialogComponent,
		ItemGroupComponent,
		QualificationsComponent,
		UserGroupComponent,
		UserComponent,
		ItemGroupComponent,
		ItemStateComponent,
		MachineStateGroupsComponent,
		ItemGroupComponent,
		MachineStateComponent,
		ShiftModelComponent,
		SettingsComponent,
		TpmSubGroupComponent,
		TpmGroupComponent,
		AssociateTableComponent,
		CapacityPlanComponent,
		CapacityChangeComponent,
		PlantComponent,
		StorageLocationComponent,
		WarehouseComponent,
		StorageTypeComponent,
		StorageSectionComponent,
		StorageBinComponent,
		ProductionSupplyAreaComponent,
  		ShiftComponent,
		PrintersComponent,
		TerminalsComponent,
		StandardValueKeyComponent,
		ItemStateGroupComponent,
		CapacitiesComponent,
		UserCapacitiesComponent,
		LanguageComponent,
        CountryComponent,
		SalesStatusComponent,
		RevenueClassificationsComponent,
  	    EmployeeClassificationsComponent,
  		MarketSegmentsComponent,
    	EnergyConsumerGroupsComponent,
    	PotentialClassificationComponent,
    	MachineClassificationComponent,
		NotificationGroupComponent,
		TransportOrderTypeComponent,
		OperationControlProfilesComponent,
		SerialNumberProfileComponent,
		EnergyMeterComponent,
  		ShiftChangeDateRangeComponent,
    	CrmActionsComponent,
     	AreasComponent,
      	CustomerCategoriesComponent,
       	HallCapacitySettingsComponent,
        ItemTypeComponent
	],
	imports: [BaseVisuRoutingModule, CommonModule, SharedModule ],
})
export class BaseVisuModule {}

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BaseVisuComponent } from "@app/modules/base-visu/base-visu.component";
import { MachineComponent } from "@app/modules/base-visu/machine/machine.component";
import { HallComponent } from "@app/modules/base-visu/hall/hall.component";
import { MachineGroupComponent } from "@app/modules/base-visu/machine-group/machine-group.component";
import { ToolsComponent } from "@app/modules/base-visu/tools/tools.component";
import { ItemsComponent } from "@app/modules/base-visu/items/items.component";
import { SuppliersComponent } from "@app/modules/base-visu/suppliers/suppliers.component";
import { CustomerComponent } from "@app/modules/base-visu/customer/customer.component";
import { EnergyConsumerComponent } from "@app/modules/base-visu/energy-consumer/energy-consumer.component";
import { CruciblesComponent } from "@app/modules/base-visu/crucibles/crucibles.component";
import { CustomerGroupComponent } from "@app/modules/base-visu/customer-group/customer-group.component";
import { PermissionComponent } from "./permission/permission.component";
import { RoleComponent } from "./role/role.component";
import { UserComponent } from "@app/modules/base-visu/user/user.component";
import { UserGroupComponent } from "@app/modules/base-visu/user-group/user-group.component";
import { MachineStateGroupsComponent } from "@app/modules/base-visu/machine-state-groups/machine-state-groups.component";
import { ItemGroupComponent } from "@app/modules/base-visu/item-group/item-group.component";
import { ShiftModelComponent } from "@app/modules/base-visu/shift-model/shift-model.component";
import { MachineStateComponent } from "@app/modules/base-visu/machine-state/machine-state.component";
import { QualificationsComponent } from "@app/modules/base-visu/qualifications/qualifications.component";
import { ItemStateComponent } from "@app/modules/base-visu/item-state/item-state.component";
import { TpmSubGroupComponent } from "@app/modules/base-visu/tpm-sub-group/tpm-sub-group.component";
import { TpmGroupComponent } from "@app/modules/base-visu/tpm-group/tpm-group.component";
import { SettingsComponent } from "@app/modules/base-visu/settings/settings.component";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { CapacityPlanComponent } from "@app/modules/base-visu/capacity-plan/capacity-plan.component";
import { PlantComponent } from "@app/modules/base-visu/plant/plant.component";
import { StorageLocationComponent } from "@app/modules/base-visu/storage-location/storage-location.component";
import { WarehouseComponent } from "@app/modules/base-visu/warehouse/warehouse.component";
import { StorageTypeComponent } from "@app/modules/base-visu/storage-type/storage-type.component";
import { StorageSectionComponent } from "@app/modules/base-visu/storage-section/storage-section.component";
import { StorageBinComponent } from "@app/modules/base-visu/storage-bin/storage-bin.component";
import { ProductionSupplyAreaComponent } from "@app/modules/base-visu/production-supply-area/production-supply-area.component";
import { ShiftComponent } from "@app/modules/base-visu/shift/shift.component";
import { PrintersComponent } from "@app/modules/base-visu/printers/printers.component";
import { TerminalsComponent } from "@app/modules/base-visu/terminals/terminals.component";
import { StandardValueKeyComponent } from "@app/modules/base-visu/standard-value-key/standard-value-key.component";
import { ItemStateGroupComponent } from "@app/modules/base-visu/item-state-group/item-state-group.component";
import { UserCapacitiesComponent } from "@app/modules/base-visu/user-capacities/user-capacities.component";
import { LanguageComponent } from "@app/modules/base-visu/language/language.component";
import { CountryComponent } from "@app/modules/base-visu/country/country.component";
import { RevenueClassificationsComponent } from "@app/modules/base-visu/revenue-classifications/revenue-classifications.component";
import { SalesStatusComponent } from "@app/modules/base-visu/sales-status/sales-status.component";
import { EmployeeClassificationsComponent } from "@app/modules/base-visu/employee-classifications/employee-classifications.component";
import { MarketSegmentsComponent } from "@app/modules/base-visu/market-segments/market-segments.component";
import { EnergyConsumerGroupsComponent } from "@app/modules/base-visu/energy-consumer-groups/energy-consumer-groups.component";
import { PotentialClassificationComponent } from "@app/modules/base-visu/potential-classification/potential-classification.component";
import { MachineClassificationComponent } from "@app/modules/base-visu/machine-classification/machine-classification.component";
import { NotificationGroupComponent } from "@app/modules/base-visu/notification-group/notification-group.component";
import { TransportOrderTypeComponent } from "@app/modules/base-visu/transport-order-type/transport-order-type.component";
import { OperationControlProfilesComponent } from "@app/modules/base-visu/operation-controls/operation-control-profiles.component";
import { SerialNumberProfileComponent } from "@app/modules/base-visu/serial-number-profile/serial-number-profile.component";
import { EnergyMeterComponent } from "@app/modules/base-visu/energy-meter/energy-meter.component";
import { CrmActionsComponent } from "@app/modules/base-visu/crm-actions/crm-actions.component";
import { AreasComponent } from "@app/modules/base-visu/areas/areas.component";
import { CustomerCategoriesComponent } from "@app/modules/base-visu/customer-categories/customer-categories.component";
import { HallCapacitySettingsComponent } from "@app/modules/base-visu/hall-capacity-settings/hall-capacity-settings.component";
import { ItemTypeComponent } from "@app/modules/base-visu/item-type/item-type.component";

const routes: Routes = [
	{
		path: "",
		component: BaseVisuComponent,

		children: [
			{
				path: "machine",
				component: MachineComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "machine-group",
				component: MachineGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "machine-state-groups",
				component: MachineStateGroupsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "item-states",
				component: ItemStateComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "item-state-group",
				component: ItemStateGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "serial-number-profile",
				component: SerialNumberProfileComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "tpm-groups",
				component: TpmGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "hall",
				component: HallComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "tools",
				component: ToolsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "item",
				component: ItemsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "item-group",
				component: ItemGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "item-type",
				component: ItemTypeComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "suppliers",
				component: SuppliersComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "customer",
				component: CustomerComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "customer-group",
				component: CustomerGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "revenue-classifications",
				component: RevenueClassificationsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "employee-classifications",
				component: EmployeeClassificationsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "sales-status",
				component: SalesStatusComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "market-segments",
				component: MarketSegmentsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "energy-consumer",
				component: EnergyConsumerComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "energy-consumer-groups",
				component: EnergyConsumerGroupsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "crucible",
				component: CruciblesComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "printer",
				component: PrintersComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "terminal",
				component: TerminalsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "permission",
				component: PermissionComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "role",
				component: RoleComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "user",
				component: UserComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "user-group",
				component: UserGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "user-capacities",
				component: UserCapacitiesComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "notification-group",
				component: NotificationGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "machine-state",
				component: MachineStateComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "qualifications",
				component: QualificationsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "shift-model",
				component: ShiftModelComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "shift",
				component: ShiftComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "capacities",
				component: CapacityPlanComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "hall-capacity-setting",
				component: HallCapacitySettingsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "settings",
				component: SettingsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "tpm-sub-groups",
				component: TpmSubGroupComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "plant",
				component: PlantComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "storage-location",
				component: StorageLocationComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "warehouse",
				component: WarehouseComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "storage-type",
				component: StorageTypeComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "storage-section",
				component: StorageSectionComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "storage-bin",
				component: StorageBinComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "production-supply-area",
				component: ProductionSupplyAreaComponent,
				canActivate: [premissionGuard],
			},
            {
				path: "standard-value-key",
				component: StandardValueKeyComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "languages",
				component: LanguageComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "countries",
				component: CountryComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "potential-classifications",
				component: PotentialClassificationComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "transport-order-types",
				component: TransportOrderTypeComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "machine-classifications",
				component: MachineClassificationComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "operation-control-profiles",
				component: OperationControlProfilesComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "energy-meter",
				component: EnergyMeterComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "crm-actions",
				component: CrmActionsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "areas",
				component: AreasComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "customer-categories",
				component: CustomerCategoriesComponent,
				canActivate: [premissionGuard],
			}
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class BaseVisuRoutingModule {}

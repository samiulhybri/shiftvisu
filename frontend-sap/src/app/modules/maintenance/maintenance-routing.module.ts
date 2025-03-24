import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MaintenanceComponent } from "@app/modules/maintenance/maintenance.component";
import { ManageMaintenanceComponent } from "@app/modules/maintenance/manage-maintenance/manage-maintenance.component";
import { MaintenanceHistoryComponent } from "@app/modules/maintenance/maintenance-history/maintenance-history.component";
import { SettingsComponent } from "@app/modules/maintenance/settings/settings.component";

const routes: Routes = [
	{
		title: "Maintenance",
		path: "",
		component: MaintenanceComponent,
		children: [
			{
				path: "",
				component: ManageMaintenanceComponent,
			},
			{
				path: "manage-maintenance",
				component: ManageMaintenanceComponent,
			},
			{
				path: "maintenance-history",
				component: MaintenanceHistoryComponent,
			},
			{
				path: "settings",
				component: SettingsComponent,
			},
		],
	},
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MaintenanceRoutingModule {}

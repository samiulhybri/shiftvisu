import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InterfaceMonitoringComponent } from "@app/modules/interface-monitoring/interface-monitoring.component";
import { DataExportsComponent } from "@app/modules/interface-monitoring/overview/data-exports.component";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { ScheduledCommandsComponent } from "@app/modules/interface-monitoring/scheduled-commands/scheduled-commands.component";
import { ClosedOperationsComponent } from "@app/modules/interface-monitoring/closed-operations/closed-operations.component";
const routes: Routes = [
	{
		title: "Interface Monitoring",
		path: "",
		component: InterfaceMonitoringComponent,
		children: [
			{
				path: "",
				component: DataExportsComponent,
			},
			{
				path: "data-exports",
				component: DataExportsComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "scheduled-commands",
				component: ScheduledCommandsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "closed-operations",
				component: ClosedOperationsComponent,
				canActivate: [premissionGuard],
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class InterfaceMonitoringRoutingModule {}

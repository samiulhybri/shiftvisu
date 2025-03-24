import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ToolVisuComponent } from "@app/modules/tool-visu/tool-visu.component";
import { ToolOverviewComponent } from "@app/modules/tool-visu/tool-overview/tool-overview.component";
import { ToolRepairComponent } from "@app/modules/tool-visu/tool-repair/tool-repair.component";
import { ToolSettingsComponent } from "@app/modules/tool-visu/tool-settings/tool-settings.component";
import { PlannedOrdersComponent } from "@app/modules/tool-visu/planned-orders/planned-orders.component";
import { OrderHistoryComponent } from "@app/modules/tool-visu/order-history/order-history.component";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { ToolScheduleComponent } from "@app/modules/tool-visu/tool-schedule/tool-schedule.component";

const routes: Routes = [
	{
		title: "ToolVisu",
		path: "",
		component: ToolVisuComponent,
		children: [
			{
				path: "",
				component: ToolRepairComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "tool-repair",
				component: ToolRepairComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "planned-orders",
				component: PlannedOrdersComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "order-history",
				component: OrderHistoryComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "overview",
				component: ToolOverviewComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "settings",
				component: ToolSettingsComponent,
				canActivate: [premissionGuard]
			},
			{
				path: "tool-schedule",
				component: ToolScheduleComponent,
				canActivate: [premissionGuard]
			}
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ToolVisuRoutingModule { }

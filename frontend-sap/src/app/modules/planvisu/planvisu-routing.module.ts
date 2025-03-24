import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanvisuComponent } from "@app/modules/planvisu/planvisu.component";
import { HallComponent } from "@app/modules/planvisu/hall/hall.component";
import { OperationComponent } from "@app/modules/planvisu/operation/operation.component";
import { FurnaceComponent } from "@app/modules/planvisu/furnace/furnace.component";
import { MainPageComponent } from "@app/modules/planvisu/main-page/main-page.component";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { GanttComponent } from "@app/modules/planvisu/gantt/gantt.component";
import { ProductionPlanningComponent } from "@app/modules/planvisu/production-planning/production-planning.component";
import { MachineSchedulerComponent } from "@app/modules/planvisu/machine-scheduler/machine-scheduler.component";
import { UserSchedulerComponent } from "@app/modules/planvisu/user-scheduler/user-scheduler.component";
import { StaffNeededComponent } from "@app/modules/planvisu/staff-needed/staff-needed.component";
import { RangeOverviewComponent } from "@app/modules/planvisu/range-overview/range-overview.component";
import { CreateOrderComponent } from "@app/modules/planvisu/create-order/create-order.component";
import { StaffWorkloadComponent } from "@app/modules/planvisu/staff-workload/staff-workload.component";
import { MachineWorkloadComponent } from "@app/modules/planvisu/machine-workload/machine-workload.component";
import { SetupPlanComponent } from "@app/modules/planvisu/setup-plan/setup-plan.component";
import { OrderViewComponent } from "@app/modules/planvisu/order-view/order-view.component";
import { ExportImportComponent } from "@app/modules/planvisu/export-import/export-import.component";
import { ColorSchemeComponent } from "@app/modules/planvisu/settings/color-scheme/color-scheme.component";
import { ColorSchemeSortingComponent } from "@app/modules/planvisu/settings/color-scheme-sorting/color-scheme-sorting.component";
import { SettingsComponent } from "@app/modules/planvisu/settings/settings.component";
import { GeneralComponent } from "@app/modules/planvisu/settings/general/general.component";
import { OrderViewTreeComponent } from "@app/modules/planvisu/order-view-tree/order-view-tree.component";
import { UserPlanComponent } from "@app/modules/planvisu/user-plan/user-plan.component";

const routes: Routes = [
	{
		path: "",
		component: MainPageComponent,
		children: [
			// {
			// 	path: "",
			// 	redirectTo: "production-planning",
			// 	pathMatch: "full",
			// },
			{
				path: "",
				redirectTo: "gantt",
				pathMatch: "full",
			},
			{
				path: "gantt",
				component: GanttComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "production-planning",
				component: ProductionPlanningComponent,
				children: [
					{
						path: "hall/:id",
						component: HallComponent,
						children: [
							{
								path: "operation/:id",
								component: OperationComponent,
							},
						],
						canActivate: [premissionGuard],
					},
					{
						path: "forge/:id",
						component: HallComponent,
						children: [
							{
								path: "operation/:id",
								component: OperationComponent,
							},
						],
						canActivate: [premissionGuard],
					},
					{
						path: "furnace/:id",
						component: FurnaceComponent,
						children: [
							{
								path: "operation/:id",
								component: OperationComponent,
							},
						],
						canActivate: [premissionGuard],
					},
				],
			},
			{
				path: "machine-scheduler",
				component: MachineSchedulerComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "user-scheduler",
				component: UserSchedulerComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "range-overview",
				component: RangeOverviewComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "create-order",
				component: CreateOrderComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "order-view",
				component: OrderViewComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "order-tree-view",
				component: OrderViewTreeComponent,
				canActivate: [premissionGuard],
			},
			{	path: "staff-needed/:id",
				component: StaffNeededComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "staff-workload",
				component: StaffWorkloadComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "machine-workload",
				component: MachineWorkloadComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "setup-plan",
				component: SetupPlanComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "export-import",
				component: ExportImportComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "user-plan",
				component: UserPlanComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "settings",
				component: SettingsComponent,
				canActivate: [premissionGuard],
				children: [
					{
						path: "color-schemes",
						component: ColorSchemeComponent,
						canActivate: [premissionGuard],
					},
					{
						path: "color-schemes-sortings",
						component: ColorSchemeSortingComponent,
						canActivate: [premissionGuard],
					},
					{
						path: "general",
						component: GeneralComponent,
						canActivate: [premissionGuard],
					},
					{
						path: "",
						redirectTo: "general",
						pathMatch: "full",
					},
				],
			},
		],
	},
	{
		path: "hall/:id",
		component: HallComponent,
		children: [
			{
				path: "operation/:id",
				component: OperationComponent,
			},
		],
		canActivate: [premissionGuard],
	},
	{
		path: "forge/:id",
		component: HallComponent,
		children: [
			{
				path: "operation/:id",
				component: OperationComponent,
			},
		],
		canActivate: [premissionGuard],
	},
	{
		path: "furnace/:id",
		component: FurnaceComponent,
		children: [
			{
				path: "operation/:id",
				component: OperationComponent,
			},
		],
		canActivate: [premissionGuard],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PlanVisuRoutingModule {}

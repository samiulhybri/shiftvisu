import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomePageComponent } from "@app/modules/home-page/home-page.component";
import { LoginPageComponent } from "@app/modules/home-page/login-page/login-page.component";
import { authGuardGuard } from "@app/shared/guard/auth-guard.guard";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { LogiVisuModule } from "@app/modules/logi-visu/logi-visu.module";
import { machineGuard } from "@app/shared/guard/machine-guard";
import { AccessDeniedComponent } from "@app/modules/home-page/access-denied/access-denied.component";

const routes: Routes = [
	{
		path: "",
		title: "Home Page",
		component: HomePageComponent,
		pathMatch: "full",
		canActivate: [authGuardGuard],
	},
	{
		path: "statusboard",
		title: "StatusBoard",
		loadChildren: () =>
			import("./modules/status-board/status-board.module").then(m => m.StatusBoardModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "planvisu",
		title: "PlanVisu",
		loadChildren: () =>
			import("./modules/planvisu/planvisu.module").then(m => m.PlanVisuModule),
		canActivate: [authGuardGuard],
	},
	{
		path: "base-visu",
		title: "BaseVisu",
		loadChildren: () =>
			import("./modules/base-visu/base-visu.module").then(m => m.BaseVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "login",
		title: "MES",
		component: LoginPageComponent,
	},
	{
		path: "forgot-password",
		title: "MES",
		component: LoginPageComponent,
	},
	{
		path: "change-password/:token",
		title: "MES",
		component: LoginPageComponent,
	},
	{
		path: "logistics",
		title: "Logistics",
		loadChildren: () =>
			import("./modules/logistics/logistics.module").then(m => m.LogisticsModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "machine-board",
		title: "MachineBoard",
		loadChildren: () =>
			import("./modules/machine-board/machine-board.module").then(m => m.MachineBoardModule),
		canActivate: [authGuardGuard, machineGuard, premissionGuard],
	},
	{
		path: "tool-visu",
		loadChildren: () =>
			import("./modules/tool-visu/tool-visu.module").then(m => m.ToolVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "logi-visu",
		title: "LogiVisu",
		loadChildren: () =>
			import("./modules/logi-visu/logi-visu.module").then(m => m.LogiVisuModule),
		canActivate: [authGuardGuard],
	},
	{
		path: "maintenance",
		loadChildren: () =>
			import("./modules/maintenance/maintenance.module").then(m => m.MaintenanceModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "interface-monitoring",
		loadChildren: () =>
			import("./modules/interface-monitoring/interface-monitoring.module").then(
				m => m.InterfaceMonitoringModule
			),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "crm",
		loadChildren: () => import("./modules/crm/crm.module").then(m => m.CrmModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "time-visu",
		loadChildren: () =>
			import("./modules/time-visu/time-visu.module").then(m => m.TimeVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "doc-visu",
		loadChildren: () => import("./modules/doc-visu/doc-visu.module").then(m => m.DocVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "shift-visu",
		loadChildren: () =>
			import("./modules/shift-visu/shift-visu.module").then(m => m.ShiftVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: "quali-visu",
		title: "QualiVisu",
		loadChildren: () =>
			import("./modules/quali-visu/quali-visu.module").then(m => m.QualiVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		path: 'personal-visu',
		title: 'PersonalVisu',
		loadChildren: () => import('./modules/personal-visu/personal-visu.module').then(m => m.PersonalVisuModule),
		canActivate: [authGuardGuard, premissionGuard],
	},
	{
		title: "Forbidden",
		path: "403",
		component: AccessDeniedComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }

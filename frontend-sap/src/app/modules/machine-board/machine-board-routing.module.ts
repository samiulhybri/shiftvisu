import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MachineStateHistoryComponent } from "@app/modules/machine-board/machine-state-history/machine-state-history.component";
import { MachineBoardComponent } from "@app/modules/machine-board/machine-board.component";
// import { LogInComponent } from "@app/modules/machine-board/log-in/log-in.component";
import { MesComponent } from "@app/modules/machine-board/mes/mes.component";
import { SetupComponent } from "@app/modules/machine-board/setup/setup.component";
import { DocVisuComponent } from "@app/modules/machine-board/doc-visu/doc-visu.component";
import { ProductionPlanComponent } from "@app/modules/machine-board/production-plan/production-plan.component";
import { MachineStatesComponent } from "../machine-board/machine-states/machine-states.component";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { ClockInComponent } from "@app/modules/machine-board/clock-in/clock-in.component";
import { LoginPageComponent } from "@app/modules/home-page/login-page/login-page.component";
import { MaterialConsumptionComponent } from "@app/modules/machine-board/material-consumption/material-consumption.component";
import { PackagingComponent } from "@app/modules/machine-board/packaging/packaging.component";
import { MachineQuantityComponent } from "@app/modules/machine-board/machine-quantity/machine-quantity.component";
import { userQualificationGuard } from "@app/shared/guard/user-qualified.guard";
import { DefaultPackagingComponent } from "@app/modules/machine-board/default-packaging/default-packaging.component";
import { PrintHandlingUnitComponent } from "@app/modules/machine-board/print-handling-unit/print-handling-unit.component";
import { PaintingLineComponent } from "@app/modules/machine-board/painting-line/painting-line.component";
import { QualiVisuMachineboardComponent } from "@app/modules/machine-board/quali-visu-machineboard/quali-visu-machineboard.component";
import { machineGuard } from "@app/shared/guard/machine-guard";

const routes: Routes = [
	{
		path: ":id",
		component: MachineBoardComponent,
		children: [
			{
				path: "clock-in",
				component: ClockInComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "mes",
				component: MesComponent,
			},
			{
				path: "machine-states",
				component: MachineStatesComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "machine-state-history",
				component: MachineStateHistoryComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "setup",
				component: SetupComponent,
			},
			{
				path: "quantity/:id",
				component: MachineQuantityComponent,
				canActivate: [userQualificationGuard],
			},			
			{
				path: "production-plan",
				component: ProductionPlanComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "login",
				component: LoginPageComponent,
			},
			{
				path: "material-consumption",
				component: MaterialConsumptionComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "packaging/:operationId",
				component: PackagingComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "next-packaging",
				component: DefaultPackagingComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "print-handling-unit/:operationId",
				component: PrintHandlingUnitComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "painting-line",
				component: PaintingLineComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "doc-visu",
				component: DocVisuComponent,
				canActivate: [userQualificationGuard],
			},
			{
				path: "quali-visu",
				component: QualiVisuMachineboardComponent,
				canActivate: [userQualificationGuard],
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MachineBoardRoutingModule {}

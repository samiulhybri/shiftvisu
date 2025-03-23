import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeVisuComponent } from '@app/modules/time-visu/time-visu.component';
import { TimeRecordComponent } from '@app/modules/time-visu/time-record/time-record.component';
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { ReportsComponent } from '@app/modules/time-visu/reports/reports.component';
const routes: Routes = [
  {
		title: "TimeVisu",
		path: "",
		component:TimeVisuComponent,
		children: [
			{
				path: "",
				component:TimeRecordComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "time-record",
				component:TimeRecordComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "report-hours-toolvisu",
				component: ReportsComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "report-hours-employee",
				component: ReportsComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "report-hours-project-tasks",
				component: ReportsComponent,
				canActivate: [
					premissionGuard
				],
			},
		],
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeVisuRoutingModule { }

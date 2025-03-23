import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { premissionGuard } from "@app/shared/guard/premission.guard";

import { QualiVisuComponent } from "@app/modules/quali-visu/quali-visu.component";
import { InspectionPointComponent } from "@app/modules/quali-visu/inspection-point/inspection-point.component";
import { EightDReportComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-report.component";

const routes: Routes = [
	{
		path: "",
		component: QualiVisuComponent,
		children: [
			{
				path: "inspection-point",
				component: InspectionPointComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "eight-d-report",
				component: EightDReportComponent,
				canActivate: [premissionGuard],
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class QualiVisuRoutingModule {}

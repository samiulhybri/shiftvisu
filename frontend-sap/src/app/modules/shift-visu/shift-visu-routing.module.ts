import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { premissionGuard } from "@app/shared/guard/premission.guard";

import { ShiftVisuComponent } from "@shift-visu/shift-visu.component";
import { ShiftVisuIssueTypeComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-issue-type.component";
import { ShiftVisuComponentComponent } from "@shift-visu/shift-visu-component/shift-visu-component.component";

const routes: Routes = [
	{
		title: "ShiftVisu",
		path: "",
		component: ShiftVisuComponent,
		canActivate: [premissionGuard],
		children: [
			{
				path: "settings/failure",
				component: ShiftVisuIssueTypeComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "settings/component",
				component: ShiftVisuComponentComponent,
				canActivate: [premissionGuard],
			},
		],
	},
	{
		title: "ShiftVisu",
		path: "hall/:id",
		component: ShiftVisuComponent,
		canActivate: [premissionGuard],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ShiftVisuRoutingModule {}

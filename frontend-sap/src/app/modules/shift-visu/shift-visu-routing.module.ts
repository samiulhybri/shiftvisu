import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { premissionGuard } from "@app/shared/guard/premission.guard";

import { ShiftVisuComponent } from "@shift-visu/shift-visu.component";
import { ShiftVisuIssueTypeComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-issue-type.component";
import { ShiftVisuComponentComponent } from "@shift-visu/shift-visu-component/shift-visu-component.component";
import { ShiftVisuIssueListComponent } from "@shift-visu/shift-visu-issue-list/shift-visu-issue-list.component";
import { ShiftVisuOverviewComponent } from "@shift-visu/shift-visu-overview/shift-visu-overview.component";
import { GeneralSettingsComponent } from "@shift-visu/shift-visu-issue-type/general-settings/general-settings.component";

const routes: Routes = [
	{
		title: "ShiftVisu",
		path: "",
		component: ShiftVisuComponent,
		canActivate: [premissionGuard],
		children: [
			{
				path: "",
				pathMatch: "full",
				component: ShiftVisuOverviewComponent,
				canActivate: [premissionGuard],
			},

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
			{
				path: "settings/general",
				component: GeneralSettingsComponent,
				canActivate: [premissionGuard],
			},
			{
				path: "hall/:id",
				component: ShiftVisuIssueListComponent,
				canActivate: [premissionGuard],
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ShiftVisuRoutingModule {}

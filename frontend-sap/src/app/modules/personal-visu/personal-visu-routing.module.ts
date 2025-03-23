import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PersonalVisuComponent } from "@personal-visu/personal-visu.component";
import { PersonalVisuDocumentReadComponent } from "@personal-visu/personal-visu-document-read/personal-visu-document-read.component";
import { PersonalVisuTrainerDocumentComponent } from "@personal-visu/personal-visu-trainer-document/personal-visu-trainer-document.component";
import { PersonalVisuReleaseHistoryComponent } from "@personal-visu/personal-visu-release-history/personal-visu-release-history.component";
import { PersonalVisuArchivedComponent } from "@personal-visu/personal-visu-archived/personal-visu-archived.component";
import { PersonalVisuSettingsComponent } from "@personal-visu/personal-visu-settings/personal-visu-settings.component";

const routes: Routes = [
	{
		path: "",
		component: PersonalVisuComponent,
		children: [
			{
				path: "document-read",
				component: PersonalVisuDocumentReadComponent,
			},
			{
				path: "trainer-document",
				component: PersonalVisuTrainerDocumentComponent,
			},
			{
				path: "release-history",
				component: PersonalVisuReleaseHistoryComponent,
			},
			{
				path: "archived",
				component: PersonalVisuArchivedComponent,
			},
			{
				path: "settings",
				component: PersonalVisuSettingsComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PersonalVisuRoutingModule {}

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DocVisuComponent } from "@doc-visu/doc-visu.component";
import { DocVisuSettingsComponent } from "@doc-visu/doc-visu-settings/doc-visu-settings.component";
import { DocVisuDocumentSectionComponent } from "@doc-visu/doc-visu-document-section/doc-visu-document-section.component";
import { DocVisuProcessDetailsComponent } from "@doc-visu/doc-visu-document-section/doc-visu-process-details/doc-visu-process-details.component";
import { DocVisuDirectoryStructureComponent } from "@doc-visu/doc-visu-settings/doc-visu-directory-structure/doc-visu-directory-structure.component";
import { DocVisuDocumentSectionSettingComponent } from "@doc-visu/doc-visu-settings/doc-visu-document-section-setting/doc-visu-document-section-setting.component";

const routes: Routes = [
	{
		title: "DocVisu",
		path: "",
		component: DocVisuComponent,
		children: [
			{
				path: "settings",
				component: DocVisuSettingsComponent,
				children: [
					{
						path: "directory-structure",
						component: DocVisuDirectoryStructureComponent,
					},
					{
						path: "document-section",
						component: DocVisuDocumentSectionSettingComponent,
					},
					{
						path: "",
						redirectTo: "document-section", // Default route under settings
						pathMatch: "full",
					},
				],
			},
			{
				path: ":docSection",
				component: DocVisuDocumentSectionComponent,
				children: [
					{
						path: ":processId/details",
						component: DocVisuProcessDetailsComponent,
					},
				],
			},
			{
				path: "**",
				redirectTo: "settings",
				pathMatch: "full",
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DocVisuRoutingModule {}

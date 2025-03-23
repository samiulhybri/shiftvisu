import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import "@ui5/webcomponents-fiori/dist/IllustratedMessage.js";
import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js";

import { SharedModule } from "@app/shared/shared.module";

import { DocVisuRoutingModule } from "@doc-visu/doc-visu-routing.module";

import { DocVisuComponent } from "@doc-visu/doc-visu.component";
import { DocVisuSettingsComponent } from "@doc-visu/doc-visu-settings/doc-visu-settings.component";
import { DocVisuDirectoryComponent } from "@doc-visu/doc-visu-settings/doc-visu-directory/doc-visu-directory.component";
import { DocVisuDocumentSectionComponent } from "@doc-visu/doc-visu-document-section/doc-visu-document-section.component";
import { DocVisuDirectoryStructureComponent } from "@doc-visu/doc-visu-settings/doc-visu-directory-structure/doc-visu-directory-structure.component";
import { DocVisuDocumentSectionSettingComponent } from "@doc-visu/doc-visu-settings/doc-visu-document-section-setting/doc-visu-document-section-setting.component";
import { DocVisuProcessDetailsComponent } from "@doc-visu/doc-visu-document-section/doc-visu-process-details/doc-visu-process-details.component";
import { DocVisuService } from "@doc-visu/doc-visu.service";
import { DocVisuFilePreviewComponent } from "@doc-visu/doc-visu-file-preview/doc-visu-file-preview.component";
import { DocVisuDirectoryViewComponent } from "@doc-visu/doc-visu-directory-view/doc-visu-directory-view.component";
import { FileSizePipe } from "@doc-visu/file-size.pipe";

@NgModule({
	declarations: [
		DocVisuComponent,
		DocVisuSettingsComponent,
		DocVisuDirectoryComponent,
		DocVisuDocumentSectionComponent,
		DocVisuDirectoryStructureComponent,
		DocVisuDocumentSectionSettingComponent,
		DocVisuProcessDetailsComponent,
		DocVisuFilePreviewComponent,
		DocVisuDirectoryViewComponent,
		FileSizePipe,
	],
	imports: [CommonModule, DocVisuRoutingModule, SharedModule],
	exports: [DocVisuProcessDetailsComponent],
	providers: [DocVisuService],
})
export class DocVisuModule {}

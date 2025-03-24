import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedModule } from "@app/shared/shared.module";

import { PersonalVisuRoutingModule } from "@personal-visu/personal-visu-routing.module";
import { PersonalVisuComponent } from "@personal-visu/personal-visu.component";
import { PersonalVisuReleaseHistoryComponent } from "@personal-visu/personal-visu-release-history/personal-visu-release-history.component";
import { PersonalVisuArchivedComponent } from "@personal-visu/personal-visu-archived/personal-visu-archived.component";
import { PersonalVisuTrainerDocumentComponent } from "@personal-visu/personal-visu-trainer-document/personal-visu-trainer-document.component";
import { PersonalVisuDocumentReadComponent } from "@personal-visu/personal-visu-document-read/personal-visu-document-read.component";
import { PersonalVisuSettingsComponent } from "@personal-visu/personal-visu-settings/personal-visu-settings.component";

@NgModule({
	imports: [CommonModule, PersonalVisuRoutingModule, SharedModule],
	declarations: [
		PersonalVisuComponent,
		PersonalVisuReleaseHistoryComponent,
		PersonalVisuArchivedComponent,
		PersonalVisuTrainerDocumentComponent,
		PersonalVisuDocumentReadComponent,
		PersonalVisuSettingsComponent,
	],
})
export class PersonalVisuModule {}

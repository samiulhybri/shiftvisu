import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedModule } from "@app/shared/shared.module";

import { ShiftVisuRoutingModule } from "@shift-visu/shift-visu-routing.module";
import { ShiftVisuComponent } from "@shift-visu/shift-visu.component";
import { ShiftVisuIssueTypeComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-issue-type.component";
import { ShiftVisuModelComponentComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-model-component/shift-visu-model-component.component";
import { ShiftVisuGeneralComponentComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-general-component/shift-visu-general-component.component";
import { ShiftVisuComponentComponent } from "@shift-visu/shift-visu-component/shift-visu-component.component";
import { ShiftVisuComponentOptionComponent } from "@shift-visu/shift-visu-component/shift-visu-component-option/shift-visu-component-option.component";
import { IsComponentTypeVisiblePipe } from "@shift-visu/pipes/is-component-type-visible.pipe";

@NgModule({
	declarations: [
		ShiftVisuComponent,
		ShiftVisuIssueTypeComponent,
		ShiftVisuModelComponentComponent,
		ShiftVisuGeneralComponentComponent,
		ShiftVisuComponentComponent,
		ShiftVisuComponentOptionComponent,
		IsComponentTypeVisiblePipe,
	],
	imports: [CommonModule, ShiftVisuRoutingModule, SharedModule],
})
export class ShiftVisuModule {}

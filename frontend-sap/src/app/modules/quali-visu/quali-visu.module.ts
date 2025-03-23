import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgOptimizedImage } from "@angular/common";

import { SharedModule } from "@app/shared/shared.module";

import { QualiVisuRoutingModule } from "@app/modules/quali-visu/quali-visu-routing.module";
import { QualiVisuComponent } from "@app/modules/quali-visu/quali-visu.component";
import { InspectionPointComponent } from "@app/modules/quali-visu/inspection-point/inspection-point.component";
import { EightDReportComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-report.component";
import { EightDReportGeneralComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-report-general/eight-d-report-general.component";
import { DescriptionComponent } from "@app/modules/quali-visu/eight-d-report/description/description.component";
import { ImmediateActionComponent } from "@app/modules/quali-visu/eight-d-report/immediate-action/immediate-action.component";
import { CorrectiveActionComponent } from "@app/modules/quali-visu/eight-d-report/corrective-action/corrective-action.component";
import { ImplementedActionComponent } from "@app/modules/quali-visu/eight-d-report/implemented-action/implemented-action.component";
import { PreventRecurrenceComponent } from "@app/modules/quali-visu/eight-d-report/prevent-recurrence/prevent-recurrence.component";
import { CongratulationComponent } from "@app/modules/quali-visu/eight-d-report/congratulation/congratulation.component";
import { FiveWComponent } from "@app/modules/quali-visu/eight-d-report/five-w/five-w.component";
import { IshikawaComponent } from "@app/modules/quali-visu/eight-d-report/ishikawa/ishikawa.component";
import { EightDAttachmentComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-attachment/eight-d-attachment.component";
import { EightDTaskFormComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-task-form/eight-d-task-form.component";
import { InspectionPointListComponent } from "@app/modules/quali-visu/inspection-point-list/inspection-point-list.component";
import { InspectionPointTabComponent } from "@app/modules/quali-visu/inspection-point-list/inspection-point-tab/inspection-point-tab.component";
import { InspectionUpdateTabComponent } from "@app/modules/quali-visu/inspection-point-list/inspection-update-tab/inspection-update-tab.component";
import { IshikawaFilterPipe } from "@app/modules/quali-visu/pipes/ishikawa-filter.pipe";

@NgModule({
	declarations: [
		QualiVisuComponent,
		InspectionPointComponent,
		EightDReportComponent,
		EightDReportGeneralComponent,
		DescriptionComponent,
		ImmediateActionComponent,
		CorrectiveActionComponent,
		ImplementedActionComponent,
		PreventRecurrenceComponent,
		CongratulationComponent,
		FiveWComponent,
		IshikawaComponent,
		EightDAttachmentComponent,
		EightDTaskFormComponent,
		InspectionPointListComponent,
		InspectionPointTabComponent,
		InspectionUpdateTabComponent,
		IshikawaFilterPipe,
	],
	imports: [CommonModule, QualiVisuRoutingModule, SharedModule, NgOptimizedImage],
	exports: [InspectionPointListComponent],
})
export class QualiVisuModule {}

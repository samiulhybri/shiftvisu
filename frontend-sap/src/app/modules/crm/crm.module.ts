import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedModule } from "@app/shared/shared.module";
import { CrmComponent } from "@app/modules/crm/crm.component";
import { CrmPageComponent } from "@app/modules/crm/crm-page/crm-page.component";
import { CrmV2RoutingModule } from "@app/modules/crm/crm-routing.module";
import { SalesFunnelComponent } from "@app/modules/crm/sales-funnel/sales-funnel.component";
import { SalesFunnelRespComponent } from "@app/modules/crm/sales-funnel-resp/sales-funnel-resp.component";
import { KanbanComponent } from "@app/modules/crm/kanban/kanban.component";
import { ContactComponent } from "@app/modules/crm/crm-page/contact/contact.component";
import { OverviewComponent } from "@app/modules/crm/crm-page/overview/overview.component";
import { AttachmentComponent } from "@app/modules/crm/crm-page/attachment/attachment.component";
import { DetailsComponent } from "@app/modules/crm/crm-page/details/details.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CrmActionLogsComponent } from "@app/modules/crm/crm-action-logs/crm-action-logs.component";
import { ExportImportComponent } from "@app/modules/crm/export-import/export-import.component";
import { ActivitiesComponent } from "@app/modules/crm/activities/activities.component";
import { ActionReportComponent } from "@app/modules/crm//action-report/action-report.component";
@NgModule({
	declarations: [
		CrmComponent,
		SalesFunnelComponent,
		CrmPageComponent,
		SalesFunnelRespComponent,
		KanbanComponent,
		ContactComponent,
		OverviewComponent,
		AttachmentComponent,
		DetailsComponent,
		CrmActionLogsComponent,
		ExportImportComponent,
		ActivitiesComponent,
		ActionReportComponent,
	],
	imports: [CrmV2RoutingModule, CommonModule, SharedModule, ScrollingModule],
})
export class CrmModule {}

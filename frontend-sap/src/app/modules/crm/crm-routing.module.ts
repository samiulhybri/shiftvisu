import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { premissionGuard } from "@app/shared/guard/premission.guard";
import { CrmComponent } from "@app/modules/crm/crm.component";
import { CrmPageComponent } from "@app/modules/crm/crm-page/crm-page.component";
import { SalesFunnelComponent } from "@app/modules/crm/sales-funnel/sales-funnel.component";
import { SalesFunnelRespComponent } from "@app/modules/crm/sales-funnel-resp/sales-funnel-resp.component";
import { KanbanComponent } from "@app/modules/crm/kanban/kanban.component";
import { ExportImportComponent } from "@app/modules/crm/export-import/export-import.component";
import { ActivitiesComponent } from "@app/modules/crm/activities/activities.component";
import { ActionReportComponent } from "./action-report/action-report.component";
const routes: Routes = [
	{
		title: "CRM",
		path: "",
		component: CrmComponent,
		children: [
			{
				path: "crm-page",
				component: CrmPageComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "sales-funnel",
				component: SalesFunnelComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "sales-funnel-resp",
				component: SalesFunnelRespComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "export-import",
				component: ExportImportComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "kanban",
				component: KanbanComponent,
				canActivate: [
					premissionGuard
				],
			},
			{
				path: "activity",
				component: ActivitiesComponent,
				canActivate: [
					premissionGuard
				]
			},
			{
				path: "action-report",
				component: ActionReportComponent,
				canActivate: [
					premissionGuard
				]
			}
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CrmV2RoutingModule {}

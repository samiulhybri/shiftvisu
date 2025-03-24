import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToolVisuRoutingModule } from "./tool-visu-routing.module";
import { SharedModule } from "@app/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
	ComboBoxComponent,
	InputComponent,
	SelectComponent,
	SwitchComponent,
} from "@ui5/webcomponents-ngx";
import { ToolVisuComponent } from "@app/modules/tool-visu/tool-visu.component";
import { ToolOverviewComponent } from "@app/modules/tool-visu/tool-overview/tool-overview.component";
import { ToolRepairComponent } from "@app/modules/tool-visu/tool-repair/tool-repair.component";
import { RepairTypeComponent } from "@app/modules/tool-visu/tool-settings/repair-type/repair-type.component";
import { RepairTypeMasterComponent } from "@app/modules/tool-visu/tool-settings/repair-type-master/repair-type-master.component";
import { ToolSettingsComponent } from "@app/modules/tool-visu/tool-settings/tool-settings.component";
import { RepairTreeComponent } from "@app/modules/tool-visu/shared/repair-tree/repair-tree.component";
import { RepairDetailsComponent } from "@app/modules/tool-visu/shared/repair-details/repair-details.component";
import { PlannedOrdersComponent } from "@app/modules/tool-visu/planned-orders/planned-orders.component";
import { OrderHistoryComponent } from "@app/modules/tool-visu/order-history/order-history.component";
import { RepairHistoryComponent } from "@app/modules/tool-visu/repair-history/repair-history.component";
import { ActiveRepairComponent } from "@app/modules/tool-visu/shared/active-repair/active-repair.component";
import { ToolScheduleComponent } from "@app/modules/tool-visu/tool-schedule/tool-schedule.component";

@NgModule({
	declarations: [
		ToolVisuComponent,
		ToolOverviewComponent,
		ToolRepairComponent,
		RepairTypeComponent,
		RepairTypeMasterComponent,
		ToolSettingsComponent,
		ToolRepairComponent,
		RepairTreeComponent,
		RepairDetailsComponent,
		PlannedOrdersComponent,
		OrderHistoryComponent,
		RepairHistoryComponent,
		ActiveRepairComponent,
		ToolScheduleComponent,
	],
	imports: [
		CommonModule,
		ToolVisuRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		InputComponent,
		SelectComponent,
		SwitchComponent,
		ComboBoxComponent,
	],
	exports: [RepairDetailsComponent,RepairTreeComponent] ,
})
export class ToolVisuModule {
	
}

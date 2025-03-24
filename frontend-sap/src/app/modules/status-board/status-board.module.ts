import { NgModule } from "@angular/core";
import {CommonModule, NgIf} from "@angular/common";
import { StatusBoardComponent } from "./status-board.component";
import { StatusBoardRoutingModule } from "./status-board-routing.module";
import { ProductionPlanComponent } from "@app/modules/machine-board/production-plan/production-plan.component";
import { SharedModule } from "@app/shared/shared.module";
import { LegendCardComponent } from "@app/modules/status-board/legend-card/legend-card.component";
import { LegendComponent } from "@app/modules/status-board/legend/legend.component";
import { MachineStatusComponent } from "./machine-status/machine-status.component";
import { MachineCardComponent } from "@app/modules/status-board/machine-card/machine-card.component";
import { View1Component } from "./machine-card/view-1/view-1.component";
import { View2Component } from "./machine-card/view-2/view-2.component";
import { MachineBoardModule } from "../machine-board/machine-board.module";

@NgModule({
	declarations: [
		StatusBoardComponent,
		ProductionPlanComponent,
		LegendCardComponent,
		LegendComponent,
		MachineStatusComponent,
		MachineCardComponent,
		View1Component,
		View2Component,
	],
    imports: [StatusBoardRoutingModule, SharedModule, CommonModule, MachineBoardModule, NgIf],
})
export class StatusBoardModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MachineBoardComponent } from "./machine-board.component";
import { SharedModule } from "@app/shared/shared.module";
import { MachineBoardRoutingModule } from "@app/modules/machine-board/machine-board-routing.module";
import { MachineStatesComponent } from "@app/modules/machine-board/machine-states/machine-states.component";
import { MachineStateHistoryComponent } from "@app/modules/machine-board/machine-state-history/machine-state-history.component";
import { MachineBoardSidebarComponent } from "@app/modules/machine-board/machine-board-sidebar/machine-board-sidebar.component";
import { OperationDetailsComponent } from "@app/modules/machine-board/order-details/order-details.component";
import { MachineBoardHeaderComponent } from "@app/modules/machine-board/machine-board-header/machine-board-header.component";
import { OperationDetails2Component } from "@app/modules/machine-board/order-details-2/order-details-2.component";
import { MachineStateChartComponent } from "@app/modules/machine-board/machine-state-timeline/machine-state-chart/machine-state-chart.component";
import { MachineStateListComponent } from "@app/modules/machine-board/machine-state-timeline/machine-state-list/machine-state-list.component";
import { MachineStateTimelineComponent } from "@app/modules/machine-board/machine-state-timeline/machine-state-timeline.component";
import { ClockInComponent } from "@app/modules/machine-board/clock-in/clock-in.component";
import { ClockinTableComponent } from "@app/modules/machine-board/clock-in/clockin-table/clockin-table.component";
import { ToolDetailsComponent } from "@app/modules/machine-board/tool-details/tool-details.component";
import { QuantityChartComponent } from "@app/modules/machine-board/quantity-chart/quantity-chart.component";
import { MachineStateCurrentComponent } from "@app/modules/machine-board/machine-state-current/machine-state-current.component";
import { LoginPageComponent } from "@app/modules/home-page/login-page/login-page.component";
import { SwitchMachineComponent } from "@app/modules/machine-board/machine-state-timeline/switch-machine/switch-machine.component";
import { MachineStateHistoryTableComponent } from "@app/modules/machine-board/machine-state-history/machine-state-history-table/machine-state-history-table.component";
import { OperationLogisticDetailsComponent } from "@app/modules/machine-board/operation-logistic-details/operation-logistic-details.component";
import { SetupComponent } from "@app/modules/machine-board/setup/setup.component";
import { DocVisuComponent } from "@app/modules/machine-board/doc-visu/doc-visu.component";
import { MesComponent } from "@app/modules/machine-board/mes/mes.component";
import { FormsModule } from "@angular/forms";
import { MachineBoardView2Component } from "@app/modules/machine-board/machine-board-view-2/machine-board-view-2.component";
import { MachineKpi1Component } from "./machine-kpi-1/machine-kpi-1.component";
import { MachineKpi2Component } from "./machine-kpi-2/machine-kpi-2.component";
import { MachineBoardView1Component } from "@app/modules/machine-board/machine-board-view-1/machine-board-view-1.component";
import { TransportOrderComponent } from "@app/modules/machine-board/material-consumption/transport-order/transport-order.component";
import { MaterialConsumptionComponent } from "@app/modules/machine-board/material-consumption/material-consumption.component";
import { BillOfMaterialComponent } from "@app/modules/machine-board/material-consumption/bill-of-material/bill-of-material.component";
import { PackagingComponent } from "@app/modules/machine-board/packaging/packaging.component";
import { BoxPackagingComponent } from "@app/modules/machine-board/packaging/box-packaging/box-packaging.component";
import { CartonPackagingComponent } from "@app/modules/machine-board/packaging/carton-packaging/carton-packaging.component";
import { MachineQuantityComponent } from "@app/modules/machine-board/machine-quantity/machine-quantity.component";
import { StagingAreaComponent } from "./material-consumption/staging-area/staging-area.component";
import { FilterSelectionPartReasonsPipe } from "@app/shared/pipes/filter-selection-part-reasons.pipe";
import { ProposedQuantitiesDetailsComponent } from "./machine-quantity/proposed-quantities-details/proposed-quantities-details.component";
import { EntitySelectionDialogComponent } from "./machine-quantity/entity-selection-dialog/entity-selection-dialog.component";
import { DefaultPackagingComponent } from "@app/modules/machine-board/default-packaging/default-packaging.component";
import { PrintHandlingUnitComponent } from "@app/modules/machine-board/print-handling-unit/print-handling-unit.component";
import { ProdOrderPosOperationStatusComponent } from "@app/modules/machine-board/prod-order-pos-operation-status/prod-order-pos-operation-status.component";
import { PackagingItemImageComponent } from "@app/modules/machine-board/packaging-item-image/packaging-item-image.component";
import { PaintingLineComponent } from "@app/modules/machine-board/painting-line/painting-line.component";
import { QualiVisuMachineboardComponent } from "@app/modules/machine-board/quali-visu-machineboard/quali-visu-machineboard.component";
import { QualiVisuModule } from "@app/modules/quali-visu/quali-visu.module";
import { DocVisuModule } from "@app/modules/doc-visu/doc-visu.module";

@NgModule({
	declarations: [
		MachineBoardComponent,
		MachineStatesComponent,
		MachineStateHistoryComponent,
		ClockInComponent,
		ClockinTableComponent,
		MachineBoardSidebarComponent,
		OperationDetailsComponent,
		MachineBoardHeaderComponent,
		OperationDetails2Component,
		ToolDetailsComponent,
		ClockInComponent,
		ClockinTableComponent,
		QuantityChartComponent,
		MachineStateChartComponent,
		MachineStateListComponent,
		MachineStateTimelineComponent,
		ToolDetailsComponent,
		MachineStateCurrentComponent,
		LoginPageComponent,
		SwitchMachineComponent,
		OperationLogisticDetailsComponent,
		MachineQuantityComponent,
		SetupComponent,
		DocVisuComponent,
		MesComponent,
		MachineStateHistoryTableComponent,
		MachineBoardView2Component,
		MachineKpi1Component,
		MachineKpi2Component,
		MachineBoardView1Component,
		MaterialConsumptionComponent,
		TransportOrderComponent,
		BillOfMaterialComponent,
		PackagingComponent,
		BoxPackagingComponent,
		CartonPackagingComponent,
		StagingAreaComponent,
		FilterSelectionPartReasonsPipe,
		ProposedQuantitiesDetailsComponent,
		EntitySelectionDialogComponent,
		DefaultPackagingComponent,
		PrintHandlingUnitComponent,
		ProdOrderPosOperationStatusComponent,
		PackagingItemImageComponent,
		PaintingLineComponent,
		QualiVisuMachineboardComponent,
	],
	imports: [MachineBoardRoutingModule, CommonModule, SharedModule, FormsModule, QualiVisuModule, DocVisuModule],
	exports: [
		OperationDetailsComponent,
		ToolDetailsComponent,
		BillOfMaterialComponent,
		MaterialConsumptionComponent,
	],
})
export class MachineBoardModule {}

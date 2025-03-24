import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PlanVisuRoutingModule } from "@app/modules/planvisu/planvisu-routing.module";
import { HallComponent } from "@app/modules/planvisu/hall/hall.component";
import { SharedModule } from "@app/shared/shared.module";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import "@ui5/webcomponents-localization/dist/Assets.js";
import { CdkDrag, CdkDropList, CdkDropListGroup } from "@angular/cdk/drag-drop";
import { OperationComponent } from "@app/modules/planvisu/operation/operation.component";
import { ProductTypePipe } from "@app/modules/planvisu/forge/product-type.pipe";
import { FurnaceComponent } from "@app/modules/planvisu/furnace/furnace.component";
import { TripComponent } from "@app/modules/planvisu/furnace/trip/trip.component";
import { SettingComponent } from "@app/modules/planvisu/furnace/setting/setting.component";
import { MainPageComponent } from "@app/modules/planvisu/main-page/main-page.component";
import { HweKalkCalculationDetailsComponent } from "@app/modules/planvisu/hwe-kalk-calculation-details/hwe-kalk-calculation-details.component";
import { ProductionPlanningComponent } from "@app/modules/planvisu/production-planning/production-planning.component";

import { GanttComponent } from '@app/modules/planvisu/gantt/gantt.component';
import { MachineSchedulerComponent } from '@app/modules/planvisu/machine-scheduler/machine-scheduler.component';
import { UserSchedulerComponent } from '@app/modules/planvisu/user-scheduler/user-scheduler.component';
import { BryntumSchedulerProModule, BryntumVersionGridComponent, } from '@bryntum/schedulerpro-angular-thin';
import { RangeOverviewComponent } from '@app/modules/planvisu/range-overview/range-overview.component';
import { BryntumCoreModule } from "@bryntum/core-angular-thin";
import { BryntumGridModule } from "@bryntum/grid-angular-thin";
import { StaffNeededComponent } from "@app/modules/planvisu/staff-needed/staff-needed.component";
import { CreateOrderComponent } from '@app/modules/planvisu/create-order/create-order.component';
import { SetupPlanComponent } from '@app/modules/planvisu/setup-plan/setup-plan.component';
import { StaffWorkloadComponent } from '@app/modules/planvisu/staff-workload/staff-workload.component';
import { MachineWorkloadComponent } from '@app/modules/planvisu/machine-workload/machine-workload.component';
import { OrderViewComponent } from '@app/modules/planvisu/order-view/order-view.component';
import { MachineOrdersModalComponent } from '@app/modules/planvisu/gantt/machine-orders-modal/machine-orders-modal.component';
import { OrderDetailsDialogComponent } from '@app/modules/planvisu/shared/order-details-dialog/order-details-dialog.component';
import { ExportImportComponent } from '@app/modules/planvisu/export-import/export-import.component';
import { ColorSchemeComponent } from '@app/modules/planvisu/settings/color-scheme/color-scheme.component';
import { ColorSchemeSortingComponent } from '@app/modules/planvisu/settings/color-scheme-sorting/color-scheme-sorting.component';
import { SettingsComponent } from '@app/modules/planvisu/settings/settings.component';
import { GeneralComponent } from '@app/modules/planvisu/settings/general/general.component';
import { OperationSchedulerComponent } from "@app/modules/planvisu/operation-scheduler/operation-scheduler.component";
import { OrderViewTreeComponent } from '@app/modules/planvisu/order-view-tree/order-view-tree.component';
import { UserPlanComponent } from '@app/modules/planvisu/user-plan/user-plan.component';

@NgModule({
	declarations: [
		HallComponent,
		OperationComponent,
		ProductTypePipe,
		FurnaceComponent,
		TripComponent,
		SettingComponent,
		MainPageComponent,
		HweKalkCalculationDetailsComponent,
		ProductionPlanningComponent,
		GanttComponent,
		MachineSchedulerComponent,
		UserSchedulerComponent,
		RangeOverviewComponent,
		OperationSchedulerComponent,
		StaffNeededComponent,
        CreateOrderComponent,
        StaffWorkloadComponent,
        MachineWorkloadComponent,
        SetupPlanComponent,
        OrderViewComponent,
        MachineOrdersModalComponent,
        OrderDetailsDialogComponent,
        ExportImportComponent,
        ColorSchemeComponent,
        ColorSchemeSortingComponent,
        SettingsComponent,
        GeneralComponent,
		OrderViewTreeComponent,
  		UserPlanComponent
	],
	imports: [
		PlanVisuRoutingModule,
		CommonModule,
		SharedModule,
		CdkDropListGroup,
		CdkDropList,
		CdkDrag,
		BryntumSchedulerProModule,
        BryntumCoreModule,
        BryntumGridModule
	],
})
export class PlanVisuModule {}

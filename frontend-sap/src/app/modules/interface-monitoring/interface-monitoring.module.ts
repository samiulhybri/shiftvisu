import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { InterfaceMonitoringRoutingModule } from "@app/modules/interface-monitoring/interface-monitoring-routing.module";
import { InterfaceMonitoringComponent } from "@app/modules/interface-monitoring/interface-monitoring.component";
import { SharedModule } from "@app/shared/shared.module";
import { DataExportsComponent } from "@app/modules/interface-monitoring/overview/data-exports.component";
import { ScheduledCommandsComponent } from '@app/modules/interface-monitoring/scheduled-commands/scheduled-commands.component';
import { ClosedOperationsComponent } from '@app/modules/interface-monitoring/closed-operations/closed-operations.component';

@NgModule({
	declarations: [InterfaceMonitoringComponent, DataExportsComponent, ScheduledCommandsComponent, ClosedOperationsComponent],
	imports: [CommonModule, InterfaceMonitoringRoutingModule, SharedModule],
})
export class InterfaceMonitoringModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaintenanceRoutingModule } from '@app/modules/maintenance/maintenance-routing.module';
import { MaintenanceComponent } from '@app/modules/maintenance/maintenance.component';
import { ManageMaintenanceComponent } from '@app/modules/maintenance/manage-maintenance/manage-maintenance.component';
import { MaintenanceHistoryComponent } from '@app/modules/maintenance/maintenance-history/maintenance-history.component';
import { SettingsComponent } from '@app/modules/maintenance/settings/settings.component';
import { SharedModule } from '@app/shared/shared.module';
import { MaintenanceManagingDialogComponent } from '@app/modules/maintenance/manage-maintenance/maintenance-managing-dialog/maintenance-managing-dialog.component';


@NgModule({
	declarations: [MaintenanceComponent, ManageMaintenanceComponent, MaintenanceHistoryComponent, SettingsComponent, MaintenanceManagingDialogComponent],
	imports: [CommonModule, MaintenanceRoutingModule, SharedModule],
})
export class MaintenanceModule { }

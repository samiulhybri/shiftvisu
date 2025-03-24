import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeVisuRoutingModule } from '@app/modules/time-visu/time-visu-routing.module';
import { TimeVisuComponent } from '@app/modules/time-visu/time-visu.component';
import { SharedModule } from '@app/shared/shared.module';
import { TimeRecordComponent } from '@app/modules/time-visu/time-record/time-record.component';
import { ToolVisuModule } from '@app/modules/tool-visu/tool-visu.module';
import { ReportsComponent } from '@app/modules/time-visu/reports/reports.component';

@NgModule({
    declarations: [
        TimeVisuComponent,
        TimeRecordComponent,
        ReportsComponent
    ],
    imports: [
        CommonModule,
        TimeVisuRoutingModule,
        SharedModule, 
        ToolVisuModule,
    ]
})
export class TimeVisuModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Modules
import { SharedModule } from 'src/app/shared/shared.module';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { EnerVisuRoutingModule } from './ener-visu-routing.module';

// Components
import { EnerVisuComponent } from './ener-visu.component';

// Services
import { EnerVisuService } from './services/ener-visu.service';
import { KpiReportComponent } from './components/kpi-report/kpi-report.component';
import { MaterialConsumptionComponent } from './components/material-consumption/material-consumption.component';
import { ReportHeaderComponent } from './components/report-header/report-header.component';
import { EnerygyConsumptionComponent } from './components/enerygy-consumption/enerygy-consumption.component';


@NgModule({
    declarations: [
        EnerVisuComponent,
        EnerygyConsumptionComponent,
        KpiReportComponent,
        MaterialConsumptionComponent,
        ReportHeaderComponent,
    ],
    imports: [
        CommonModule,
        EnerVisuRoutingModule,
        SharedModule,
        ChartsModule
    ],
    exports: [
        MaterialConsumptionComponent
    ],
    providers: [
        EnerVisuService,
        DatePipe
    ]
})
export class EnerVisuModule { }

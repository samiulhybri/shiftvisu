import { NgModule } from '@angular/core';

import { MeltVisuRoutingModule } from './melt-visu-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MeltVisuComponent } from './melt-visu.component';
import { EntryComponent, OverviewComponent } from './components';
import { EmployeeInformationComponent } from './components/employee-information/employee-information.component';

@NgModule({
  declarations: [
    MeltVisuComponent,
    OverviewComponent,
    EntryComponent,
    EmployeeInformationComponent
  ],
  imports: [
    MeltVisuRoutingModule,
	  SharedModule
  ]
})
export class MeltVisuModule { }

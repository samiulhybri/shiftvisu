import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { PlanVisuRoutingModule } from './plan-visu-routing.module';
import { PlanVisuComponent } from './plan-visu.component';
import { SequencePlanningComponent } from './sequence-planning/sequence-planning.component';
import { BacklogComponent } from './backlog/backlog.component';
import { WorkloadComponent } from './workload/workload.component';


@NgModule({
  declarations: [
    PlanVisuComponent,
    SequencePlanningComponent,
    BacklogComponent,
    WorkloadComponent
  ],
  imports: [
    PlanVisuRoutingModule,
    SharedModule
  ]
})
export class PlanVisuModule { }

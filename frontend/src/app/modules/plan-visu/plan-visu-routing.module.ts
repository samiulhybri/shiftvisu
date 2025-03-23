import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BacklogComponent } from './backlog/backlog.component';
import { PlanVisuComponent } from './plan-visu.component';
import { SequencePlanningComponent } from './sequence-planning/sequence-planning.component';
import { WorkloadComponent } from './workload/workload.component';

const routes: Routes = [
  {
    path:'',
    component:PlanVisuComponent,
    children: [
		{
			path: '',
			redirectTo: 'sequence-planning',
			pathMatch: 'full'
		},
		{
			path: 'sequence-planning',
			component: SequencePlanningComponent
		},
		{
			path: 'backlog',
			component: BacklogComponent
		},
		{
			path: 'workload',
			component: WorkloadComponent
		}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanVisuRoutingModule { }

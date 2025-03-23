import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TaskVisuComponent } from './task-visu.component';
import { MyTaskComponent } from './components/my-task/my-task.component';
import { TeamTaskComponent } from './components/team-task/team-task.component';
import { AssignedTaskComponent } from './components/assigned-task/assigned-task.component';
import { MeetingComponent } from './components/meeting/meeting.component';
import { ProjectComponent } from './components/project/project.component';
import { RegularMeetingComponent } from './components/regular-meeting/regular-meeting.component';

const routes: Routes = [{
	path: '',
	component: TaskVisuComponent,
  children: [
    {
      path: '',
      redirectTo: 'my-task',
      pathMatch: 'full'
    }, 
    {
      path: 'my-task',
      component: MyTaskComponent
    },
    {
      path: 'team-task',
      component: TeamTaskComponent
    },
    {
      path: 'assigned-task',
      component: AssignedTaskComponent
    },
    {
      path: 'meeting',
      component: MeetingComponent
    },
    {
      path: 'project',
      component: ProjectComponent
    },
    {
      path: 'regular-meeting',
      component: RegularMeetingComponent
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskVisuRoutingModule { }

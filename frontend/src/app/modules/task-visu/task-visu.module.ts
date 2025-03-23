import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskVisuRoutingModule } from './task-visu-routing.module';
import { TaskVisuComponent } from './task-visu.component';
import { SharedModule } from '@app/shared/shared.module';
import { MyTaskComponent } from './components/my-task/my-task.component';
import { TeamTaskComponent } from './components/team-task/team-task.component';
import { AssignedTaskComponent } from './components/assigned-task/assigned-task.component';
import { MeetingComponent } from './components/meeting/meeting.component';
import { ProjectComponent } from './components/project/project.component';
import { RegularMeetingComponent } from './components/regular-meeting/regular-meeting.component';


@NgModule({
  declarations: [
    TaskVisuComponent,
    MyTaskComponent,
    TeamTaskComponent,
    AssignedTaskComponent,
    MeetingComponent,
    ProjectComponent,
    RegularMeetingComponent
  ],
  imports: [
    CommonModule,
    TaskVisuRoutingModule,
    SharedModule
  ]
})
export class TaskVisuModule { }

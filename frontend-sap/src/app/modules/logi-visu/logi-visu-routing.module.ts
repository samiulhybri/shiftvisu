import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogiVisuComponent } from '@app/modules/logi-visu/logi-visu.component';
import { ForkliftComponent } from '@app/modules/logi-visu/forklift/forklift.component';


const routes: Routes = [
  {
    path: '',
    component: LogiVisuComponent,
    children: [
      {
        path: '',
        component: ForkliftComponent
      }
    ]
  },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogiVisuRoutingModule { }

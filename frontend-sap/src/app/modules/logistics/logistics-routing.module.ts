import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogisticsComponent } from "@app/modules/logistics/logistics.component";
import { ForkliftComponent } from '@app/modules/logistics/forklift/forklift.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticsComponent,
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
export class LogisticsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceManagerComponent } from './absence-manager.component';
import { RequestPageComponent } from './components/request-page/request-page.component';
import { MyabsencePageComponent } from './components/myabsence-page/myabsence-page.component';
import { canActivate } from '@app/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [canActivate],
    component: AbsenceManagerComponent,

    children: [
      {
        path: '',
        redirectTo: 'my-absence',
        pathMatch: 'full'
      },
      {
        path: 'my-absence',
        component: MyabsencePageComponent
      },
      {
        path: 'request',
        component: RequestPageComponent
      }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbsenceManagerRoutingModule { }

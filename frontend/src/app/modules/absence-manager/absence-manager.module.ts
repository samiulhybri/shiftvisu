import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbsenceManagerRoutingModule } from './absence-manager-routing.module';
import { AbsenceManagerComponent } from './absence-manager.component';
import { RequestTableComponent } from './components/request-table/request-table.component';
import { MyabsencePageComponent } from './components/myabsence-page/myabsence-page.component';
import { RequestPageComponent } from './components/request-page/request-page.component';
import { MyNewRequestComponent } from './components/request-table/my-new-request/my-new-request.component';


@NgModule({
  declarations: [
    AbsenceManagerComponent,
    RequestTableComponent,
    MyabsencePageComponent,
    RequestPageComponent,
    MyNewRequestComponent,
  ],
  imports: [
    AbsenceManagerRoutingModule,
    SharedModule
  ]
})
export class AbsenceManagerModule { }

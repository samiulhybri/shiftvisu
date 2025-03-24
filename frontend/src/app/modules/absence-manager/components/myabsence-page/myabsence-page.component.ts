import { Component } from '@angular/core';
import { AbsenceManagerPageType} from '@app/enums/absence-manager-page-type'

@Component({
  selector: 'app-myabsence-page',
  templateUrl: './myabsence-page.component.html',
  styleUrls: ['./myabsence-page.component.scss']
})
export class MyabsencePageComponent {
    pageType = AbsenceManagerPageType.MYABSENCE;
}

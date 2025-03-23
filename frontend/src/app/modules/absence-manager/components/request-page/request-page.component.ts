import { Component } from '@angular/core';
import { AbsenceManagerPageType} from '@app/enums/absence-manager-page-type'
@Component({
  selector: 'app-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss']
})
export class RequestPageComponent {
  pageType = AbsenceManagerPageType.REQUEST;
}

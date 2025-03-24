import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sub-details-header',
  templateUrl: './sub-details-header.component.html',
  styleUrls: ['./sub-details-header.component.scss']
})
export class SubDetailsHeaderComponent{
  @Input() cost_sub_group:any;
}

import { Component } from '@angular/core';


import { IntlService } from "@progress/kendo-angular-intl";
import { Base } from 'src/app/shared/classes/base';

@Component({
  selector: 'app-melt-visu',
  templateUrl: './melt-visu.component.html',
  styleUrls: ['./melt-visu.component.scss']
})
export class MeltVisuComponent extends Base {
	public headerFirstTitle = 'melt'
	public headerSecondTitle = 'visu'

  constructor(intlService: IntlService){
		super(intlService)
	}
}

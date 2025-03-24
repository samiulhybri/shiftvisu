import { Component } from '@angular/core';

import { IntlService } from "@progress/kendo-angular-intl";
import { Base } from 'src/app/shared/classes/base';
import { BaseService } from './services/base.service';

@Component({
  selector: 'app-task-visu',
  templateUrl: './task-visu.component.html',
  styleUrls: ['./task-visu.component.scss']
})
export class TaskVisuComponent extends Base {
	public headerFirstTitle = 'task'
	public headerSecondTitle = 'visu'

  constructor(intlService: IntlService, public base: BaseService){
		super(intlService)
	}
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IntlService } from "@progress/kendo-angular-intl";

import { Base } from 'src/app/shared/classes/base';
import { Sidebar } from 'src/app/shared/models/sidebar';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-plan-visu',
  templateUrl: './plan-visu.component.html',
  styleUrls: ['./plan-visu.component.scss']
})
export class PlanVisuComponent extends Base {
	public headerFirstTitle = 'plan'
	public headerSecondTitle = 'visu'
	public sidebarMenu: Sidebar[] = this.getSidebar();

	  constructor(
		protected router: Router,
		private _commonService: CommonService, intlService: IntlService) {
		super(intlService)
	}

	/**
	 * Return route with necessary information
	 * @returns 
	 */
	public getSidebar() {
		return [
			{
				name: 'sequence_planning',
				path: 'sequence-planning',
				icon: 'path',
				child: []
			}, {
				name: 'backlog',
				path: 'backlog',
				icon: 'path',
				child: []
			},
			{
				name: 'workload',
				path: 'workload',
				icon: 'path',
				child: []
			}
		]
	}
}

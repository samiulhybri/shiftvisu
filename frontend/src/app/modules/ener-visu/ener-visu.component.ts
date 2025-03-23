import { Component } from '@angular/core';
import { IntlService } from "@progress/kendo-angular-intl";

import { Base } from 'src/app/shared/classes/base';
import { Sidebar } from 'src/app/shared/models/sidebar';
import { EnerVisuService } from './services/ener-visu.service';

@Component({
	selector: 'app-ener-visu',
	templateUrl: './ener-visu.component.html',
	styleUrls: ['./ener-visu.component.scss'],
})
export class EnerVisuComponent extends Base {
	enerSidebarMenu: Sidebar[] = this.getSidebar();

	constructor(
			intlService: IntlService,
			public enerVisuService: EnerVisuService
		) {
		super(intlService)
	}

	getSidebar() {
		return [
			{
				name: $localize `Energy Consumption`,
				path: 'enerygy-consumption',
				icon: 'path',
				child: [],
			},
		];
	}
}

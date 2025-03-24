import { Component } from '@angular/core';
import { IntlService } from "@progress/kendo-angular-intl";
import { Title } from "@angular/platform-browser";

import { Base } from 'src/app/shared/classes/base';
import { Router, RouterEvent } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-mp-offers',
	templateUrl: './mp-offers.component.html',
	styleUrls: ['./mp-offers.component.scss']
})
export class MpOffersComponent extends Base {
	public headerFirstTitle = $localize`mp`;
	public headerSecondTitle = $localize`offers`;

	constructor(intlService: IntlService, titleService: Title, protected router: Router) {
		super(intlService);
		try {
			if (environment.clientName !== '') titleService.setTitle(environment.clientName + ' | '  + $localize`MP Offers`); 
			else titleService.setTitle($localize`MP Offers`);
		} catch (e) {}
	}

}

import { Component } from '@angular/core';
import { CldrIntlService, IntlService } from "@progress/kendo-angular-intl";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'shopfloorsuite_frontend';
	
	constructor(public intl : IntlService){

		(<CldrIntlService>this.intl).localeId = 'it-IT';
	}
}

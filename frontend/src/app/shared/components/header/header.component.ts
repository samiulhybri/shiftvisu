import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppBarThemeColor } from "@progress/kendo-angular-navigation";
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/services/auth.service';
import { User } from '@app/models/user';
import { CommonService } from '@app/shared/services/common.service';
import { MpOfferService } from '@app/modules/mp-offers/services/mp-offer.service';
import { LanguageService } from '@app/services/language.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
	public logoPath = `assets/images/png/`;
	public logo = `${this.logoPath}logo.png`;
	public homeLink: string = environment.homeLink;
	public user: User = this.authService.user;
	public languageList: Array<any> = [];
	public selectedLanguage = this.languageService.getLanguage();

	@Input() firstTitle = 'hwe';
	@Input() secondTitle = 'kalk';
	@Input() theme: AppBarThemeColor = 'light';
	@Input() modulePath = '';

	constructor(
		private router: Router,
		private authService: AuthService,
		private commonService: CommonService,
		private mpOfferSrv: MpOfferService,
		public languageService: LanguageService
	) { }

	ngOnInit() {
		if (this.theme === 'dark') this.logo = `${this.logoPath}logo-alternate.png`;
		this.languageService.getLanguageList().subscribe({
			next: (response: any) => {
				this.languageList = response.value;
			}
		})
	}

	navigate(toNavigate: string, event: MouseEvent) {
		switch (toNavigate) {
			case 'home':
				if (this.commonService.currentModule == 'mp-offers') {
					this.mpOfferSrv.isHome = true;
					this.mpOfferSrv.pathLink = this.homeLink;
					if (this.router.url === '/mp-offers/overview' && event.ctrlKey) this.mpOfferSrv.openNewTab(this.homeLink);
					else if(this.router.url === '/mp-offers/overview' && !event.ctrlKey) this.mpOfferSrv.navigateToExternalUrl(this.homeLink);
					else {
						if(event.ctrlKey) this.mpOfferSrv.ctrlKeyPressed = true;
						else this.mpOfferSrv.ctrlKeyPressed = false;
						this.mpOfferSrv.updateValue(true);
					}
				} else {
					if(event.ctrlKey) this.mpOfferSrv.openNewTab(this.homeLink);
					else this.mpOfferSrv.navigateToExternalUrl(this.homeLink);
				}
				break;
			case 'module':
				const routePath = this.modulePath ? this.modulePath : `${this.firstTitle}-${this.secondTitle}`;
				const routeExists = this.router.config.some(route => route.path === routePath);

				if (routeExists) {
					if (this.commonService.currentModule == 'mp-offers') {
						this.mpOfferSrv.isHome = false;
						this.mpOfferSrv.pathLink = routePath + '/overview';
						if(event.ctrlKey) this.mpOfferSrv.openNewTab(this.mpOfferSrv.pathLink);
						else if(this.router.url !== '/mp-offers/overview') this.mpOfferSrv.updateValue(true);
					} else this.router.navigate([`/${routePath}`]);
				} 
				break;
			default:
				break;
		}

	}

	switchLanguage(event : any) {
		this.languageService.switchLanguage(event)
	}
}

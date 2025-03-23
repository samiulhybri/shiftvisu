import { Component, EventEmitter, Input, Output } from "@angular/core";
import { environment } from "@app/environments/environment";
import { Hall } from "@app/shared/models/hall.model";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";

@Component({
	selector: "app-header-nav",
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.css",
})
export class HeaderComponent {
	constructor(public authService: AuthService) {}

	@Input() isHomePage: boolean = false;
	@Input() homeRouteLink: string = '/';
	@Input() date: Date = new Date();
	@Input() showDateTime: boolean = false;
	@Input() title: string = "";
	@Input() showPlantSelector: boolean = false;
	@Output() logOutDialogEvent = new EventEmitter<void>();
	@Input() showHallCombobox: boolean = false;
	@Input() selectedHallValue: string = ""; 
	@Input() halls: Hall[] = []; 
	@Output() hallSelected: EventEmitter<any> = new EventEmitter();
	@Output() isSidebarCollapse: EventEmitter<any> = new EventEmitter();

	public companyLogo: string = environment.homeLogo;
	public isCustomLogo: boolean = environment.isHomeLogoCustom == 1 ? true : false;
	public isLogoutHide:boolean = environment.isLogoutHide
	public logoSrc: string = '';

	ngOnChanges(changes: any) {
		this.isHomePage = changes && changes.isHomePage ? changes.isHomePage.currentValue : this.isHomePage;
	}

	ngOnInit() {
		if(!this.isCustomLogo) {
			if(this.companyLogo == 'schertech') this.logoSrc = './assets/images/schertech-logo.png';
			else if(this.companyLogo == 'derga') this.logoSrc = './assets/images/derga_logo.png';
		} else this.logoSrc = '';
	}

	selectHall(event: any) {
		this.hallSelected.emit(event);
	}

	logoutDialogOpen() {
		this.logOutDialogEvent.emit();
	}

	onClickSidebarChange() {
		this.isSidebarCollapse.emit();
	}
}

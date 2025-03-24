import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { filter } from "rxjs/operators";
import "@ui5/webcomponents-icons/dist/shipping-status";
import "@ui5/webcomponents-icons/dist/enablement";
import LanguageState from "@app/shared/models/language-state.model";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
	selector: "app-home-page",
	templateUrl: "./home-page.component.html",
	styleUrl: "./home-page.component.css",
})
export class HomePageComponent implements OnInit {
	isLogOutDialogOpen = false;
	isBusy = false;
	releaseText: string = "";
	allowedModules: string[] = [];
	selectedLanguageName: string = "";
	selectedLanguageCode: string = "";
	selectedLanguage: any = new LanguageState().deserialize({});
	@ViewChild("menu", { static: false }) menu: any;
	storedLanguageName?: any;
	url = window.location.href;

	moduleList: any[] = [
		{
			module_name: "BaseVisu",
			route: "/base-visu",
			icon: "action-settings",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.BASEVISU_VIEW),
		},
		{
			module_name: "Statusboard",
			route: "/statusboard",
			icon: "bbyd-dashboard",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.STATUSBOARD_VIEW),
		},
		{
			module_name: "PlanVisu",
			route: "/planvisu",
			icon: "appointment-2",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.PLANVISU_VIEW),
		},
		{
			module_name: "LogiVisu HWE",
			route: "/logistics",
			icon: "shipping-status",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.LOGIVISU_HWE_VIEW),
		},
		{
			module_name: "ToolVisu",
			route: "/tool-visu",
			icon: "enablement",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_VIEW),
		},
		{
			module_name: "LogiVisu",
			route: "/logi-visu",
			icon: "shipping-status",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.LOGIVISU_VIEW),
		},
		{
			module_name: "Maintenance",
			route: "/maintenance",
			icon: "wrench",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.MAINTENANCE_VIEW),
		},
		{
			module_name: "Interface Monitoring",
			route: "/interface-monitoring",
			icon: "sys-monitor",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.INTERFACE_MONITORING_VIEW),
		},
		{
			module_name: "DocVisu",
			route: "/doc-visu/docSection",
			icon: 'documents',
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.DOCVISU_VIEW),
		},
		{
			module_name: "PersonalVisu",
			route: "/personal-visu",
			icon: 'personnel-view',
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.PERSONALVISU_VIEW),
		},
		{
			module_name: "ShiftVisu",
			route: "/shift-visu",
			icon: 'SAP-icons-TNT/deployment-instance',
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.SHIFTVISU_VIEW),
		},
		{
			module_name: "TimeVisu",
			route: "/time-visu",
			icon: 'time-account',
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.TIMEVISU_VIEW),
		},
		{
			module_name: "CRM",
			route: "/crm",
			icon: "crm-service-manager",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.CRM_VIEW),
		},
		{
			module_name: "QualiVisu",
			route: "/quali-visu",
			icon: "badge",
			active: true,
			isBusy: false,
			permission: this.authService.isPermissionValid(PermissionEnum.QUALIVISU_VIEW),
		},
	];

	constructor(
		private router: Router,
		private authService: AuthService,
		public commonService: CommonService,
		private http: HttpClient,
		private dataService: DataService
	) {
		this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((val: any) => {
			const lastPoint = val.url.split("/");
			if (lastPoint[0] && lastPoint[0] == "" && lastPoint[1] && lastPoint[1]) {
				this.moduleList.forEach(m => (m.isBusy = false));
			}
			this.moduleList = this.moduleList.filter(module => module.active && module.permission);
		});
	}

	ngOnInit(): void {
		this.resetStatusBoardCachedData();
	}

	resetStatusBoardCachedData() {
		this.dataService.filterHallId = [];
		this.dataService.filterMachineGroupId = [];
		this.dataService.filterMachineId = [];
		this.dataService.statusboardHallList = [];
		this.dataService.statusboardMachineGroupList = [];
		this.dataService.statusboardMachineList = null;
		this.commonService.get("assets/release.json", false, false).subscribe({
			next: (response: any) => {
				this.releaseText = response.release;
			},
		});
	}

	goToModule(routeParam: any, module: any) {
		module.isBusy = true;
		this.router.navigate([routeParam]);
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	languageMenu() {
		this.menu.elementRef.nativeElement.open = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	logOut() {
		this.isBusy = true;
		this.authService.logout().then(
			() => {
				this.isBusy = false;
				this.closeDialog();
				this.router.navigate(["/login"], { replaceUrl: true });
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	loadLanguage() {
		this.commonService.get("Languages").subscribe({
			next: (data: any) => {
				const allowedCodes = ["en", "de", "it"];
				this.selectedLanguage = data.value
					.filter((language: any) => allowedCodes.includes(language.code))
					.map((language: any) => {
						return new LanguageState().deserialize(language);
					});
			},
		});
	}

	onMenuItemSelect(event: any): void {
		this.selectedLanguageName = event.detail.item.getAttribute("text");
		const selectedLanguage = this.selectedLanguage.find(
			(lang: any) => lang.name === this.selectedLanguageName
		);

		if (selectedLanguage) {
			this.selectedLanguageCode = selectedLanguage.code;
			const url = new URL(this.url);
			const regex = /\/(en|de|it|tr)\//;
			url.href = url.href.replace(regex, `/${this.selectedLanguageCode}/`);
			localStorage.setItem("lastPart", this.selectedLanguageCode);
			localStorage.setItem("selectedLanguageName", selectedLanguage.name);
			this.storedLanguageName = selectedLanguage.name;
			window.history.replaceState({}, "", url.href);
			window.location.reload();
		}
	}
}

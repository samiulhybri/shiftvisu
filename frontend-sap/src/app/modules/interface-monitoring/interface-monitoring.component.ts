import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { Section } from "@app/shared/interfaces/section";
import { SideBarRoute } from "@app/modules/interface-monitoring/enums/SideBarRoute";

@Component({
	selector: "app-interface-monitoring",
	templateUrl: "./interface-monitoring.component.html",
	styleUrl: "./interface-monitoring.component.css",
})
export class InterfaceMonitoringComponent {
	isLogOutDialogOpen: boolean = false;
	isBusy: boolean = false;
	private sections: Section[] = [];
	PermissionEnum = PermissionEnum;
	public isSideNavCollapsed = false;
	public sidebar: any[] = [
		{
			id: "data-exports",
			text: $localize`Data Exports`,
			icon: "outbox",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.DATA_EXPORTS_VIEW),
			selected_condition: this.router.url === '/interface-monitoring' || this.router.url === '/interface-monitoring/data-exports'
		},
		{
			id: "scheduled-commands",
			text: $localize`Scheduled Commands`,
			icon: "present",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.COMMAND_SCHEDULES_VIEW),
			selected_condition: this.router.url === '/interface-monitoring/scheduled-commands'
		},
		{
			id: "closed-operations",
			text: $localize`Closed Operations`,
			icon: "SAP-icons-TNT/exclusive-gateway",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.CLOSED_OPERATIONS_VIEW),
			selected_condition: this.router.url === '/interface-monitoring/closed-operations'
		},
	];

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		public authService: AuthService
	) {}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	public navigateSection(sectionName: string) {
		switch (sectionName) {
			case SideBarRoute.DataExports:
				this.router.navigate(["interface-monitoring", "data-exports"]);
				break;
			case SideBarRoute.ScheduledCommands:
				this.router.navigate(["interface-monitoring", "scheduled-commands"]);
				break;
			case SideBarRoute.ClosedOperations:
				this.router.navigate(["interface-monitoring", "closed-operations"]);
				break;
			
		}
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

	onChangeSidebar() {
		this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
}

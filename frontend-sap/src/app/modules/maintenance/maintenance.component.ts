import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { SideBarRoute } from "../base-visu/enums/SideBarRoute";
import { Section } from "@app/shared/interfaces/section";
import "@ui5/webcomponents/dist/DateTimePicker.js";

@Component({
	selector: "app-maintenance",
	templateUrl: "./maintenance.component.html",
	styleUrl: "./maintenance.component.css",
})
export class MaintenanceComponent {
	isLogOutDialogOpen = false;
	isBusy = false;
	public isSideNavCollapsed = false;
	private sections: Section[] = [];
	constructor(
		public router: Router,
		protected authService: AuthService
	) {}

	ngAfterViewInit(): void {
		if (this.router.url == "/maintenance")
			this.router.navigate(["maintenance", "manage-maintenance"]);
	}
	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
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
	public sideNavigationSelectionChange(event: Event): void {
		const selectedItemId = (<CustomEvent>event).detail.item.id;
		const item = (<CustomEvent>event).detail.item as any;
		item.expanded = true;
		this.navigateSection(selectedItemId);
		item.toggleAttribute("expanded", "true");

		for (let section of this.sections) {
			if (section.id === selectedItemId) setTimeout(() => item.removeAttribute("selected"));
		}
	}

	public navigateSection(sectionName: string) {
		switch (sectionName) {
			case SideBarRoute.ManageMaintenance:
				this.router.navigate(["maintenance", "manage-maintenance"]);
				break;
			case SideBarRoute.MaintenanceHistory:
				this.router.navigate(["maintenance", "maintenance-history"]);
				break;
			case SideBarRoute.Setting:
				this.router.navigate(["maintenance", "settings"]);
				break;
			default:
				this.router.navigate(["maintenance", ""]);
				break;
		}
	}

	sideNavItemCollapse(expandOnly: boolean = false) {
		if (expandOnly) this.isSideNavCollapsed = false;
        else this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}

}

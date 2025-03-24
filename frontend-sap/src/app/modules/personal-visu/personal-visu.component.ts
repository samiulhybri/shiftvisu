import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { Subject, take, takeUntil } from "rxjs";

import { environment } from "@app/environments/environment";

import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";

@Component({
	selector: "app-personal-visu",
	templateUrl: "./personal-visu.component.html",
	styleUrl: "./personal-visu.component.css",
})
export class PersonalVisuComponent {
	public dynamicHomeRouteLink = environment.homeLink;
	public isLogOutDialogOpen: boolean = false;
	public isLoadingNavItems: boolean = true;
	private destroy$ = new Subject<void>();

	public navItems: any[] = [
		{
			title: $localize`Document Read`,
			route: "/personal-visu/document-read",
			icon: "education",
			onNavItemClick: (url: string) => {},
		},
		{
			title: $localize`Trainer Document`,
			route: "/personal-visu/trainer-document",
			icon: "insurance-life",
			onNavItemClick: (url: string) => {},
		},
		{
			title: $localize`Release History`,
			route: "/personal-visu/release-history",
			icon: "doc-attachment",
			onNavItemClick: (url: string) => {},
		},
		{
			title: $localize`Archived`,
			route: "/personal-visu/archived",
			icon: "fallback",
			onNavItemClick: (url: string) => {},
		},
	];
	isSideNavCollapsed = false;

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		public authService: AuthService,
		private _toasterSrv: ToastService
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	toggleSideNavCollpaseState(expandOnly: boolean = false) {
		if (expandOnly) {
			this.isSideNavCollapsed = false;
		} else {
			this.isSideNavCollapsed = !this.isSideNavCollapsed;
		}
	}
}

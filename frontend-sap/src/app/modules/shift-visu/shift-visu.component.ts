import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { timer } from "rxjs";

import { environment } from "@app/environments/environment";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { ISideNavItem } from "@app/shared/interfaces/side-nav-item.interface";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
import { Hall } from "@app/shared/models/hall.model";

@Component({
	selector: "app-shift-visu",
	templateUrl: "./shift-visu.component.html",
	styleUrl: "./shift-visu.component.css",
})
export class ShiftVisuComponent implements OnInit {
	public dynamicHomeRouteLink = environment.homeLink;
	public isLogOutDialogOpen: boolean = false;
	public isSideNavCollapsed = false;
	navItems: ISideNavItem[] = [];
	halls: Hall[] = [];

	buildNavItems() {
		this.navItems = [
			{
				label: $localize`Overview`,
				id: "shift-visu-overview",
				routerLink: "/shift-visu",
				icon: "BusinessSuiteInAppSymbols/icon-overview",
				permission: PermissionEnum.SHIFTVISU_VIEW,
			},
			...this.halls.map(hall => ({
				label: $localize`${hall.name}`,
				id: `shift-visu-issue-halls-${hall.id}`,
				routerLink: `/shift-visu/hall/${hall.id}`,
				icon: "factory",
				permission: PermissionEnum.SHIFTVISU_VIEW,
			})),
			{
				label: $localize`Settings`,
				id: "shift-visu-settings",
				icon: "settings",
				slot: "fixedItems",
				permission: PermissionEnum.SHIFTVISU_ADMIN,
				children: [
					{
						label: $localize`Failure Settings`,
						id: "shift-visu-failure-settings",
						routerLink: "/shift-visu/settings/failure",
						icon: "settings",
						permission: PermissionEnum.SHIFTVISU_ADMIN,
					},
					{
						label: $localize`Component Option`,
						id: "shift-visu-component-option",
						routerLink: "/shift-visu/settings/component",
						icon: "settings",
						permission: PermissionEnum.SHIFTVISU_ADMIN,
					},
					{
						label: $localize`General Settings`,
						id: "shift-visu-general-option",
						routerLink: "/shift-visu/settings/general",
						icon: "settings",
						permission: PermissionEnum.SHIFTVISU_ADMIN,
					},
				],
			},
		];
	}

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		private shiftVisuService: ShiftVisuService,
		public authService: AuthService
	) {}

	ngOnInit(): void {
		if (
			!this.authService.isPermissionValid(PermissionEnum.SHIFTVISU_VIEW) &&
			!this.authService.isPermissionValid(PermissionEnum.SHIFTVISU_ADMIN)
		) {
			this.router.navigate(["/"], {
				relativeTo: this.route,
				replaceUrl: true,
			});
		}

		this.navItems.map(i => {
			i.expanded = i.children?.some(c => c.routerLink == this.router.url) ? true : false;
		});

		this.shiftVisuService.getRefreshHallsObservable().subscribe(shouldRefresh => {
			if (shouldRefresh) {
			  this.getIsuueHalls();
			}
		  });		

		this.getIsuueHalls();
	}

	getIsuueHalls() {
		this.shiftVisuService["get"]("shift-visu/hall-list", false).subscribe({
			next: async (response: any) => {
				this.halls = response.map((item: any) => new Hall().deserialize(item));
				console.log("get shift visu halls", this.halls);
				this.buildNavItems();
			},
			error: async (error: any) => {
				console.log(error);
			},
		});
	}

	public sideNavigationSelectionChange(event: any): void {
		const item = (<CustomEvent>event).detail.item as any;

		if (item.children.length > 0) {
			item.expanded = true;
			timer(1).subscribe(() => {
				item.removeAttribute("selected");
				item.children[0].selected = true;
			});
		}
	}

	onSideNavItemClick(event: any, item?: ISideNavItem) {
		event.stopPropagation();
		if (item?.routerLink) {
			this.router.navigate([item.routerLink]);
		} else if (item?.children) {
			let permittedChildren = this.filterPermittedChildren(item.children);
			if (permittedChildren.length) {
				this.router.navigate([permittedChildren[0]?.routerLink]);
			}
		}
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	stopPropagation(event: any) {
		event.stopPropagation();
	}

	filterPermittedChildren(children: any[]) {
		return children.filter((c: any) => this.authService.isPermissionValid(c.permission));
	}

	toggleSideNavCollpaseState(expandOnly: boolean = false) {
		if (expandOnly) this.isSideNavCollapsed = false;
		else this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
}

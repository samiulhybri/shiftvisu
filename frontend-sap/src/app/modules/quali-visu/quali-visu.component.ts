import { Component } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";

import SideNavigationItem from "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";

import { AuthService } from "@app/shared/services/auth.service";
import { SideBarRoute } from "@app/modules/base-visu/enums/SideBarRoute";
import { Section } from "@app/shared/interfaces/section";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
	selector: "app-quali-visu",
	templateUrl: "./quali-visu.component.html",
	styleUrl: "./quali-visu.component.css",
})
export class QualiVisuComponent {
	public isSideNavCollapsed: boolean = false;
	permissionEnums = PermissionEnum;
	isLogOutDialogOpen = false;
	isBusy = false;
	private sections: Section[] = [];
	private sidenav: Element | null | undefined;
	previouslySelectedNavItem: any;
	confirmText: string = $localize`Confirm`;

	navigationItems = [
		{
			id: "inspectionPoint",
			text: $localize`Inspection Points`,
			navigationRoute: "/quali-visu/inspection-point",
			isPermitted: this.authService.isPermissionValid(
				this.permissionEnums.QUALIVISU_INSPECTION_POINT_VIEW
			),
			icon: "inspection",
		},
		{
			id: "8dReport",
			text: $localize`8D Report`,
			navigationRoute: "/quali-visu/eight-d-report",
			isPermitted: this.authService.isPermissionValid(
				this.permissionEnums.QUALIVISU_8D_REPORT_VIEW
			),
			icon: "approvals",
		},
	];

	constructor(
		public router: Router,
		protected authService: AuthService
	) {}

	ngAfterViewInit(): void {
		if (this.authService.isPermissionValid(PermissionEnum.QUALIVISU_VIEW)) {
			this.sidenav = document.querySelector("ui5-side-navigation");
			if (this.sidenav) {
				const navItems = Array.from(
					this.sidenav.querySelectorAll("ui5-side-navigation-item")
				);
				this.previouslySelectedNavItem = navItems.find(
					navItem => `/quali-visu/${navItem.id}` == this.router.url
				);
			}
		}

		this.findAllSections();
		if (this.router.url === "/quali-visu") {
			this.autoSelectFirstChildNav();
		}
	}

	autoSelectFirstChildNav() {
		const navItems = this.sidenav?.querySelectorAll("ui5-side-navigation-item");
		if (navItems && navItems.length > 0) {
			const firstChildId = this.sections[0].id;
			this.navigateSection(firstChildId, { replaceUrl: true });
			this.previouslySelectedNavItem = navItems[1];
		}
	}

	public findAllSections() {
		if (!this.sidenav) return [];
		const navItems = this.sidenav.querySelectorAll("ui5-side-navigation-item");

		navItems.forEach(item => {
			const mainSection: Section = {
				id: item.id,
				text: item.getAttribute("text") || "",
				icon: item.getAttribute("icon") || "",
				subItems: [],
			};

			this.sections.push(mainSection);
		});
		return this.sections;
	}

	expandSectionWithUrl() {
		const url = window.location.href;
		const basevisuIndex = url.indexOf("/quali-visu/");
		if (basevisuIndex >= 0) {
			const parameter = url.substring(basevisuIndex + "/quali-visu/".length);
			const parameterParts = parameter.split("/");
			let matchedSection: Section | null = null;
			for (let section of this.sections) {
				for (let subSection of section.subItems) {
					const name = subSection.id;
					const urlString = parameterParts[0];
					const newStr = name.replace("SubItem", "");
					const str = newStr.replace(/([A-Z])/g, "-$1").toLowerCase();
					if (str === urlString) {
						matchedSection = section;
						break;
					}
				}
				if (matchedSection) {
					break;
				}
			}
			if (matchedSection) {
				const navItems = this.sidenav?.querySelectorAll("ui5-side-navigation-item");
				navItems?.forEach((item, i) => {
					const openItem = navItems[i] as SideNavigationItem;
					if (item.id === matchedSection?.id) {
						openItem.expanded = true;
					} else openItem.expanded = false;
				});
			}
			return parameterParts[0];
		}
		return null;
	}

	public sideNavigationSelectionChange(event: Event): void {
		const selectedItemId = (<CustomEvent>event).detail.item.id;
		if (selectedItemId == "collapse-button") {
			setTimeout(() => {
				if (this.previouslySelectedNavItem) {
					this.previouslySelectedNavItem.setAttribute("selected", true);
					let currentItem = (<CustomEvent>event).detail.item as any;
					currentItem.removeAttribute("selected");
				}
			});

			return;
		}

		this.previouslySelectedNavItem = (<CustomEvent>event).detail.item;

		const item = (<CustomEvent>event).detail.item as any;
		item.expanded = true;
		this.navigateSection(selectedItemId);
	}

	public navigateSection(sectionName: string, extras?: NavigationExtras) {
		switch (sectionName) {
			case SideBarRoute.InspectionPoint:
				this.router.navigate(["quali-visu", "inspection-point"], extras);
				break;
			case SideBarRoute.EightDReport:
				this.router.navigate(["quali-visu", "eight-d-report"], extras);
				break;
			default:
				this.router.navigate(["quali-visu", ""], extras);
				break;
		}
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

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	toggleSideNavCollpaseState(expandOnly: boolean = false) {
		if (expandOnly) this.isSideNavCollapsed = false;
        else this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
}

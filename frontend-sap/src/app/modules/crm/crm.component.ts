import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { SideBarRoute } from "@app/modules/crm/enums/SideBarRoute";
import { Section } from "@app/shared/interfaces/section";

@Component({
	selector: "app-crm",
	templateUrl: "./crm.component.html",
	styleUrl: "./crm.component.css",
})
export class CrmComponent implements OnInit {
	isLogOutDialogOpen = false;
	isBusy = false;
	isSideNavCollapsed = false;
	previouslySelectedNavItem: any;
	PermissionEnum = PermissionEnum;
	private sidenav: Element | null | undefined;
	private sections: Section[] = [];
	private isCtrlOrCmdPressed = false;

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		public authService: AuthService
	) {}

	ngOnInit(): void {
		// Listen for keydown events
		window.addEventListener('keydown', (event: KeyboardEvent) => {
			this.isCtrlOrCmdPressed = event.ctrlKey || event.metaKey;
		});

		// Listen for keyup events to reset the flag
		window.addEventListener('keyup', () => {
			this.isCtrlOrCmdPressed = false;
		});
	}

	ngAfterViewInit(): void {
		if (this.authService.isPermissionValid(PermissionEnum.CRM_VIEW)) {
			this.sidenav = document.querySelector("ui5-side-navigation");
			if (this.sidenav) {
				const navItems = Array.from(
					this.sidenav.querySelectorAll("ui5-side-navigation-item")
				);
				this.previouslySelectedNavItem = navItems.find(
					navItem => `/crm/${navItem.id}` == this.router.url
				);
			}
		}
		this.findAllSections();

		if (this.router.url === "/crm") {
			this.autoSelectFirstChildNav();
		}
	}

	toggleSideNavCollpaseState(expandOnly: boolean = false) {
		if (expandOnly) {
			this.isSideNavCollapsed = false;
		} else {
			this.isSideNavCollapsed = !this.isSideNavCollapsed;
		}
	}

	autoSelectFirstChildNav() {
		const navItems = this.sidenav?.querySelectorAll("ui5-side-navigation-item");
		if (navItems && navItems.length > 1) {
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

	public sideNavigationSelectionChange(event: Event): void {
		if (this.isCtrlOrCmdPressed) { 
			event.preventDefault();
		}
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
		const sectionRoutes: { [key: string]: string } = {
			[SideBarRoute.CrmPage]: "crm-page",
			[SideBarRoute.SalesFunnel]: "sales-funnel",
			[SideBarRoute.SalesFunnelResponsible]: "sales-funnel-resp",
			[SideBarRoute.Kanban]: "kanban",
			[SideBarRoute.import]: "export-import",
			[SideBarRoute.activity]: "activity",
			[SideBarRoute.actionReport]: "action-report"
		};

		if (sectionRoutes[sectionName]) {
			const url = ["crm", sectionRoutes[sectionName]];

			if (this.isCtrlOrCmdPressed) {
				const CurrentLanguage = localStorage.getItem("CurrentLanguage") || "en";
				const newUrl = [...url];
				newUrl.unshift(CurrentLanguage);
				const fullUrl = this.router.serializeUrl(this.router.createUrlTree(newUrl, extras));		
				window.open(fullUrl, '_blank')
			} else {
				this.router.navigate(url, extras);
			}
		}
		else {
			this.router.navigate(["crm", ""], extras);
		}
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

}

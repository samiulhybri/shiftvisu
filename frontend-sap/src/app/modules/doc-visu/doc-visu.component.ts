import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { Subject, take, takeUntil } from "rxjs";

import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { environment } from "@app/environments/environment";
import { Localization } from "@app/shared/utils/common-localize";
import { BackendModelTypeClass } from "@app/shared/enums/BackendModelType";

import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";

import { ISideNavItem } from "@doc-visu/interfaces/side-nav-item.interface";
import { DocVisuService } from "@doc-visu/doc-visu.service";

@Component({
	selector: "app-doc-visu",
	templateUrl: "./doc-visu.component.html",
	styleUrl: "./doc-visu.component.css",
})
export class DocVisuComponent implements OnInit, OnDestroy {
	public dynamicHomeRouteLink = environment.homeLink;
	public isLogOutDialogOpen: boolean = false;
	isBusy: boolean = false;
	public isLoadingNavItems: boolean = true;
	private destroy$ = new Subject<void>();

	public navItems: ISideNavItem[] = [];
	isSideNavCollapsed = false;

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		public authService: AuthService,
		private _toasterSrv: ToastService,
		private docService: DocVisuService
	) {
		const backendModels = BackendModelTypeClass.getEnumArrayDocVisu();

		this.docService.docSectionChanged.pipe(takeUntil(this.destroy$)).subscribe({
			next: (section: any) => {
				if (section) {
					this.isLoadingNavItems = true;
					if (section.isDeleted) {
						this.navItems = this.navItems.filter(
							item => item.id !== `doc-visu-${section.id}`
						);
					} else {
						const slug = section.name
							.trim()
							.toLowerCase()
							.replace(/[^a-zA-Z0-9]+/g, "-")
							.replace(/^-+|-+$/g, "");

						const index = this.navItems.findIndex(
							(item: ISideNavItem) => item.id == `doc-visu-${section.id}`
						);
						if (index > -1) {
							this.navItems[index].title = section.name;
							this.navItems[index].route = `/doc-visu/${slug}`;
							this.navItems[index].id = `doc-visu-${section.id}`;
							this.navItems[index].sortOrder = section.sort_order;
							this.navItems[index].docSection = { ...section };
						} else {
							this.navItems.push({
								title: section.name,
								route: `/doc-visu/${slug}`,
								id: `doc-visu-${section.id}`,
								permission: PermissionEnum.DOCVISU_VIEW,
								sortOrder: section.sort_order,
								docSection: { ...section },
							});
						}
					}

					this.navItems = this.navItems.filter(item => item?.docSection.is_active);
					this.navItems.sort((a, b) =>
						a.sortOrder === b.sortOrder
							? a.title.localeCompare(b.title)
							: a.sortOrder - b.sortOrder
					);
					if (this.navItems.length == 0) {
						this.router.navigate(["doc-visu/settings"]);
					}

					this.isLoadingNavItems = false;
				}
			},
			error: error => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
			},
		});

		this.getDocumentSections().subscribe((data: any) => {
			if (data && data.length > 0) {
				this.navItems = [];
				data.forEach((item: any) => {
					const slug = item.name
						.trim()
						.toLowerCase()
						.replace(/[^a-zA-Z0-9]+/g, "-")
						.replace(/^-+|-+$/g, "");
					const tab: ISideNavItem = {
						title: item.name,
						route: `/doc-visu/${slug}`,
						id: `doc-visu-${item.id}`,
						permission: PermissionEnum.DOCVISU_VIEW,
						sortOrder: item.sort_order,
						docSection: {
							...item,
						},
					};
					const index = this.navItems.findIndex(
						(navItem: ISideNavItem) => navItem.id == tab.id
					);
					if (index > -1) {
						if (!item.is_active) {
							this.navItems.splice(index, 1);
						} else {
							this.navItems[index] = tab;
						}
					} else if (item.is_active) {
						this.navItems.push(tab);
					}
				});
			}

			this.navItems.forEach((item: ISideNavItem) => {
				const backendModel = backendModels.find(
					model => model.modelType == item.docSection?.model_type
				);
				if (backendModel) {
					item.icon = backendModel.icon;
				}
			});
			this.navItems = this.navItems.filter(item => item?.docSection.is_active);

			this.navItems.sort((a, b) => {
				if (a.sortOrder === b.sortOrder) {
					return a.title.localeCompare(b.title);
				}
				return a.sortOrder - b.sortOrder;
			});

			if (this.navItems.length == 0) {
				this.router.navigate(["doc-visu/settings"]);
			}

			const item = this.navItems.find(
				(item: ISideNavItem) =>
					item.route === this.router.url || this.router.url.includes(`${item.route}/`)
			);
			if (
				this.navItems.length > 0 &&
				!item &&
				!this.router.url.includes("doc-visu/settings")
			) {
				this.router.navigate([this.navItems[0].route]);
				this.docService.selectedNavDocSection.next(this.navItems[0].docSection);
			}

			const sectionItem = this.navItems.find(
				(item: ISideNavItem) => item.route === this.router.url
			);
			if (sectionItem) {
				this.docService.selectedNavDocSection.next({ ...sectionItem.docSection });
			}

			if (item && !sectionItem) {
				this.docService.selectedNavDocSection.next({ ...item });
			}

			this.isLoadingNavItems = false;
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.docService.selectedNavDocSection.next(null);
	}

	getDocumentSections() {
		return this.docService.getDocumentSectionNavItems();
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	onDocumentSectionClick(item?: ISideNavItem) {
		this.docService.selectedNavDocSection.next({ ...item });
	}

	toggleSideNavCollpaseState() {
		this.isSideNavCollapsed = !this.isSideNavCollapsed;
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

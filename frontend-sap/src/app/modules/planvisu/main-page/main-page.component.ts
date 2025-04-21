import { Component } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Hall } from "@app/shared/models/hall.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { PlanVisuPage, PlanVisuPageClass } from "@app/modules/planvisu/enums/PlanVisuPage.enum";
import { ProductionPlanningPageName } from "@app/shared/enums/ProductionPlanningPageName";
import { Localization } from "@app/shared/utils/common-localize";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { environment } from "@app/environments/environment";

@Component({
	selector: "app-main-page",
	templateUrl: "./main-page.component.html",
	styleUrl: "./main-page.component.css",
})
export class MainPageComponent {
	isLogOutDialogOpen = false;
	isBusy = false;
	halls: Hall[] = [];
	selectedHallId?: boolean;
	showHallCombobox: boolean = true;
	selectedHallValue = "";
	selectedPlanVisuPage = "";
	localization = Localization;
	isSideNavCollapsed = false;
	permissionEnums = PermissionEnum;

	constructor(
		private commonService: CommonService,
		protected router: Router,
		private route: ActivatedRoute,
		protected authService: AuthService
	) {
		this.selectedPlanVisuPage = authService.isPermissionValid("PRODUCTION_PLAN_PAGE_VIEW")
			? PlanVisuPageClass.getStateTranslate(PlanVisuPage.PRODUCTION_PLAN)
			: "";
	}

	ngAfterViewInit(): void {
		const href = this.router.url;
		const noHallComboboxRoutes = [
			"/planvisu/gantt",
			"/planvisu/range-overview",
			"/planvisu/create-order",
			"/planvisu/order-view",
			"/planvisu/setup-plan",
			"/planvisu/settings/color-schemes-sortings",
			"/planvisu/settings/color-schemes",
			"/planvisu/machine-workload",
			"/planvisu/staff-workload",
			"/planvisu/user-scheduler",
			"/planvisu/order-tree-view",
			"/planvisu/user-planning-overview"
		];
		this.showHallCombobox = !noHallComboboxRoutes.includes(href);
	}

	ngOnInit(): void {
		this.commonService
			.get("Halls?$filter=is_active eq true and is_enabled_plan_visu eq true")
			.subscribe((data: any) => {
				this.halls = data.value.map((value: any) => new Hall().deserialize(value));
				this.setNavigation();
			});

		const navigationRoutes = ["production", "machine-workload", "staff-workload", "staf-needed"];

		this.router.events.subscribe((val: any) => {
			if (val instanceof NavigationEnd) {
				if (navigationRoutes.some(route => val.url.includes(route))) {
					this.setNavigation();
				}
			}
		});
	}

	setNavigation() {
		const hallId = this.route.snapshot.firstChild?.params["id"]
			? this.route.snapshot.firstChild?.params["id"]
			: this.route.snapshot.firstChild?.firstChild?.params["id"];
		const hall = this.halls.find(hall => hall.id == hallId);

		if (hall) {
			this.selectedHallValue = hall.name!;
		}

		if (!this.route.snapshot.url.toString()) return;
		if (this.route.snapshot.url.toString().includes("gantt")) {
		} else if (this.route.snapshot.url.toString().includes("machine-workload")) {
			if (hallId) {
				this.router.navigate(["machine-workload"]);
			}
		} else if (this.route.snapshot.url.toString().includes("staff-workload")) {
			if (hallId) {
				this.router.navigate(["staff-workload"]);
			}
		} else if (this.route.snapshot.url.toString().includes("staff-needed")) {
			if (hallId) {
				this.router.navigate(["staff-needed", hallId ?? this.halls[0].id]);
			}
		} else {
			if (hallId) {
				const path = this.route.snapshot.firstChild?.url[0].path;

				switch (hall?.production_planning_page) {
					case ProductionPlanningPageName.DEFAULT:
						if (path != "hall") {
							this.router.navigate(["production-planning", "hall", hallId]);
						}
						break;
					case ProductionPlanningPageName.FORGE:
						if (path != "forge") {
							this.router.navigate(["production-planning", "forge", hallId]);
						}
						break;
					case ProductionPlanningPageName.FURNANCE:
						if (path != "furnace") {
							this.router.navigate(["production-planning", "furnace", hallId]);
						}
						break;
				}
			} else {
				switch (this.halls[0]?.production_planning_page) {
					case ProductionPlanningPageName.DEFAULT:
						this.router.navigate(["production-planning", "hall", this.halls[0].id], {
							relativeTo: this.route,
						});

						break;
					case ProductionPlanningPageName.FORGE:
						this.router.navigate(["production-planning", "forge", this.halls[0].id], {
							relativeTo: this.route,
						});
						break;
					case ProductionPlanningPageName.FURNANCE:
						this.router.navigate(["production-planning", "furnace", this.halls[0].id], {
							relativeTo: this.route,
						});
						break;
				}
				this.selectedHallValue = this.halls[0].name!;
			}
		}
	}

	changeNavigaiton(event: any) {
		this.showHallCombobox = true;
		const selectedItemId = (<CustomEvent>event).detail.item.id;
		const hallId = this.route.snapshot.firstChild?.params["id"]
			? this.route.snapshot.firstChild?.params["id"]
			: this.route.snapshot.firstChild?.firstChild?.params["id"];
		switch (selectedItemId) {
			case "gantt":
				this.router.navigate(["planvisu", "gantt"]);
				this.showHallCombobox = false;
				break;
			case "productionPlanningPage":
				this.router.navigate(["planvisu", "production-planning"]);
				break;
			case "machineSchedulergPage":
				this.router.navigate(["planvisu", "machine-scheduler"]);
				break;
			case "userSchedulergPage":
				this.router.navigate(["planvisu", "user-scheduler"]);
				break;
			case "rangeOverview":
				this.router.navigate(["planvisu", "range-overview"]);
				this.showHallCombobox = false;
				break;
			case "staffNeeded":
				this.router.navigate(["planvisu", "staff-needed", hallId ?? this.halls[0].id]);
				break;
			case "orderCreate":
				this.router.navigate(["planvisu", "create-order"]);
				this.showHallCombobox = false;
				break;
			case "orderView":
				this.router.navigate(["planvisu", "order-view"]);
				this.showHallCombobox = false;
				break;
			case "orderViewTree":
				this.router.navigate(["planvisu", "order-tree-view"]);
				this.showHallCombobox = false;
				break;
			case "staffWorkload":
				this.router.navigate(["planvisu", "staff-workload"]);
				this.showHallCombobox = false;
				break;
			case "machineWorkload":
				this.router.navigate(["planvisu", "machine-workload"]);
				this.showHallCombobox = false;
				break;
			case "setupPlan":
				this.router.navigate(["planvisu", "setup-plan"]);
				this.showHallCombobox = false;
				break;
			case "exportImport":
				this.router.navigate(["planvisu", "export-import"]);
				break;
			case "userPlan":
				this.router.navigate(["planvisu", "user-planning-overview"]);
				this.showHallCombobox = false;
				break;
			case "settings":
				this.router.navigate(["planvisu", "settings"]);
				this.showHallCombobox = false;
				break;
		}
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}
	goToFurnace(hallId: any) {
		this.router.navigate(["furnace", hallId], { relativeTo: this.route });
	}

	goToForge(hallId: any) {
		this.router.navigate(["forge", hallId], { relativeTo: this.route });
	}

	goToStandard(hallId: any) {
		this.router.navigate(["hall", hallId], { relativeTo: this.route });
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
				if (environment.isV10enable || environment.isV9enable) {
					window.location.href = environment.homeLink;
				} else {
					this.router.navigate(["/login"], { replaceUrl: true });
				}
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	selectHall(event: any) {
		this.selectedHallId = event.detail?.item?.id;
		const hall = this.halls.find(h => h.id == this.selectedHallId);
		let pageName = "";

		switch (hall?.production_planning_page) {
			case ProductionPlanningPageName.DEFAULT:
				pageName = "hall";
				break;
			case ProductionPlanningPageName.FORGE:
				pageName = "forge";
				break;
			case ProductionPlanningPageName.FURNANCE:
				pageName = "furnace";
				break;
		}

		if (this.router.url.includes("machine-workload")) {
			this.router.navigate(["machine-workload"], {
				relativeTo: this.route,
			});
		} else if (this.router.url.includes("staff-needed")) {
			this.router.navigate(["staff-needed", this.selectedHallId], {
				relativeTo: this.route,
			});
		} else if (this.router.url.includes("staff-workload")) {
			this.router.navigate(["staff-workload"], {
				relativeTo: this.route,
			});
		} else {
			this.router
				.navigate(["production-planning", pageName, this.selectedHallId], {
					relativeTo: this.route,
				})
				.then(() => {
					// window.location.reload();
				});
		}
	}

	toggleSideNavCollpaseState(expandOnly: boolean = false) {
		if (expandOnly) {
			this.isSideNavCollapsed = false;
		} else {
			this.isSideNavCollapsed = !this.isSideNavCollapsed;
		}
	}
}
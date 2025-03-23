import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Component } from "@angular/core";
import { Hall } from "@app/shared/models/hall.model";
import { CommonService } from "@app/shared/services/common.service";
import { ProductionPlanningPageName } from "@app/shared/enums/ProductionPlanningPageName";

@Component({
	selector: "app-production-planning",
	templateUrl: "./production-planning.component.html",
	styleUrl: "./production-planning.component.css",
})
export class ProductionPlanningComponent {
	halls: Hall[] = [];
	selectedHallId?: number;
	showHallCombobox: boolean = true;
	selectedHallValue = "";
	selectedPlanVisuPage = "";

	constructor(
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		//Called after the constructor, initializing input properties, and the first call to ngOnChanges.
		//Add 'implements OnInit' to the class.
		this.commonService
			.get("Halls?$filter=is_active eq true and is_enabled_plan_visu eq true")
			.subscribe((data: any) => {
				this.halls = data.value.map((value: any) => new Hall().deserialize(value));
				this.setNavigation();
			});

		this.router.events.subscribe((val: any) => {
			if (val instanceof NavigationEnd) {
				if (val.url.includes("production")) {
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

		if (hallId) {
			const path = this.route.snapshot.firstChild?.url[0].path;

			switch (hall?.production_planning_page) {
				case ProductionPlanningPageName.DEFAULT:
					if (path != "hall") {
						this.router.navigate(["hall", hallId]);
					}
					break;
				case ProductionPlanningPageName.FORGE:
					if (path != "forge") {
						this.router.navigate(["forge", hallId]);
					}
					break;
				case ProductionPlanningPageName.FURNANCE:
					if (path != "furnace") {
						this.router.navigate(["furnace", hallId]);
					}
					break;
			}
		} else {
			switch (this.halls[0]?.production_planning_page) {
				case ProductionPlanningPageName.DEFAULT:
					this.router.navigate(["hall", this.halls[0].id], {
						relativeTo: this.route,
					});

					break;
				case ProductionPlanningPageName.FORGE:
					this.router.navigate(["forge", this.halls[0].id], {
						relativeTo: this.route,
					});
					break;
				case ProductionPlanningPageName.FURNANCE:
					this.router.navigate(["furnace", this.halls[0].id], {
						relativeTo: this.route,
					});
					break;
			}
			this.selectedHallValue = this.halls[0].name!;
		}
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
            default:
                pageName = "hall";
				break;

		}

			this.router
				.navigate([pageName, this.selectedHallId], {
					relativeTo: this.route,
				})
				.then(() => {
					// window.location.reload();
				});
		}
}

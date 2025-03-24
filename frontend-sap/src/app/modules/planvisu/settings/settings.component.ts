import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "app-settings",
	templateUrl: "./settings.component.html",
	styleUrl: "./settings.component.css",
})
export class SettingsComponent {
	selectedTab: string = "document-section";
	private destroy$ = new Subject<void>();
	permissionEnums = PermissionEnum;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public authService: AuthService,
	) {}

	ngOnInit(): void {
		this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
			const currentPath = this.route.snapshot.firstChild?.routeConfig?.path;
			this.selectedTab = currentPath || "general";
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onTabSelect(event: any): void {
		const selectedTabId = event.detail.tab.id;
		if (selectedTabId === "colorSchemeSectionTab") {
			this.router.navigate(["color-schemes"], { relativeTo: this.route });
		} else if (selectedTabId === "colorSchemeSortingStructureTab") {
			this.router.navigate(["color-schemes-sortings"], { relativeTo: this.route });
		} else if (selectedTabId === "generalTab") {
			this.router.navigate(["general"], { relativeTo: this.route });
		}
	}
}

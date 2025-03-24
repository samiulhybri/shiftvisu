import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "app-doc-visu-settings",
	templateUrl: "./doc-visu-settings.component.html",
	styleUrls: ["./doc-visu-settings.component.css"],
})
export class DocVisuSettingsComponent implements OnDestroy{
	selectedTab: string = "document-section";
	private destroy$ = new Subject<void>();

	constructor(
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.router.events
		.pipe(takeUntil(this.destroy$))
		.subscribe(() => {
			const currentPath = this.route.snapshot.firstChild?.routeConfig?.path;
			this.selectedTab = currentPath || "document-section"; // Default to document-section
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onTabSelect(event: any): void {
		const selectedTabId = event.detail.tab.id;
		if (selectedTabId === "documentSectionTab") {
			this.router.navigate(["document-section"], { relativeTo: this.route });
		} else if (selectedTabId === "directoryStructureTab") {
			this.router.navigate(["directory-structure"], { relativeTo: this.route });
		}
	}
}

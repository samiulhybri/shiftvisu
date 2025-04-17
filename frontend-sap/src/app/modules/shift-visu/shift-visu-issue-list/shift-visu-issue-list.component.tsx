import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Hall } from "@app/shared/models/hall.model";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";
import { ShiftVisuIssueTypeModel } from "@app/shared/models/shift-visu-issue-type.model";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-fiori/dist/IllustratedMessage.js";
import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js";
@Component({
	selector: "app-shift-visu-issue-list",
	templateUrl: "./shift-visu-issue-list.component.html",
	styleUrl: "./shift-visu-issue-list.component.css",
})
export class ShiftVisuIssueListComponent implements OnInit {
	@ViewChild("addOrEditMeasurementDialog") addOrEditMeasurementDialog!: DialogComponent;
	@ViewChild("aiAssistDialog") aiAssistDialog!: DialogComponent;
	failureDescriptionNote: string = "";
	isIssueListCollapsed: boolean = false;
	isIssueTabCollapsed: boolean = false;
	isIssueTabLoading: boolean = false;
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	creator: string = "";
	hallId: number = 0;
	hall = new Hall();
	saveMode: "post" | "patch" | null = null;
	failureList: ShiftVisuIssueTypeModel[] = [];
	failureComponent: ShiftVisuComponentModel[] = [];

	constructor(
		private route: ActivatedRoute,
		private shiftVisuService: ShiftVisuService,
		public authService: AuthService
	) {}

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			const id = params.get("id");
			if (id) {
				this.hallId = +id;
				this.getHallInfo();
				this.creator = this.authService.getUser()?.name || "";
			}
		});
	}

	getHallInfo() {
		this.isIssueTabLoading = true;
		this.shiftVisuService["get"](
			`Halls(${this.hallId})?$expand=shiftVisuIssueTypes`,
			true
		).subscribe({
			next: async (response: any) => {
				this.hall = new Hall().deserialize(response);
				this.failureList = structuredClone(this.hall.shiftVisuIssueTypes);
				this.isIssueTabLoading = false;
			},
			error: async (error: any) => {
				console.log(error);
				this.isIssueTabLoading = false;
			},
		});
	}

	columns: any = [
		{
			Header: $localize`Error`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Creator`,
			accessor: "model_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Failure Description`,
			accessor: "component_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Start Date`,
			accessor: "start_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Attachment`,
			accessor: "attachment",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
	];

	newMeasureButtonClick() {
		this.addOrEditMeasurementDialog.isDialogOpen = true;
	}
	aiAssistClick() {
		this.aiAssistDialog.isDialogOpen = true;
	}

	closeAiAssistDialog() {
		this.aiAssistDialog.isDialogOpen = false;
	}
	closeMeasurementDialog() {
		this.addOrEditMeasurementDialog.isDialogOpen = false;
	}

	onCLickIssueTabCollapsed() {
		this.isIssueTabCollapsed = !this.isIssueTabCollapsed;
	}

	onCLickIssueListCollapsed() {
		this.isIssueListCollapsed = !this.isIssueListCollapsed;
	}

	onFailureValues(data: any) {
		const failureName = data.detail.item.text;
		const failurId = data.detail.item.id;
		this.getFailureComponent(failurId);
	}

	getFailureComponent(id: number) {
		this.isIssueTabLoading = true;
		this.shiftVisuService["get"](
			`ShiftVisuIssueTypes(${id})?$expand=components`,
			true
		).subscribe({
			next: async (response: any) => {
				this.failureComponent = structuredClone(response.components);
				this.isIssueTabLoading = false;
			},
			error: async (error: any) => {
				console.log(error);
				this.isIssueTabLoading = false;
			},
		});
	}
}

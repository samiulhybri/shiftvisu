import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Hall } from "@app/shared/models/hall.model";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";
import { ShiftVisuIssueTypeModel } from "@app/shared/models/shift-visu-issue-type.model";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
@Component({
	selector: "app-shift-visu-issue-list",
	templateUrl: "./shift-visu-issue-list.component.html",
	styleUrl: "./shift-visu-issue-list.component.css",
})
export class ShiftVisuIssueListComponent implements OnInit {
	failureDescriptionNote: string = "";
	isIssueListCollapsed: boolean = false;
	isIssueTabCollapsed: boolean = false;
	isIssueTabLoading: boolean = false;
	localization = Localization;
	creator: string = "";
	hallId: number = 0;
	hall = new Hall();
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
				this.hallId = +id; // convert to number
				console.log("hallId from route:", this.hallId);
				this.getHallInfo();
				this.creator = this.authService.getUser()?.name || "";
				console.log("this.creator", this.creator);
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
				console.log("get shift visu hallInfo", this.hall);
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

	onCLickIssueTabCollapsed() {
		this.isIssueTabCollapsed = !this.isIssueTabCollapsed;
	}

	onCLickIssueListCollapsed() {
		this.isIssueListCollapsed = !this.isIssueListCollapsed;
	}

	onFailureValues(data: any) 
	{
		const failureName = data.detail.item.text;
		const failurId= data.detail.item.id;
		console.log("failurId", failurId);
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
				console.log("ShiftVisuIssueTypes component", this.failureComponent);
			},
			error: async (error: any) => {
				console.log(error);
				this.isIssueTabLoading = false;
			},
		});
	}
}

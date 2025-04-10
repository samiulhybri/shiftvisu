import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Hall } from "@app/shared/models/hall.model";
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
	hallId: number = 0;
	hall = new Hall();

	constructor(private route: ActivatedRoute, private shiftVisuService: ShiftVisuService) {}

	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			const id = params.get("id"); // assuming your route is defined with ':id'
			if (id) {
				this.hallId = +id; // convert to number
				console.log("hallId from route:", this.hallId);
        this.getHallInfo();
			}
		});
	}

  getHallInfo() {
    this.isIssueTabLoading = true;
		this.shiftVisuService["get"](`Halls(${this.hallId})?$expand=shiftVisuIssueTypes`, true).subscribe({
			next: async (response: any) => {
				this.hall = new Hall().deserialize(response);
				console.log("get shift visu hallInfo", this.hall);
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
}

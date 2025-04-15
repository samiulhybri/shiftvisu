import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Button, CheckBox, Switch } from "@ui5/webcomponents-react";
import React from "react";
@Component({
	selector: "app-server-issues-view",
	templateUrl: "./server-issues-view.component.html",
	styleUrl: "./server-issues-view.component.css",
})
export class ServerIssuesViewComponent implements OnInit {
	@Input() isOpenView: EventEmitter<string> = new EventEmitter<string>();
	OpenView: boolean = false;
	@Input() TabType: string = "";
	ngOnInit(): void {
		this.isOpenView.subscribe((items: any) => {
			this.OpenView = !this.OpenView;
		});
	}
	columns = [
		{
			Header: $localize`Details`,
			accessor: "details",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Responsible`,
			accessor: "responsible",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Restart`,
			accessor: "restart",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`End Date`,
			accessor: "enddate",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`No Corrective Measure`,
			accessor: "nocorrective",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<CheckBox checked readonly />
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Finished`,
			accessor: "finished",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Switch checked={true} disabled={true} onChange={function Xs() {}} />
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Button icon="edit" design="Transparent" disabled={true}></Button>
						<Button icon="delete" design="Transparent" disabled={true}></Button>
					</React.StrictMode>
				);
			},
		},
	];

	customdata: any = [
		{
			details: "new issue created and viewed with chart",
			creator: "shihab",
			nocorrective: "true",
			responsible: "new error",
			restart: "23.25.2025",
			enddate: "23.4.2322",
			finished: true,
		},
	];

	CloseDialog() {
		this.OpenView = false;
		this.TabType = "";
		
	}
}

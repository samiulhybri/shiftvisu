import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import React from "react";
import { Button, FlexBox, Form, Text } from "@ui5/webcomponents-react";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import moment from "moment";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";

@Component({
	selector: "crm-activities",
	templateUrl: "./activities.component.html",
	styleUrl: "./activities.component.css",
})
export class ActivitiesComponent implements OnInit, OnDestroy {
	/** UI State */
	isDialogOpen = false;
	isLoading = false;
	apiEndpoint = "";
	filterQuery: string = "";

	/** Date Range */
	startDate: Date = new Date();
	endDate: Date = new Date();

	/** Table Data */
	activityData: any[] = [];
	columns: any[] = [];

	/** Filters */
	selectedResponsible: any[] = [];
	selectActions: any[] = [];

	/** Pagination */
	page = 1;
	perPage = 50;
	isDone = 0;
	skip = 0;
	top = 50;

	/** Dropdown Data */
	responsible = { textAccessor: "name", idAccessor: "id", data: [] };
	countries = { textAccessor: "name", idAccessor: "id", data: [] };
	actions = { textAccessor: "name", idAccessor: "id", data: [] };

	@ViewChild("gridTable", { static: false }) gridTable?: CustomReactGridTable;

	constructor(private commonService: CommonService) {}

	/** Lifecycle Hooks */
	ngOnInit(): void {
		this.loadMasterData();
		this.initializeColumns();
	}

	ngOnDestroy(): void {
		// Clean up logic if needed (e.g., unsubscribe from observables)
	}

	/** Load Master Data */
	private loadMasterData(): void {
		this.loadResponsibleUsers();
		this.loadCountries();
		this.loadCRMActions();
	}

	private loadCRMActions(): void {
		this.fetchData("CrmActions?$filter=is_active eq true&$orderby=sort_order asc", data => {
			this.actions.data = data.value;
		});
	}

	private loadResponsibleUsers(): void {
		this.fetchData("Users?$orderby=name&$filter=is_active eq true", data => {
			this.responsible.data = data.value;
		});
	}

	private loadCountries(): void {
		this.fetchData("Countries?$filter=is_active eq true&$orderby=name asc", data => {
			this.countries.data = data.value;
		});
	}

	/** Fetch Data Helper */
	private fetchData(apiUrl: string, callback: (data: any) => void): void {
		this.commonService.get(apiUrl).subscribe({
			next: (data: any) => {
				callback(data);
				this.gridTable?.render();
			},
			error: error => console.error(`Error fetching ${apiUrl}:`, error),
		});
	}

	/** UI Actions */
	closeDialog(): void {
		this.isDialogOpen = false;
	}

	/** Construct API URL */
	private constructApiUrl(baseUrl: string, start: Date, end: Date): string {
		let queryParams = new URLSearchParams({
			start_date: start.toISOString(),
			end_date: end.toISOString(),
			isDone: String(this.isDone),
			perPage: String(this.perPage),
			page: String(this.page),
		});
		return `${baseUrl}?${queryParams.toString()}`;
	}

	/** Handle Multi-Select Changes */
	multiSelectOneSelectionChange(event: any): void {
		this.selectedResponsible = event.detail.items.map((item: any) => item.id);
		this.updateFilterQuery();
	}

	multiSelectActionSelectionChange(event: any): void {
		this.selectActions = event.detail.items.map((item: any) => item.id);
		this.updateFilterQuery();
	}

	/** Generate OData Filter Query */
	private updateFilterQuery(): void {
		const conditions: string[] = [];

		const buildCondition = (values: string[] | undefined, field: string): string => {
			if (values && values.length > 0) {
				const stringValueQuery = values.map(
					val => `(${field} ${LogicalOperator.EQ} ${val})`
				);
				return stringValueQuery.length > 1
					? `(${stringValueQuery.join(" or ")})`
					: stringValueQuery[0];
			}
			return "";
		};

		// Filter by user_id (Responsible)
		const responsibleCondition = buildCondition(this.selectedResponsible, "user_id");
		if (responsibleCondition) conditions.push(responsibleCondition);

		// Filter by crmAction.id
		const crmActionCondition = buildCondition(this.selectActions, "crm_action_id");
		if (crmActionCondition) conditions.push(crmActionCondition);

		this.filterQuery = conditions.length > 0 ? conditions.join(" and ") : "";
		this.gridTable!.filterQuery = this.filterQuery;
		this.gridTable?.onFilterAndSorting();
	}

	/** Fetch Activity Data */
	fetchActivityData(): void {
		this.isLoading = true;
		this.apiEndpoint = this.constructApiUrl("/crm/activities", this.startDate, this.endDate);

		if (this.gridTable) {
			this.gridTable.customUrl = this.apiEndpoint;
			this.gridTable.onPagination();
		}
	}

	/** Initialize Table Columns */
	private initializeColumns(): void {
		this.columns = [
			this.createColumn("Responsible", "user.name", GridTableColumnDataType.NestedString),
			this.createDateColumn("Date", "log_date"),
			this.createColumn("Action", "crmAction.name", GridTableColumnDataType.NestedString),
			this.createColumn("Note", "note", GridTableColumnDataType.String),
			this.createColumn("Customer", "customer.name", GridTableColumnDataType.NestedString),
			this.createColumn(
				"Country",
				"customer.country.name",
				GridTableColumnDataType.NestedString
			),
		];
	}

	/** Helper to Create Columns */
	private createColumn(header: string, accessor: string, dataType: any): any {
		return {
			Header: $localize`${header}`,
			accessor,
			isSelected: true,
			hAlign: "Left",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: dataType === GridTableColumnDataType.NestedString ? true : false,
			minWidth: 200,
			autoResizable: true,
			dataType: dataType,
		};
	}

	private createDateColumn(header: string, accessor: string): any {
		return {
			Header: $localize`${header}`,
			accessor,
			isSelected: true,
			hAlign: "End",
			disableFilters: true,
			disableGroupBy: true,
			minWidth: 50,
			Cell: (instance: { row: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{rowData?.log_date
									? moment(rowData.log_date).format("DD.MM.YYYY")
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		};
	}
}

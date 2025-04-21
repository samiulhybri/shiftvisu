import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from "@angular/core";

import { FlexBox, Button } from "@ui5/webcomponents-react";
import React from "react";
import moment from "moment";
import { ToastComponent } from "@ui5/webcomponents-ngx";

import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { EightDReportTabType } from "@app/shared/enums/EightDReportTabType";
import { Localization } from "@app/shared/utils/common-localize";
import { returnChanges } from "@app/shared/utils/return-changes";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-prevent-recurrence",
	templateUrl: "./prevent-recurrence.component.html",
	styleUrl: "./prevent-recurrence.component.css",
})
export class PreventRecurrenceComponent {
	@ViewChild("preventReccurenceRef", { static: false }) preventReccurenceGrid:
		| CustomReactGridTable
		| undefined;

	@ViewChild("toast") toast?: ToastComponent;

	localization = Localization;

	@Input() eightDReportId: number = 0;
	@Input() isSaving: boolean = false;

	columns: any[] = [
		{
			Header: $localize`Task Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Responsible Person`,
			accessor: "responsible.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			dataType: GridTableColumnDataType.NestedString,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				let responsible = this.teamMembers.find(m => m.id == rowData.responsible_id);

				return (
					<React.StrictMode>
						<div>{responsible?.name ?? ""}</div>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`End Date`,
			accessor: "end_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.Date,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const formattedDate = moment(rowData?.end_date);

				return (
					<React.StrictMode>
						<FlexBox>
							{formattedDate.isValid()
								? moment.utc(formattedDate).local().format("DD.MM.YYYY")
								: ""}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Progress`,
			accessor: "progress",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			hAlign: "Right",
			width: 100,
			dataType: GridTableColumnDataType.Number,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<>{(rowData.progress ?? 0) >= 0 ? rowData.progress + "%" : ""}</>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Description`,
			accessor: "description",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			autoResizable: true,
			width: 120,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Button
								design="Transparent"
								icon="hint"
								onClick={() =>
									this.openDescriptionModal(rowData.description)
								}></Button>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	data: any[] = [];

	baseUrl = "EightDReportActions";

	isDescriptionModal: boolean = false;
	description: string = "";

	filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type eq '${EightDReportTabType.PREVENTIVE}'`;

	teamMembers: any[] = [];

	isTaskSaveDialogOpen: boolean = false;
	isSavingTask: boolean = false;

	deleteId: number | null = null;

	saveMode: "post" | "patch" = "post";

	initialTask: any = {};

	emptyTask = {
		name: "",
		responsible_id: "",
		end_date: "",
		progress: 0,
		description: "",
		action_type: EightDReportTabType.PREVENTIVE,
	};

	selectedTask: any = { ...this.emptyTask };
	toastMessage: string = "";

	constructor(
		private qualiVisuService: QualiVisuService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.qualiVisuService.teamMembersBehaviorObservable().subscribe(members => {
			this.teamMembers = members;
			this.preventReccurenceGrid?.onFilterAndSorting();
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes["eightDReportId"]?.currentValue &&
			changes["eightDReportId"]?.currentValue != changes["eightDReportId"]?.previousValue
		) {
			this.data = [];
			this.filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type eq '${EightDReportTabType.PREVENTIVE}'`;
		}
	}

	newButtonClick() {
		this.saveMode = "post";

		this.isTaskSaveDialogOpen = true;

		this.selectedTask = { ...this.emptyTask };
	}

	taskPopupSave(data: any) {
		let payload: any = {};
		let url = this.baseUrl;

		if (!data.responsible_id) {
			data.responsible_id = null;
		}

		if (!moment(data.end_date, "DD.MM.YYYY", true).isValid()) {
			data.end_date = null;
		}

		if (this.saveMode == "post") {
			payload = { ...data, eight_d_report_id: this.eightDReportId };
		} else if (this.saveMode == "patch") {
			url += `/${data.id}`;
			payload = { ...returnChanges(this.initialTask, data) };
		}

		if (payload.end_date) {
			payload.end_date = moment(payload.end_date, "DD.MM.YYYY", true)
				.endOf("day")
				.toISOString();
		}

		this.isSavingTask = true;

		this.qualiVisuService[this.saveMode](url, payload).subscribe(
			(r: any) => {
				this.preventReccurenceGrid?.onFilterAndSorting();
				this.saveMode = "patch";
				this.isSavingTask = false;
				this.isTaskSaveDialogOpen = false;
				this.toastMessage = this.localization.recordSavedSuccessfully;
				this.toast!.open = true;
			},
			error => {
				this.preventReccurenceGrid?.onFilterAndSorting();
				this.saveMode = "patch";
				this.isSavingTask = false;
				this.isTaskSaveDialogOpen = false;
				this.toastMessage = this.localization.failedToSaveData;
				this.toast!.open = true;
			}
		);
	}

	taskPopupClose(event: any) {
		this.isTaskSaveDialogOpen = false;
		this.selectedTask = { ...this.emptyTask };
	}

	deleteClick(data: any) {
		this.deleteId = data.id;
	}

	editClick(event: any) {
		this.saveMode = "patch";
		this.isTaskSaveDialogOpen = true;

		let data = { ...event };

		data.end_date = data.end_date ? moment.utc(data.end_date).local().format("DD.MM.YYYY") : "";

		this.initialTask = { ...data };
		this.selectedTask = { ...data };
	}

	openDescriptionModal(description: any): void {
		this.isDescriptionModal = true;
		this.description = description;
	}

	closeDialog(type: "description" | "delete") {
		if (type == "description") {
			this.isDescriptionModal = false;
		} else if (type == "delete") {
			this.deleteId = null;
		}
	}

	deleteTask() {
		this.isSavingTask = true;
		let url = this.baseUrl + `/${this.deleteId}`;
		this.qualiVisuService.delete(url).subscribe({
			next: r => {
				this.deleteId = null;
				this.isSavingTask = false;
				this.preventReccurenceGrid?.onFilterAndSorting();
			},
			error: error => {
				this.deleteId = null;
				this.isSavingTask = false;
				this.preventReccurenceGrid?.onFilterAndSorting();
			},
		});
	}
}

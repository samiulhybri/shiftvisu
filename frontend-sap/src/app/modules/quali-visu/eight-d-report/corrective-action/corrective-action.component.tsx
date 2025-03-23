import {
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewChild,
} from "@angular/core";

import { FlexBox, Button } from "@ui5/webcomponents-react";
import React from "react";
import moment from "moment";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ICustomButton } from "@app/shared/interfaces/custom-button.interface";
import { EightDReportTabType } from "@app/shared/enums/EightDReportTabType";
import { Localization } from "@app/shared/utils/common-localize";
import { returnChanges } from "@app/shared/utils/return-changes";
import { EightDReportAction } from "@app/shared/models/eight-d-report-action.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-corrective-action",
	templateUrl: "./corrective-action.component.html",
	styleUrl: "./corrective-action.component.css",
})
export class CorrectiveActionComponent implements OnInit, OnChanges {
	@ViewChild("correctiveActionRef", { static: false }) correctiveActionGrid:
		| CustomReactGridTable
		| undefined;

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
		},
		{
			Header: $localize`Responsible Person`,
			accessor: "responsible.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
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
			hAlign: "Right",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const formattedDate = moment(rowData?.end_date);

				return (
					<React.StrictMode>
						<FlexBox>
							{formattedDate.isValid() ? formattedDate.format("DD.MM.YYYY") : ""}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Progress`,
			accessor: "status",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			width: 100,
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
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
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

	customSecondaryToolbarButtons: ICustomButton[] = [
		{
			id: "implementAction",
			text: "Implement Actions",
			onClick: this.implementActionClick.bind(this),
			disable: () => !this.eightDReportId || this.isSavingTask || !this.data.length,
		},
	];

	baseUrl = "EightDReportActions";

	filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type in ('${EightDReportTabType.CORRECTIVE}','${EightDReportTabType.IMPLEMENTED}')`;

	data: EightDReportAction[] = [];

	isDescriptionModal: boolean = false;
	description: string = "";

	saveMode: "post" | "patch" = "post";

	initialTask: any = {};

	emptyTask: EightDReportAction = {
		name: "",
		responsible_id: "",
		end_date: "",
		progress: 0,
		description: "",
		action_type: EightDReportTabType.CORRECTIVE,
	};

	selectedTask: any = { ...this.emptyTask };

	teamMembers: any[] = [];

	isTaskSaveDialogOpen: boolean = false;
	isSavingTask: boolean = false;

	deleteId: number | null = null;
	selectedRowIds: Record<int, boolean> = {};

	constructor(private qualiVisuService: QualiVisuService) {}

	ngOnInit(): void {
		this.qualiVisuService.teamMembersBehaviorObservable().subscribe(members => {
			this.teamMembers = members;
			this.correctiveActionGrid?.render();
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes["eightDReportId"]?.currentValue != null &&
			changes["eightDReportId"]?.currentValue != undefined
		) {
			this.data = [];
			this.filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type in ('${EightDReportTabType.CORRECTIVE}','${EightDReportTabType.IMPLEMENTED}')`;
		}
	}

	processData(data: EightDReportAction[], recentData: any[]) {
		this.data = data;
		let selectedRowIds: Record<int, boolean> = {};

		data.forEach((d, i) => {
			if (d.action_type == EightDReportTabType.IMPLEMENTED) {
				selectedRowIds[i] = true;
			}
		});

		if (this.correctiveActionGrid) {
			this.correctiveActionGrid.selectedRowsId = selectedRowIds;
		}
	}

	newButtonClick() {
		this.saveMode = "post";

		this.isTaskSaveDialogOpen = true;

		this.initialTask = { ...this.emptyTask };
		this.selectedTask = { ...this.emptyTask };
	}

	actionToImplementDialogSaveClick() {
		let requests: ODataBatchCall[] = [];

		Object.entries(this.selectedRowIds as Record<int, boolean>).forEach(
			(selectedRow, requestIndex) => {
				let rowIndex = Number(selectedRow[0]);
				let rowData = this.data[rowIndex];

				let newActionType = selectedRow[1]
					? EightDReportTabType.IMPLEMENTED
					: EightDReportTabType.CORRECTIVE;

				let payload: EightDReportAction = {
					action_type: newActionType,
				};
				let request = new ODataBatchCall(
					requestIndex,
					"patch",
					`\/odata\/EightDReportActions\/${rowData.id}`
				);

				request.body = payload;
				requests.push(request);
			}
		);

		this.qualiVisuService.post("$batch", { requests }).subscribe({
			next: (response: any) => {},
			error: e => {},
		});
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

		if (Object.keys(payload).length === 0) {
			this.isTaskSaveDialogOpen = false;
			return;
		}

		this.isSavingTask = true;

		this.qualiVisuService[this.saveMode](url, payload).subscribe(
			(r: any) => {
				this.correctiveActionGrid?.onFilterAndSorting();
				this.saveMode = "patch";
				this.isSavingTask = false;
				this.isTaskSaveDialogOpen = false;
			},
			error => {
				this.correctiveActionGrid?.onFilterAndSorting();
				this.saveMode = "patch";
				this.isSavingTask = false;
				this.isTaskSaveDialogOpen = false;
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

		data.end_date = data.end_date ? moment(data.end_date).format("DD.MM.YYYY") : "";

		this.initialTask = { ...data };
		this.selectedTask = { ...data };
	}

	searchClick() {
		throw new Error("Method not implemented.");
	}

	correctiveRowClick(event: any) {
		this.selectedRowIds = event.detail.selectedRowIds;

		if (!this.selectedRowIds[event.detail.row.index]) {
			this.selectedRowIds[event.detail.row.index] = false;
		}
	}

	implementActionClick() {
		let requests: ODataBatchCall[] = [];

		Object.entries(this.selectedRowIds as Record<int, boolean>).forEach(
			(selectedRow, requestIndex) => {
				let rowIndex = Number(selectedRow[0]);
				let rowData = this.data[rowIndex];

				let newActionType = selectedRow[1]
					? EightDReportTabType.IMPLEMENTED
					: EightDReportTabType.CORRECTIVE;

				let payload: EightDReportAction = {
					action_type: newActionType,
				};
				let request = new ODataBatchCall(
					requestIndex,
					"patch",
					`/odata${this.baseUrl}/${rowData.id}`
				);

				request.body = payload;
				requests.push(request);
			}
		);

		this.isSavingTask = true;
		this.qualiVisuService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.isSavingTask = false;
				this.correctiveActionGrid?.onFilterAndSorting();
			},
			error: e => {
				this.isSavingTask = false;
				this.correctiveActionGrid?.onFilterAndSorting();
			},
		});
	}

	openDescriptionModal(description: string): void {
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
				this.correctiveActionGrid?.onFilterAndSorting();
			},
			error: error => {
				this.deleteId = null;
				this.isSavingTask = false;
				this.correctiveActionGrid?.onFilterAndSorting();
			},
		});
	}
}

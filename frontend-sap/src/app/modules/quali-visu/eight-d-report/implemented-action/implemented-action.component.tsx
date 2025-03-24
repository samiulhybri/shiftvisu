import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from "@angular/core";

import { FlexBox, Button } from "@ui5/webcomponents-react";
import React from "react";
import moment from "moment";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Localization } from "@app/shared/utils/common-localize";
import { EightDReportTabType } from "@app/shared/enums/EightDReportTabType";
import { EightDReportAction } from "@app/shared/models/eight-d-report-action.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ToastService } from "@app/shared/services/toaster.service";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-implemented-action",
	templateUrl: "./implemented-action.component.html",
	styleUrl: "./implemented-action.component.css",
})
export class ImplementedActionComponent {
	@ViewChild("implementedActionRef", { static: false }) implementedActionGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("actionToImplementRef", { static: false }) actionToImplementGrid:
		| CustomReactGridTable
		| undefined;

	@Input() eightDReportId: number = 0;
	@Input() isSaving: boolean = false;

	localization = Localization;

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
						<>
							{rowData.progress && rowData.progress >= 0
								? rowData.progress + "%"
								: ""}
						</>
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

	data: EightDReportAction[] = [];
	dataActionToImplement: EightDReportAction[] = [];

	selectedRowIds: Record<int, boolean> = {};

	isDescriptionModal: boolean = false;
	description: string = "";

	filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type eq '${EightDReportTabType.IMPLEMENTED}'`;
	filterQueryCorrecitve = `eight_d_report_id eq ${this.eightDReportId} and action_type in ('${EightDReportTabType.CORRECTIVE}', '${EightDReportTabType.IMPLEMENTED}'`;

	actionToImplementData: any[] = [];

	teamMembers: any[] = [];

	isActionToImplementDialogOpen = false;

	deleteId: number | null = null;
	isSavingActionToImplement: boolean = false;
	isDeletingImplementedTask: boolean = false;
	baseUrl: string = "/EightDReportActions";

	constructor(
		private qualiVisuService: QualiVisuService,
		private toast: ToastService
	) {}

	ngOnInit(): void {
		this.qualiVisuService.teamMembersBehaviorObservable().subscribe(members => {
			this.teamMembers = members;
			this.implementedActionGrid?.render();
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes["eightDReportId"]?.currentValue &&
			changes["eightDReportId"]?.currentValue != changes["eightDReportId"]?.previousValue
		) {
			this.data = [];
			this.filterQuery = `eight_d_report_id eq ${this.eightDReportId} and action_type eq '${EightDReportTabType.IMPLEMENTED}'`;
			this.filterQueryCorrecitve = `eight_d_report_id eq ${this.eightDReportId} and action_type in ('${EightDReportTabType.CORRECTIVE}', '${EightDReportTabType.IMPLEMENTED}')`;
		}
	}

	processDataActionToImplement(data: EightDReportAction[], recentData: any[]) {
		this.dataActionToImplement = data;
		this.selectedRowIds = {};

		data.forEach((d, i) => {
			if (d.action_type == EightDReportTabType.IMPLEMENTED) {
				this.selectedRowIds[i] = true;
			}
		});

		if (this.actionToImplementGrid) {
			this.actionToImplementGrid.selectedRowsId = this.selectedRowIds;
		}
	}

	newButtonClick() {
		this.isActionToImplementDialogOpen = true;
	}

	deleteClick(data: any) {
		this.deleteId = data.id;
	}

	onActionToImplementRowClick(event: any) {
		this.selectedRowIds = event.detail.selectedRowIds;

		if (!this.selectedRowIds[event.detail.row.index]) {
			this.selectedRowIds[event.detail.row.index] = false;
		}
	}

	actionToImplementDialogSaveClick() {
		let requests: ODataBatchCall[] = [];

		Object.entries(this.selectedRowIds as Record<int, boolean>).forEach(
			(selectedRow, requestIndex) => {
				let rowIndex = Number(selectedRow[0]);
				let rowData = this.dataActionToImplement[rowIndex];

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

		this.isSavingActionToImplement = true;
		this.qualiVisuService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.isActionToImplementDialogOpen = false;
				this.isSavingActionToImplement = false;
				this.implementedActionGrid?.onFilterAndSorting();
				this.actionToImplementGrid?.onFilterAndSorting();
			},
			error: e => {
				this.isActionToImplementDialogOpen = false;
				this.isSavingActionToImplement = false;
				this.implementedActionGrid?.onFilterAndSorting();
				this.actionToImplementGrid?.onFilterAndSorting();
			},
		});
	}

	closeActionToImplementDialog() {
		this.isActionToImplementDialogOpen = false;
	}

	openDescriptionModal(description: string): void {
		this.isDescriptionModal = true;
		this.description = description;
	}

	deleteTask() {
		this.isDeletingImplementedTask = true;

		let payload: EightDReportAction = {
			action_type: EightDReportTabType.CORRECTIVE,
		};

		let url = this.baseUrl + `/${this.deleteId}`;
		this.qualiVisuService.patch(url, payload).subscribe({
			next: r => {
				this.deleteId = null;
				this.isDeletingImplementedTask = false;
				this.implementedActionGrid?.onFilterAndSorting();
				this.actionToImplementGrid?.onFilterAndSorting();
			},
			error: error => {
				this.deleteId = null;
				this.isDeletingImplementedTask = false;
				this.implementedActionGrid?.onFilterAndSorting();
				this.actionToImplementGrid?.onFilterAndSorting();
			},
		});
	}

	closeDialog(type: "description" | "delete") {
		if (type == "description") {
			this.isDescriptionModal = false;
		} else if (type == "delete") {
			this.deleteId = null;
		}
	}
}

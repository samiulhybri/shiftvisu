import { Component, ViewChild } from "@angular/core";
import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { FlexBox, Icon, Text } from "@ui5/webcomponents-react";
import React from "react";
import ScheduledCommand from "@app/shared/models/scheduled-command.model";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import { NgForm } from "@angular/forms";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import cronstrue from 'cronstrue/i18n';
import Input from "@ui5/webcomponents/dist/Input";

@Component({
	selector: "app-scheduled-commands",
	templateUrl: "./scheduled-commands.component.html",
	styleUrl: "./scheduled-commands.component.css",
})
export class ScheduledCommandsComponent {
	@ViewChild("childComponentRef") childComponentRef!: CustomReactGridTable;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("errorDialogScheduledCommands", { static: false }) errorDialogScheduledCommands: any;
	selectedId = "";
	selectedRowValue: ScheduledCommand = new ScheduledCommand().deserialize({});
	isLoading = false;
	doYouWantToDeleteThisRecord: string = Localization.doYouWantToDeleteThisRecord;
	doYouWantToSaveThisRecord: string = Localization.doYouWantToSaveThisRecord;
	doYouWantToRemoveAllTheChanges: string = Localization.doYouWantToRemoveAllTheChanges;
	someThingWentWrong: string = Localization.someThingWentWrong;
	PermissionEnum = PermissionEnum;
	warning = Localization.warning;

	detailsTitle: string = Localization.details;
	showDetailsBody: boolean = true;
	isEditMode: boolean = false;
	isFiltering = false;

	columns: any = [
		{
			Header: $localize`Active`,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Center",
			maxWidth: 72,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
		},
		{
			Header: $localize`Priority`,
			accessor: "priority",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Number,
			hAlign: "Right",
			maxWidth: 70,
			isSelected: true,
		},
		{
			Header: $localize`Command`,
			accessor: "command",
			disableFilters: true,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.String,
			disableSortBy: true,
			hAlign: "Left",
			minWidth: 120,
			isSelected: true,
		},
		{
			Header: $localize`Cron Expression`,
			accessor: "cron_expression",
			disableFilters: true,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.String,
			disableSortBy: false,
			hAlign: "Left",
			isSelected: true,
		},
		{
			Header: $localize`Last Run At(Local Timezone)`,
			accessor: "last_run_at",
			disableFilters: true,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Date,
			disableSortBy: false,
			hAlign: "Left",
			isSelected: false,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.last_run_at, false);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Last Output`,
			accessor: "last_output",
			dataType: GridTableColumnDataType.String,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			isSelected: false,
		},
	];

	constructor(
		private commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	handleRowClick(event: any) {
		const selectedRow = event.detail.row.original;
		this.selectedRowValue = new ScheduledCommand().deserialize(selectedRow);
		
		this.detailsTitle = Localization.details;
		this.selectedRowValue.isSelected = event.detail.isSelected;
		this.isEditMode = false;

		this.setCronExpressionDetails(this.selectedRowValue.cron_expression);
	}

	deleteClick(value: any) {
		this.selectedId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	onSubmit(form: NgForm) {
		this.isLoading = true;
		this.commonService
			.put(`CommandSchedules(${this.selectedRowValue.id})`, this.selectedRowValue.toOdata())
			.subscribe({
				next: value => {
					const { recordSavedSuccessfully } = Localization;
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");
					this.filterHandler();
					this.isLoading = false;
					this.selectedRowValue.deserialize(value);
				},
				error: error => {
					this.isLoading = false;
					this.errorDialogScheduledCommands.elementRef.nativeElement.open = true;
				},
			});
	}

	saveClick() {
		const dialog = document.getElementById("saveDialog") as Dialog;
		dialog.open = true;
	}

	closeDialogSave() {
		const dialog = document.getElementById("saveDialog") as Dialog;
		dialog.open = false;
	}

	onSave() {
		(this.form as any).onSubmit(undefined);
		this.closeDialogSave();

		this.isEditMode = false;
	}

	closeErrorDialog() {
		this.errorDialogScheduledCommands.elementRef.nativeElement.open = false;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.commonService.delete(`CommandSchedules(${this.selectedId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.filterHandler();
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.isLoading = false;
				this.errorDialogScheduledCommands.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	processDataExportData(event: any): void {
		if(this.childComponentRef.tabChanged) {
			this.checkFirstRowId();

			this.childComponentRef.tabChanged = false;
		} else {
			this.isEditMode = false;

			if(this.isFiltering) {
				this.checkFirstRowId();
			} else {
				if (this.selectedRowValue.id) {
					this.checkSelectedDataId(this.selectedRowValue?.id);
				} else {
					this.checkFirstRowId();
					this.childComponentRef.tabChanged = false;
				}
			}
		}

		// If no data has found, then no need to show the details section
		if (this.childComponentRef && this.childComponentRef?.data.length == 0) {
			this.showDetailsBody = false;
			this.isEditMode = false;
			this.isFiltering = false;
		}
	}

	checkFirstRowId() {
		if (this.childComponentRef && this.childComponentRef?.data.length) {
			this.childComponentRef.selectedRowsId = { 0: true };
			this.selectedRowValue = new ScheduledCommand().deserialize(
				this.childComponentRef?.data[0]
			);
			this.selectedRowValue.isSelected = true;
			this.showDetailsBody = true;
			this.setCronExpressionDetails(this.selectedRowValue.cron_expression);
		} else {
			this.showDetailsBody = false;
			this.isEditMode = false;
			this.isFiltering = false;
		}
	}

	checkSelectedDataId(id?: number) {
		if (id) {
			const index: number = this.childComponentRef?.data.findIndex(
				(item: any) => item.id == id
			);
			if (this.childComponentRef && this.childComponentRef?.data.length) {
				this.childComponentRef.selectedRowsId = { [index]: true };
				this.selectedRowValue = new ScheduledCommand().deserialize(
					this.childComponentRef?.data[index]
				);
				this.selectedRowValue.isSelected = true;
				this.showDetailsBody = true;
			}
		}
	}

	onChangeCronExpression(event: any) {
		this.setCronExpressionDetails((event.target as any).value);
	}

	setCronExpressionDetails(expression: string) {
		const currentLanguage = localStorage.getItem("CurrentLanguage") || "en";
		const cronExpressionDetails = document.getElementById("cron_expression_details")! as Input;
		cronExpressionDetails.value = cronstrue.toString(expression, { locale: currentLanguage });
	}

	runCommandManually(value: any) {
		this.isLoading = true;

		const url: string = `scheduled-commands/${value.id}`;
		this.commonService.post(url, {}, false).subscribe({
			next: (response: any) => {
				this._toasterSrv.showToast($localize`Command Run Successfully`, "success");
				this.filterHandler();
				this.isLoading = false;
			},
			error: error => {
				this.isLoading = false;
			},
		});
	}

	handleEdit() {
		this.isEditMode = true;
	}

	handleDetailsCancel() {
		this.isEditMode = false;
		this.resetDetailsData();
		this.closeDialogCancel();
	}

	resetDetailsData() {
		const selectedRow = this.childComponentRef.data.find((item: any) => item.id == this.selectedRowValue.id);
		this.selectedRowValue = new ScheduledCommand().deserialize(selectedRow);
		this.selectedRowValue.isSelected = true;

		this.setCronExpressionDetails(this.selectedRowValue.cron_expression);
	}

	cancelClick() {
		const dialog = document.getElementById("cancelDialog") as Dialog;
		dialog.open = true;
	}

	closeDialogCancel() {
		const dialog = document.getElementById("cancelDialog") as Dialog;
		dialog.open = false;
	}

	handleSegmentedButtonClick($event: any) {
		this.isLoading = true;
		this.selectedRowValue = new ScheduledCommand().deserialize({});
		this.isEditMode = false;

		setTimeout(() => {
			this.showDetailsBody = true;
			this.detailsTitle = "Details";
			this.isLoading = false;
		}, 1500);
	}

	handleSearchClick($event: any) {
		this.isFiltering = true;
	}
}

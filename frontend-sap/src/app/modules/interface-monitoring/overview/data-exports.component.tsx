import { Component, ViewChild } from "@angular/core";
import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import JSONFormatter from "json-formatter-js";
import DataExport from "@app/shared/models/data-export.model";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import React from "react";
import { FlexBox, Icon, Text } from "@ui5/webcomponents-react";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-data-exports",
	templateUrl: "./data-exports.component.html",
	styleUrl: "./data-exports.component.css",
})
export class DataExportsComponent {
	@ViewChild("childComponentRef") childComponentRef!: CustomReactGridTable;

	selectedRowValue: DataExport = new DataExport().deserialize({});
	isLoading = false;
	warningForMarkASExported = false;
	isEditingPayload = false;
	localization = Localization;
	showDetailsBody: boolean = true;
	isFiltering: boolean = false;

	get canEdit() {
		return (
			this.selectedRowValue.id &&
			!this.selectedRowValue.is_exported &&
			this.authService.isPermissionValid(PermissionEnum.DATA_EXPORTS_EDIT)
		);
	}

	constructor(
		private commonService: CommonService,
		private authService: AuthService
	) {}

	columns: any = [
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			isSelected: true,
		},
		{
			Header: $localize`Exported`,
			accessor: "is_exported",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
		},
		{
			Header: $localize`Exporting`,
			accessor: "is_exporting",
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
		},
		{
			Header: $localize`Created`,
			accessor: "created_at",
			disableFilters: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.TimeStamp,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.created_at, false);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Last Exported`,
			accessor: "last_exported_at",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.TimeStamp,
			isSelected: true,
			hAlign: "Left",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.last_exported_at, false);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	processDataExportData(event: any): void {
		if (!this.isFiltering && this.selectedRowValue.id) this.checkSelectedDataId(this.selectedRowValue?.id);
		else {
			if (this.childComponentRef && this.childComponentRef?.data.length) {
				this.childComponentRef.selectedRowsId = { 0: true };
				this.selectedRowValue = new DataExport().deserialize(
					this.childComponentRef?.data[0]
				);
				this.resetJsonInputs();
				this.selectedRowValue.isSelected = true;
			}
			else {
				this.showDetailsBody = false;
			}
		}
		this.isFiltering = false;
	}

	checkSelectedDataId(id?: number) {
		if (id) {
			const index: number = this.childComponentRef?.data.findIndex(
				(item: any) => item.id == id
			);

			if (this.childComponentRef && this.childComponentRef?.data.length){
				this.childComponentRef.selectedRowsId = { [index]: true };
				this.selectedRowValue = new DataExport().deserialize(
					this.childComponentRef?.data[index]
				);
				this.selectedRowValue.isSelected = true;
				this.showDetailsBody = true;
			}
			else {
				this.showDetailsBody = false;
			}
		}
	}

	handleRowClick(event: any) {
		const selectedRow = event.detail.row.original;
		this.selectedRowValue = new DataExport().deserialize(selectedRow);
		
		this.selectedRowValue.isSelected = event.detail.isSelected;
		this.resetJsonInputs();
	}

	resetJsonInputs() {
		this.showJSONData(this.selectedRowValue.data, "data");
		this.showJSONData(this.selectedRowValue.result_message, "resultMessage");
		this.showJSONData(this.selectedRowValue.http_payload, "httpPayload");
		this.isEditingPayload = false;
	}

	showJSONData(data: any, fieldId: string) {
		const config = {
			hoverPreviewEnabled: true,
			hoverPreviewArrayCount: 1,
			theme: "",
			animateOpen: true,
			animateClose: true,
			hoverPreviewFieldCount: 5,
			useToJSON: true,
		};

		let formatted;

		try {
			const parsed = JSON.parse(data);

			formatted = new JSONFormatter(parsed, 1, config).render();
		} catch (e) {
			// Show the raw text if JSON parsing fails
			formatted = document.createTextNode(data);
		}

		const element = document.getElementById(fieldId)!;

		element.innerHTML = "";
		element.appendChild(formatted);
	}

	setPayloadEditable(isEditable: boolean) {
		const element = document.getElementById("httpPayload")!;

		if (isEditable) {
			element.innerHTML = "";
		} else {
			this.showJSONData(this.selectedRowValue.http_payload, "httpPayload");
		}
		this.isEditingPayload = isEditable;
	}

	async retry() {
		// Save any modifications before retrying
		await this.save();

		this.isLoading = true;

		this.commonService.post(`export/${this.selectedRowValue.id}`, null, false).subscribe({
			next: value => {
				this.isLoading = false;
				this.selectedRowValue.deserialize(value);
				this.resetJsonInputs();
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	save(): Promise<void> {
		this.isLoading = true;

		return new Promise<void>((resolve, reject) => {
			this.commonService
				.put(`DataExports(${this.selectedRowValue.id})`, this.selectedRowValue.toOdata())
				.subscribe({
					next: value => {
						this.isLoading = false;
						this.selectedRowValue.deserialize(value);
						this.resetJsonInputs();
						resolve();
					},
					error: () => {
						this.isLoading = false;
						reject();
					},
				});
		});
	}

	handleSearchClick($event: any) {
		this.isFiltering = true;
	}

	onMarkAsExportedOpen(){
		this.warningForMarkASExported = true;
	}

	onMarkAsExportedUpdate(){
		this.isLoading = true;

		const payload = {
			is_exported: true,
			result_message: 'Manually marked as exported'
		}

		this.commonService.patch(`DataExports(${this.selectedRowValue.id})`, payload).subscribe({
			next: value => {
				this.childComponentRef.onFilterAndSorting();

				this.isLoading = false;
				this.selectedRowValue.deserialize(value);
				this.resetJsonInputs();

				this.closeWarningForMarkASExportedDialog();
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}
	
	closeWarningForMarkASExportedDialog(){
		this.warningForMarkASExported = false;
	}
}

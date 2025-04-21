import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { FlexBox, Icon } from "@ui5/webcomponents-react";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import React from "react";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { AuthService } from "@app/shared/services/auth.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ColorPalette } from "@app/shared/enums/ColorPalette";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-sales-status",
	templateUrl: "./sales-status.component.html",
	styleUrl: "./sales-status.component.css",
})
export class SalesStatusComponent implements OnInit {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	selectedId = "";
	isDialogOpen: boolean = false;
	cachedCustomId?: string = "";
	isUpdate?: boolean;
	dialogTitle: string = "";
	customId?: string;
	isLoading: boolean = false;
	customIdState: keyof typeof ValueState = "None";
	selectedStateColor?: string = ColorPalette.BLACK;
	isLoadingCustomId: boolean = false;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("errorDialogSalesStatus", { static: false }) errorDialogSalesStatus: any;
	colorPaletteKeys = Object.values(ColorPalette);
	disableButtonDuringRequest: boolean = false;
	selectedSalesStatus: SalesStatus = new SalesStatus().deserialize({});
	localization = Localization;
	customIdValueStateText: string = Localization.invalidEntry;

	column: any = [
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: $localize`Show In Kanban`,
			accessor: "show_in_kanban",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			autoResizable: true,
		},
		{
			Header: $localize`Show In Sales Funnel`,
			accessor: "show_in_sales_funnel",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			autoResizable: true,
		},
		{
			Header: $localize`Sort Order`,
			accessor: "sort_order",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			autoResizable: true,
		},
		{
			Header: $localize`Color`,
			accessor: "color",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Color,
			autoResizable: true,
		},
	];

	constructor(
		private commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	ngOnInit(): void {
		this.getCustomId();
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	refreshEditData() {
		const url = `SalesStatuses?$filter=id eq ${this.selectedSalesStatus?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedSalesStatus?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `SalesStatuses(${this.selectedSalesStatus?.id})`
			: `SalesStatuses`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogSalesStatus.elementRef.nativeElement.open = true;
			},
		});
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedSalesStatus.custom_id?.trim();
		this.selectedSalesStatus.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		this.selectedSalesStatus = new SalesStatus().deserialize({});
		this.selectedSalesStatus.custom_id = this.customId;
		if (!this.customId) {
			this.selectedSalesStatus.custom_id = "";
			this.getCustomId();
		}
	}

	deleteClick(value: any) {
		this.selectedId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/SalesStatuses(${this.selectedId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedId, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.closeDialogDelete();
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogSalesStatus.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.dialogTitle = this.localization.edit;
		this.customIdState = "None";
		this.selectedSalesStatus = this.selectedSalesStatus?.deserialize(value);
		this.cachedCustomId = this.selectedSalesStatus.custom_id;
		this.disableButtonDuringRequest = false;
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedSalesStatus.custom_id || ""
		);
		const urlString = `SalesStatuses?$filter=custom_id eq '${this.selectedSalesStatus.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) this.onCreateOrUpdate();
					else {
						const { idIsAlreadyTaken } = Localization;
						this.disableButtonDuringRequest = false;
						this.customIdState = "Negative";
						this.customIdValueStateText = idIsAlreadyTaken;
					}
				},
				error: () => {
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		try {
			this.customId = await this.commonService.getEntity("SalesStatus");
			if (this.customId) {
				this.selectedSalesStatus.custom_id = this.customId;
			} else {
				this.selectedSalesStatus.custom_id = "";
			}
		} catch (error) {
			this.selectedSalesStatus.custom_id = "";
		} finally {
			this.isLoadingCustomId = false;
		}
	}

	closeResponsiveDialog() {
		this.popover.elementRef.nativeElement.open = false;
	}

	itemclicked(color: string): void {
		this.selectedStateColor = color;
		this.selectedSalesStatus.color = this.selectedStateColor;
	}

	openColorPicker() {
		this.popover.elementRef.nativeElement.open = true;
	}

	closeErrorDialog() {
		this.errorDialogSalesStatus.elementRef.nativeElement.open = false;
	}
}

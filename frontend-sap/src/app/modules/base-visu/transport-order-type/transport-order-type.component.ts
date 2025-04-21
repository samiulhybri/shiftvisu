import { Component, OnInit, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { TransportOrderType } from "@app/shared/models/transport-order-type";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-transport-order-type",
	templateUrl: "./transport-order-type.component.html",
	styleUrl: "./transport-order-type.component.css",
})
export class TransportOrderTypeComponent implements OnInit {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	selectedId = "";
	dialogTitle: string = "";
	isDialogOpen: boolean = false;
	localization = Localization;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	cachedCustomId?: string = "";
	customId?: string;
	isLoading: boolean = false;
	isLoadingCustomId: boolean = false;
	disableButtonDuringRequest: boolean = false;
	isUpdate?: boolean;
	customIdValueStateText: string = Localization.invalidEntry;
	selectTransportOrderType: TransportOrderType = new TransportOrderType().deserialize({});
	@ViewChild("errorDialogTransportOrderTypes", { static: false })
	errorDialogTransportOrderTypes: any;
	customIdState: keyof typeof ValueState = "None";

	column: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			maxWidth: 72,
			autoResizable: true,
		},
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
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
	];

	constructor(
		private commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
	) {}

	ngOnInit(): void {
		this.getCustomId();
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		this.selectTransportOrderType = new TransportOrderType().deserialize({});
		this.selectTransportOrderType.custom_id = this.customId;
		if (!this.customId) {
			this.selectTransportOrderType.custom_id = "";
			this.getCustomId();
		}
	}

	deleteClick(value: any) {
		this.selectedId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.dialogTitle = this.localization.edit;
		this.customIdState = "None";
		this.selectTransportOrderType = this.selectTransportOrderType?.deserialize(value);
		this.cachedCustomId = this.selectTransportOrderType.custom_id;
		this.disableButtonDuringRequest = false;
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `TransportOrderTypes?$filter=id eq ${this.selectTransportOrderType?.id}&$orderby=id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectTransportOrderType.custom_id?.trim();
		this.selectTransportOrderType.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectTransportOrderType?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `TransportOrderTypes(${this.selectTransportOrderType?.id})`
			: `TransportOrderTypes`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				this.isLoading = false;
				this.isDialogOpen = false;
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogTransportOrderTypes.elementRef.nativeElement.open = true;
			},
		});
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectTransportOrderType.custom_id || ""
		);
		const urlString = `TransportOrderTypes?$filter=custom_id eq '${this.selectTransportOrderType.custom_id}'&$select=custom_id`;
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

	async getCustomId() {
		this.isLoadingCustomId = true;
		try {
			this.customId = await this.commonService.getEntity("TransportOrderType");
			if (this.customId) {
				this.selectTransportOrderType.custom_id = this.customId;
			} else {
				this.selectTransportOrderType.custom_id = "";
			}
		} catch (error) {
			this.selectTransportOrderType.custom_id = "";
		} finally {
			this.isLoadingCustomId = false;
		}
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/TransportOrderTypes(${this.selectedId})`).subscribe({
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
				this.errorDialogTransportOrderTypes.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogTransportOrderTypes.elementRef.nativeElement.open = false;
	}
}

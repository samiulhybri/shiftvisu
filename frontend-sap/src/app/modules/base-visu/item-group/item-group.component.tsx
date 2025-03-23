import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import ItemGroup from "@app/shared/models/item-group.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-item-group",
	templateUrl: "./item-group.component.html",
	styleUrl: "./item-group.component.css",
})
export class ItemGroupComponent {
	isUpdateDialog = false;
	isDialogOpen: boolean = false;
	selectedRowValue = new ItemGroup().deserialize({});
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	itemGroupConfig: any = {};
	private lastClickTime: number = 0;
	private clickCount: number = 0;
	private singleClickTimeout: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("errorDialogItemGroups", { static: false }) errorDialogItemGroups: any;
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.itemGroupConfig = this.configService.getConfigValue("item_groups");
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Sort Order`,
			accessor: "sort_order",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];

	ngOnInit() {
		this.getCustomId();
	}

	deleteClick(value: any): void {
		this.selectedRowValue = new ItemGroup().deserialize(value);
		(document.getElementById("deleteDialogItemGroup") as Dialog).open = true;
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdateDialog = true;
		this.selectedRowValue = this.selectedRowValue?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedRowValue?.custom_id;
		this.disableButtonDuringRequest = false;
	}

	newButtonClick() {
		this.isUpdateDialog = false;
		this.isDialogOpen = true;
		this.dialogTitle = this.localization.add;
		this.selectedRowValue = new ItemGroup().deserialize({});
		this.selectedRowValue.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedRowValue.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ItemGroup").catch(() => false);
		this.selectedRowValue.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedRowValue.custom_id = "";
		this.isLoadingCustomId = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogItemGroups.elementRef.nativeElement.open = false;
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
		const customId = this.selectedRowValue.custom_id?.trim();
		this.selectedRowValue.custom_id = customId;

		if (this.isUpdateDialog) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedRowValue.custom_id || ""
		);
		const urlString = `ItemGroups?$filter=custom_id eq '${this.selectedRowValue.custom_id}'&$select=custom_id`;
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

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedRowValue?.toOdata();
		const method = this.isUpdateDialog ? "put" : "post";
		const urlString = this.isUpdateDialog
			? `ItemGroups(${this.selectedRowValue?.id})`
			: `ItemGroups`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				if (!this.isUpdateDialog) {
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
				this.errorDialogItemGroups.elementRef.nativeElement.open = true;
			},
		});
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
		const url = `ItemGroups?$filter=is_active eq true and id eq ${this.selectedRowValue?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/ItemGroups(${this.selectedRowValue.id})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				console.error(err);
				this.disableButtonDuringRequest = false;
				this.errorDialogItemGroups.elementRef.nativeElement.open = true;
				this.isLoading = false;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogItemGroup") as Dialog;
		dialog.open = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.itemGroupConfig && this.selectedRowValue) {
			return (
				this.itemGroupConfig[fieldName] === 0 && this.selectedRowValue.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}

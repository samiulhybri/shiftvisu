import { Component, ViewChild } from "@angular/core";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { CommonService } from "@app/shared/services/common.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import Toast from "@ui5/webcomponents/dist/Toast";
import { Hall } from "@app/shared/models/hall.model";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import ItemStateGroup from "@app/shared/models/item-state-group.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
@Component({
	selector: "app-item-state-group",
	templateUrl: "./item-state-group.component.html",
	styleUrl: "./item-state-group.component.css",
})
export class ItemStateGroupComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	selectedRowValue: any;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	selectedItemStateGroup: ItemStateGroup = new ItemStateGroup().deserialize({});
	@ViewChild("createOrUpdateForm") form?: NgForm;
	halls: Hall[] = [];
	@ViewChild("deleteErrorDialogItemStateGroup", { static: false })
	deleteErrorDialogItemStateGroup: any;
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	private lastClickTime: number = 0;
	private clickCount: number = 0;
	private singleClickTimeout: any;

	columns: any = [
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
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {
		this.selectedItemStateGroup = new ItemStateGroup().deserialize({});
	}

	ngOnInit(): void {
		this.getCustomId();
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdate = false;
		this.selectedRowValue = new ItemStateGroup().deserialize({});
		this.selectedItemStateGroup = new ItemStateGroup().deserialize({});
		this.selectedItemStateGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedItemStateGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
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
		const customId = this.selectedItemStateGroup.custom_id?.trim();
		this.selectedItemStateGroup.custom_id = customId;

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedItemStateGroup.custom_id || ""
		);
		const urlString = `ItemStateGroups?$filter=custom_id eq '${this.selectedItemStateGroup.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedItemStateGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `ItemStateGroups(${this.selectedItemStateGroup?.id})`
			: `ItemStateGroups`;
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
				this.selectedItemStateGroup = new ItemStateGroup().deserialize({});
				if (!this.isUpdate) this.getCustomId();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogItemStateGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ItemStateGroup").catch(() => false);
		this.selectedItemStateGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedItemStateGroup.custom_id = "";
		this.isLoadingCustomId = false;
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
		const url = `ItemStateGroups?$filter=is_active eq true and id eq ${this.selectedItemStateGroup?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	editClick(value: object): void {
		this.dialogTitle = this.localization.edit;
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedRowValue = this.selectedItemStateGroup?.deserialize(value);
		this.cachedCustomId = this.selectedItemStateGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogItemStateGroup") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/ItemStateGroups(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue, null);
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogItemStateGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogItemStateGroup") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogItemStateGroup.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onChangeName(event: any) {
		if (this.selectedItemStateGroup)
			this.selectedItemStateGroup.name = (event.target as any).value;
	}

	onChangeIsActive(event: any) {
		if (this.selectedItemStateGroup)
			this.selectedItemStateGroup.is_active = event.target.checked;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}
}

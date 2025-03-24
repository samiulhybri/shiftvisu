import { Component, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import {
	ProductionPlanningPageName,
	ProductionPlanningPageNameClass,
} from "@app/shared/enums/ProductionPlanningPageName";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Warehouse } from "@app/shared/models/warehouse.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-warehouse",
	templateUrl: "./warehouse.component.html",
	styleUrl: "./warehouse.component.css",
})
export class WarehouseComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	warehouseClass = new Warehouse();
	productionPlanningPageNameClass = new ProductionPlanningPageNameClass();
	productionPlanningPageNameItems = ProductionPlanningPageNameClass.getEnumArray();
	selectedWarehouse: Warehouse = new Warehouse().deserialize({});
	@ViewChild("errorDialogWarehouses", { static: false }) errorDialogWarehouses: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogWarehouse", { static: false })
	deleteErrorDialogWarehouse: any;
	public selectedTab: string = "core_data";

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
		private configService: ConfigService,
		public _toasterSrv: ToastService,
	) {
		this.selectedWarehouse = new Warehouse().deserialize({});
	}
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
	}

	getPageName(value: ProductionPlanningPageName) {
		return ProductionPlanningPageNameClass.getStateTranslate(value);
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedWarehouse = new Warehouse().deserialize({});
		this.selectedWarehouse.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedWarehouse.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedWarehouse.custom_id || ""
		);
		const urlString = `Warehouses?$filter=custom_id eq '${this.selectedWarehouse.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedWarehouse?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `Warehouses(${this.selectedWarehouse?.id})`
			: `Warehouses`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogWarehouses.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedWarehouse?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedWarehouse.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Warehouse").catch(() => false);
		this.selectedWarehouse.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedWarehouse.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async getDbAutoIncrementId() {
		this.commonService.getAutoIncrementId("Warehouses").subscribe(res => {
			this.autoIncrementId = res.value[0].id + 1;
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
		const url = `Warehouses?$filter=is_active eq true and id eq ${this.selectedWarehouse?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogWarehouse") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Warehouses(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedWarehouse, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogWarehouse.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogWarehouse") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogWarehouse.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeErrorDialog() {
		this.errorDialogWarehouses.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedWarehouse) this.selectedWarehouse.is_active = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedWarehouse) this.selectedWarehouse.name = (event.target as any).value;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.selectedTab = "core_data";
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedWarehouse.custom_id?.trim();
		this.selectedWarehouse.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}
}


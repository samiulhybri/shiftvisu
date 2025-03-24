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
import { StorageLocation } from "@app/shared/models/storage-location.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { Warehouse } from "@app/shared/models/warehouse.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { PlantsService } from "@app/shared/services/plants.service";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-storage-location",
	templateUrl: "./storage-location.component.html",
	styleUrl: "./storage-location.component.css",
})
export class StorageLocationComponent {
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
	disableButtonDuringRequest: boolean = false;
	public selectedTab: string = "core_data";
	productionPlanningPageNameClass = new ProductionPlanningPageNameClass();
	productionPlanningPageNameItems = ProductionPlanningPageNameClass.getEnumArray();
	selectedStorageLocation: StorageLocation = new StorageLocation().deserialize({});
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("errorDialogStorageLocations", { static: false }) errorDialogStorageLocations: any;
	@ViewChild("deleteErrorDialogStorageLocation", { static: false })
	deleteErrorDialogStorageLocation: any;
	wareHouses: Warehouse[] = [];
	plantId?: number;
	isLoadingBatchCall: boolean = false;

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
		{
			Header: $localize`Warehouse`,
			accessor: "warehouse.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["warehouse.name", "warehouse.custom_id"],
			isSelected: true,
			comboBoxValues: this.wareHouses,
			autoResizable: true,
		},
	];

	storageLocationClass = new StorageLocation();
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		plantService: PlantsService,
		public _toasterSrv: ToastService,
	) {
		this.selectedStorageLocation = new StorageLocation().deserialize({});
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
		this.loadData();
	}

	getPageName(value: ProductionPlanningPageName) {
		return ProductionPlanningPageNameClass.getStateTranslate(value);
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedStorageLocation = new StorageLocation().deserialize({});
		this.selectedStorageLocation.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedStorageLocation.custom_id = "";
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
			this.selectedStorageLocation.custom_id || ""
		);
		const urlString = `StorageLocations?$filter=custom_id eq '${this.selectedStorageLocation.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedStorageLocation?.toOdata() as any;
		payload.plant_id = this.plantId;
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `StorageLocations(${this.selectedStorageLocation?.id})`
			: `StorageLocations`;
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
				this.errorDialogStorageLocations.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedStorageLocation?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedStorageLocation.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("StorageLocation").catch(() => false);
		this.selectedStorageLocation.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedStorageLocation.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async getDbAutoIncrementId() {
		this.commonService.getAutoIncrementId("StorageLocations").subscribe(res => {
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
		const url = `StorageLocations?$filter=is_active eq true and plant_id eq ${this.plantId} and id eq ${this.selectedStorageLocation?.id}&$orderby=custom_id asc&$expand=warehouse`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogStorageLocation") as Dialog;
		dialog.open = true;
	}

	onChangeName(event: any) {
		if (this.selectedStorageLocation)
			this.selectedStorageLocation.name = (event.target as any).value;
	}

	onChangeWareHouse(event: any) {
		if (this.selectedStorageLocation)
			this.selectedStorageLocation.warehouse = new Warehouse().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onWareHousenputChange(event: any) {
		const inputValue = event.target.value;
		const matchWarehouseData = this.wareHouses.find(warehouse => warehouse.name === inputValue);
		if (!matchWarehouseData && this.selectedStorageLocation?.warehouse) {
			this.selectedStorageLocation.warehouse = new Warehouse().deserialize({
				id: null,
				name: "",
			});
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(new ODataBatchCall(0, "get", `\/odata\/Warehouses?$orderby=custom_id asc`));
		this.isLoadingBatchCall = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((warehouse: Warehouse) => {
					this.wareHouses?.push(new Warehouse().deserialize(warehouse));
				});
				this.isLoadingBatchCall = false;
			},
			error: e => {},
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/StorageLocations(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedStorageLocation, null);
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogStorageLocations.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogStorageLocation") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogStorageLocation.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeErrorDialog() {
		this.errorDialogStorageLocations.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedStorageLocation)
			this.selectedStorageLocation.is_active = event.target.checked;
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
		const customId = this.selectedStorageLocation.custom_id?.trim();
		this.selectedStorageLocation.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}
}

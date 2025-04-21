import { Component, ElementRef, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import OperationPlan from "@app/shared/models/operation-plan.model";
import Bom from "@app/shared/models/bom.model";
import ItemGroup from "@app/shared/models/item-group.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ToastService } from "@app/shared/services/toaster.service";
import { Button, Text } from "@ui5/webcomponents-react";
import React from "react";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { PlantsService } from "@app/shared/services/plants.service";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import ItemType from "@app/shared/models/item-type.model";
import { Customer } from "@app/shared/models/customer.model";
import { TruncatePipe } from "@app/shared/pipes/truncate.pipe";
import MultiComboBox from "@ui5/webcomponents/dist/MultiComboBox";

@Component({
	selector: "app-items",
	templateUrl: "./items.component.html",
	styleUrl: "./items.component.css",
})
export class ItemsComponent {
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("itemDetailsTab") itemDetailsTab!: ElementRef;
	@ViewChild("customerRef") customerRef: any;
	@ViewChild("itemAttachmentsTab") itemAttachmentsTab!: ElementRef;
	@ViewChild("itemGroupCombobox") itemGroupCombobox!: ComboBoxComponent;
	@ViewChild("deleteErrorDialogItems", { static: false })
	deleteErrorDialogItems: any;

	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	selectedItem: Item = new Item().deserialize({});
	operationPlan: OperationPlan[] = [];
	boms: Bom[] = [];
	itemGroups: ItemGroup[] = [];
	itemTypes: ItemType[] = [];
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	itemConfig?: any = {};
	public attachmentCount: number = 0;
	public isCancelClicked: boolean = false;
	public selectedTab: string = "item_details";
	public isAttachmentTabClicked: boolean = false;
	public checkForNewAttachments: boolean = false;
	public tempFiles: any = [];
	public deletedSavedFiles: any = [];
	public selectedStandardFile: any = {};
	disableButtonDuringRequest: boolean = false;
	isPreviewDialogOpen: boolean = false;
	public filePreviewHeight = 629;
	public fileCount: number = 0;
	public plantId: number = 0;
	url: string = "/Items";
	customers: Customer[] = [];
	selectedCustomer: any = [];
	truncatePipe = new TruncatePipe();

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		plantsService: PlantsService,
		public _toasterSrv: ToastService
	) {
		plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
				this.url = `/Plants(${plantId})/items`;
			}
		});
	}

	ngOnInit(): void {
		this.getCustomId();
		this.loadData();
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
			width: 50,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			minWidth: 50,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			minWidth: 50,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Item Group`,
			accessor: "itemGroup.custom_id",
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 50,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			accessorArray: ["itemGroup.name", "itemGroup.custom_id"],
			comboBoxValues: this.itemGroups,
			autoResizable: true,
		},
		{
			Header: $localize`Item Type`,
			accessor: "itemType.custom_id",
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 50,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			accessorArray: ["itemType.name", "itemType.custom_id"],
			comboBoxValues: this.itemTypes,
			autoResizable: true,
		},
		{
			Header: $localize`Sales Item`,
			accessor: "is_sales_item",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Alloy`,
			accessor: "is_alloy",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Packaging Item`,
			accessor: "is_packaging_item",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Attachment`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalAttachments: any[] = [];

				rowData.media.map((item: any) => {
					totalAttachments.push(item.id);
				});
				if (totalAttachments.length > 0) {
					return (
						<React.StrictMode>
							<Button
								icon="attachment"
								onClick={() => this.showPreview(rowData, totalAttachments.length)}>
								{totalAttachments.length + $localize` Files`}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Note`,
			accessor: "note",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Name 2`,
			accessor: "name2",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Name 3`,
			accessor: "name3",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Customer`,
			accessor: "customers.custom_id",
			minWidth: 50,
			isSelected: false,
			disableFilters: true,
			disableGroupBy: true,
			autoResizable: true,
			disableSortBy: true,
			accessorArray: ["customers.name", "customers.custom_id"],
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const customers = row.original.customers || [];
				const customerNames = customers.length > 0 ? customers.map((customer: any) => customer.name).join(", ") : "";
				const formattedName = this.truncatePipe.transform(customerNames, 50);
				return (
					<React.StrictMode>
						<Text>{formattedName}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Batch Quantity`,
			accessor: "batch_quantity",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];

	showPreview(attachments: any, totalFiles: number) {
		this.fileCount = totalFiles;
		this.selectedItem = this.selectedItem?.deserialize(attachments);
		this.isPreviewDialogOpen = true;
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
		this.selectedItem = this.selectedItem?.deserialize({});
	}

	deleteClick(value: any): void {
		this.selectedItem = new Item().deserialize(value);
		(document.getElementById("deleteDialogItem") as Dialog).open = true;
	}

	async setModalInitialState(): Promise<void> {
		this.customIdState = "None";
		this.tempFiles = [];
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		this.selectedTab = "item_details";
		const detailsTab = (this.itemDetailsTab as any).elementRef.nativeElement;
		const fileTab = (this.itemAttachmentsTab as any).elementRef.nativeElement;
		if (detailsTab) detailsTab.selected = true;
		if (fileTab) fileTab.selected = false;
		this.disableButtonDuringRequest = false;
		this.isDialogOpen = true;
	}

	async editClick(value: object): Promise<void> {
		await this.setModalInitialState();
		if (this.selectedItem?.itemGroup && this.itemGroupCombobox) {
			this.itemGroupCombobox.element.value = "";
		}
		this.isUpdate = true;
		this.selectedItem = this.selectedItem?.deserialize(value);
		if (this.selectedItem?.note == null) {
			this.selectedItem.note = "";
		}

		if(this.selectedItem?.name3 == null) this.selectedItem.name3 = "";
		if(this.selectedItem?.name2 == null) this.selectedItem.name2 = "";
		if(this.selectedItem?.batch_quantity == null) this.selectedItem.batch_quantity = 0;
		this.customerRef.elementRef.nativeElement.selectedValues = [];

		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedItem.custom_id;
		this.attachmentCount = this.selectedItem?.media ? this.selectedItem.media.length : 0;

		if (this.selectedItem?.customers && Array.isArray(this.selectedItem.customers)) {
			const selectedCustomerIds = this.selectedItem.customers.map((c: any) => c.id.toString());
	
			if (this.customerRef) {
				const comboBoxItems = this.customerRef.elementRef.nativeElement.items;

				for (let item of comboBoxItems) {
					if (selectedCustomerIds.includes(item.id)) {
						item.selected = true;
					} else {
						item.selected = false;
					}
				}
			}
		}
	}

	async newButtonClick() {
		await this.setModalInitialState();
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.attachmentCount = 0;
		this.selectedItem = new Item().deserialize({});
		this.selectedItem.custom_id = this.customId;
		const multiComboBox = document.getElementById("customerMultiSelect") as MultiComboBox;
		this.selectedCustomer = [];
		multiComboBox.items.forEach(item => item.selected = false);
		if (!this.customId) {
			this.selectedItem.custom_id = "";
			this.getCustomId();
		}
	}

	handleClose() {
		this.selectedItem = new Item().deserialize({});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Item").catch(() => false);
		this.selectedItem.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedItem.custom_id = "";
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
		const url = `Plants(${this.plantId})/items?$filter=id eq '${this.selectedItem.id}' and (is_tool ne true or is_tool eq null)&$orderby=custom_id%20asc&$expand=itemGroup,media,itemType,customers&$count=true`;
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

		this.commonService.delete(`/Items(${this.selectedItem.id})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedItem.id, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogItems.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogItem") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogItems.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		const customId = this.selectedItem.custom_id?.trim();
		this.selectedItem.custom_id = customId;
		if (!form.valid || !this.selectedItem.custom_id || !this.selectedItem.name) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "item_details";
			return;
		}

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedItem.custom_id || ""
		);
		const urlString = `Items?$filter=custom_id eq '${this.selectedItem.custom_id}'&$select=custom_id`;
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
		if (this.selectedItem.custom_id && this.selectedItem.name) {
			this.selectedItem.plant.id = this.plantId;

			const payload = this.selectedItem?.toOdata();
			const method = this.isUpdate ? "put" : "post";
			const urlString = this.isUpdate ? `Items(${this.selectedItem?.id})` : `Items`;
			this.commonService[method](urlString, payload).subscribe({
				next: async (response: any) => {
					const { recordSavedSuccessfully } = Localization;
					this.selectedItem = new Item().deserialize(response);
					this.selectedItem.plant.id = this.plantId;

					if (method == "post") await this.saveItemPlants();
					await this.saveItemCustomer();
					await this.saveItemAttachments();
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				},
				error: () => {
					const { failedToSaveData } = Localization;
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
					this._toasterSrv.showToast(failedToSaveData, "error");
				},
			});
		} else {
			this.isLoading = false;
			this.disableButtonDuringRequest = false;
			// error message for invalid form data
		}
	}

	afterSavingItem() {
		if (!this.isUpdate) {
			this.filterHandler();
		} else {
			this.refreshEditData();
		}
		this.isLoading = false;
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.isCancelClicked = false;
		this.tempFiles = [];
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		this.disableButtonDuringRequest = false;
	}

	async saveItemPlants() {
		this.isLoading = true;
		const payload = this.selectedItem.toOdataForItemPlant();

		this.commonService.post("ItemPlants", payload).subscribe({
			next: async (response: any) => {
				this.isLoading = false;
			},
			error: (err: any) => {
				this.isLoading = false;
			},
		});
	}

	async saveItemAttachments(): Promise<void> {
		try {
			this.isLoading = true;
			if (this.tempFiles && this.tempFiles.length > 0) await this.uploadTempFiles();
			if (this.deletedSavedFiles && this.deletedSavedFiles.length > 0)
				await this.deleteSavedAttachments();
			if (this.selectedStandardFile && this.selectedStandardFile.name)
				await this.setStandardImage();

			// this._toasterSrv.showToast($localize`Attachments uploaded successfully!`, 'success');
		} catch (error) {
			console.error("Error during file operations: ", error);
			// Notify user about the error
			// this._toasterSrv.showToast($localize`Failed to save attachment details!`, 'error');
		} finally {
			this.afterSavingItem();
		}
	}

	uploadTempFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			let count = 0;
			this.tempFiles.forEach((file: any, index: number) => {
				if (this.selectedItem) {
					const formData = new FormData();
					formData.append("id", this.selectedItem?.id + "");
					formData.append("model", "Item");
					formData.append("media", file);

					this.commonService.post("media/upload", formData, false).subscribe({
						next: (res: any) => {
							count++;
							this.attachmentCount++;
							if (count === this.tempFiles.length) resolve();
						},
						error: err => {
							count++;
							console.log("upload file error: ", err);
							if (count === this.tempFiles.length) reject(err);
						},
					});
				}
			});
		});
	}

	async setStandardImage(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.commonService
				.post(
					`media/update/${this.selectedStandardFile.id}`,
					this.selectedStandardFile,
					false
				)
				.subscribe({
					next: () => resolve(true),
					error: () => reject(false),
				});
		});
	}

	async deleteSavedAttachments(): Promise<boolean> {
		let count = 0;
		return new Promise((resolve, reject) => {
			this.deletedSavedFiles.forEach((file: any, index: number) => {
				this.commonService.delete(`media/${file.id}`, false).subscribe({
					next: () => {
						count++;
						if (count === this.deletedSavedFiles.length) resolve(true);
					},
					error: err => {
						count++;
						console.log("delete file error: ", err);
						if (count === this.deletedSavedFiles.length) resolve(err);
					},
				});
			});
		});
	}

	closeDialog() {
		this.isCancelClicked = true;
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.tempFiles = [];
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		this.customerRef.elementRef.nativeElement.selectedValues = [];
		this.selectedCustomer = [];
	}

	loadData() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(0, "get", `\/odata\/ItemGroups?$expand=topItem($select=custom_id)`)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/OperationPlans?$expand=topItem($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(2, "get", `\/odata\/Boms?$expand=topItem($select=custom_id)`)
		);
		
		requests.push(
			new ODataBatchCall(3, "get", `\/odata\/ItemTypes?$filter=is_active eq true`)
		);

		requests.push(
			new ODataBatchCall(4, "get", `\/odata\/Customers?$filter=is_active eq true&$top=1000`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.itemGroups = response.responses[0]?.body?.value?.map((data: ItemGroup) =>
					new ItemGroup().deserialize(data)
				);
				this.columns[3].comboBoxValues = this.itemGroups;
				
				this.itemTypes = response.responses[3]?.body?.value?.map((data: ItemType) =>
					new ItemType().deserialize(data)
				);
				this.columns[4].comboBoxValues = this.itemTypes;

				this.operationPlan = response.responses[1]?.body?.value?.map(
					(data: OperationPlan) => new OperationPlan().deserialize(data)
				);
				this.columns[5].comboBoxValues = this.operationPlan;

				this.boms = response.responses[2]?.body?.value?.map((data: Bom) =>
					new Bom().deserialize(data)
				);

				this.customers = response.responses[4]?.body?.value?.map(
					(data: Customer) => new Customer().deserialize(data)
				);
			},
			error: e => {},
		});
	}

	onChangeBom(event: any) {
		if (this.selectedItem)
			this.selectedItem.bom = new Bom().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onChangeOperationPlan(event: any) {
		if (this.selectedItem)
			this.selectedItem.operationPlan = new OperationPlan().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onChangeItemGroup(event: any) {
		if (this.selectedItem)
			this.selectedItem.itemGroup = new ItemGroup().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}
	
	onChangeItemType(event: any) {
		if (this.selectedItem)
			this.selectedItem.itemType = new ItemType().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchItemGroupData = this.itemGroups.find(itemGroup => itemGroup.name === inputValue);
		if (!matchItemGroupData && this.selectedItem?.itemGroup) {
			this.selectedItem.itemGroup = new ItemGroup().deserialize({
				id: null,
				name: "",
			});
		}
	}
	
	onInputItemTypeChange(event: any) {
		const inputValue = event.target.value;
		const matchItemTypeData = this.itemTypes.find(itemType => itemType.name === inputValue);
		if (!matchItemTypeData && this.selectedItem) {
			this.selectedItem.itemType = new ItemType().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.itemConfig && this.selectedItem) {
			return this.itemConfig[fieldName] === 0 && this.selectedItem.is_imported_from_erp;
		} else {
			return false;
		}
	}

	onAttachmentChanges(data: any, type: string) {
		switch (type) {
			case "fileCount":
				this.attachmentCount = data;
				break;
			case "onUpload":
				this.tempFiles = data;
				break;
			case "onDelete":
				this.deletedSavedFiles = data;
				break;
			case "onStandardSelect":
				this.selectedStandardFile = data;
				break;
			default:
				break;
		}
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		if (this.selectedTab == "item_attachments") this.isAttachmentTabClicked = true;
	}

	customerSelection(event: any) {
		this.selectedCustomer = event.srcElement.selectedValues.map(
            (el: any) => +el.id
        ) as number[];
	}

	async saveItemCustomer() {
		this.isLoading = true;
		const payload = {
			customers: this.selectedCustomer
		};
		this.commonService.post(`items/update-customers-for-item/${this.selectedItem.id}`, payload, false).subscribe({
			next: (res: any) => {
				this.isLoading = false;
			},
			error: err => {
				this.isLoading = false;
			},
		});
	}
}

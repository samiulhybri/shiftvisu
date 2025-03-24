import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { StandardValueKey } from "@app/shared/models/standardValueKey.model";
import { StandardValueKeyActivityType } from "@app/shared/models/StandardValueKeyActivityType.model";
import React from "react";
import { FlexBox, Icon } from "@ui5/webcomponents-react";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-standard-value-key",
	templateUrl: "./standard-value-key.component.html",
	styleUrl: "./standard-value-key.component.css",
})
export class StandardValueKeyComponent {
	deleteItemId = "";
	isUpdate?: boolean;
	customId?: string;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	isLoadingCustomId: boolean = false;
	dialogTitle: string = "";
	customIdState: keyof typeof ValueState = "None";
	cachedCustomId?: string = "";
	standardValueKey: StandardValueKey = new StandardValueKey().deserialize({});
	standardValueKeyActivityType: StandardValueKeyActivityType =
		new StandardValueKeyActivityType().deserialize({});
	disableButtonDuringRequest: boolean = false;
	isAssociateDialogOpen: boolean = false;
	isAssociateCreate: boolean = false;
	standardValueKeyActivityTypeClone: StandardValueKeyActivityType | undefined;
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	public selectedTab: string = "generalTab";
	associateDialogTitle: string = $localize`Create Activity Type`;
	@ViewChild("generalTab") generalTab!: ElementRef;
	@ViewChild("standardValueKeyActivityTypesTab") standardValueKeyActivityTypesTab!: ElementRef;
	@ViewChild("popover", { static: false }) popover: any;

	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	standardValueKeyActivityTypes: StandardValueKeyActivityType[] = [];
	deletedActivityTypes: number[] = [];

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
	];

	showPreview(data: any) {
		this.filterHandler();
	}

	standardValueKeyActivityTypeColumns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
			autoResizable: true,
			Cell: (instance: { row: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={rowData[`is_active`] ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: this.localization.id,
			accessor: "standardValueKey.custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: $localize`Pos`,
			accessor: "pos",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Clock in enabled`,
			accessor: "is_clockin_enabled",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
			autoResizable: true,
			Cell: (instance: { row: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={rowData[`is_clockin_enabled`] ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("SVKActivityTypesChildComponentRef", { static: false })
	SVKActivityTypesChildComponentRef: CustomReactGridTable | undefined;

	@ViewChild("deleteDialogSVK", { static: false }) deleteDialogSVK: any;
	@ViewChild("errorDialogSVK", { static: false }) errorDialogSVK: any;
	@ViewChild("deleteToastTools", { static: false }) deleteToastTools: any;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
		public handleRowClickService: HandleRowClickService
	) {}

	ngOnInit() {
		this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("StandardValueKey").catch(() => false);
		this.standardValueKey.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.standardValueKey.custom_id = "";
		this.isLoadingCustomId = false;
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	async newButtonClick() {
		this.setTabInitialState();
		this.isUpdate = false;
		this.standardValueKey = new StandardValueKey().deserialize({});
		this.standardValueKeyActivityTypes = [];
		this.customIdState = "None";
		this.selectedTab = "generalTab";
		this.dialogTitle = this.localization.add;
		this.standardValueKey.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.standardValueKey.custom_id = "";
			this.getCustomId();
		}
		
		if (this.SVKActivityTypesChildComponentRef) this.SVKActivityTypesChildComponentRef.filteredDataCount = 0;
		this.SVKActivityTypesChildComponentRef?.render();
		this.isDialogOpen = true;
	}

	deleteClick(value: any) {
		this.deleteItemId = value.id;
		this.deleteDialogSVK.elementRef.nativeElement.open = true;
	}

	associateButtonClick() {
		this.isAssociateDialogOpen = true;
		this.isAssociateCreate = true;
		this.associateDialogTitle = $localize`Create Activity Type`;
	}

	editClick(value: any) {
		this.dialogTitle = this.localization.edit;
		this.standardValueKey = new StandardValueKey().deserialize(value);
		this.isUpdate = true;
		this.cachedCustomId = this.standardValueKey.custom_id;
		this.customIdState = "None";
		this.selectedTab = "generalTab";
		this.disableButtonDuringRequest = false;
		this.standardValueKeyActivityTypes =
			structuredClone(this.standardValueKey.standardValueKeyActivityTypes) || [];
		this.setTabInitialState();
		if (this.SVKActivityTypesChildComponentRef) this.SVKActivityTypesChildComponentRef.filteredDataCount = this.standardValueKeyActivityTypes.length;
		this.SVKActivityTypesChildComponentRef?.render();
		this.isDialogOpen = true;
	}

	editActivityTypes(value: any) {
		this.standardValueKeyActivityType = value;
		this.standardValueKeyActivityTypeClone = structuredClone(value);
		this.isAssociateDialogOpen = true;
		this.isAssociateCreate = false;
		this.associateDialogTitle = $localize`Edit Activity Type`;
	}

	cancelDialog() {
		// reset the changes
		this.standardValueKeyActivityType.is_active =
			this.standardValueKeyActivityTypeClone?.is_active;
		this.standardValueKeyActivityType.pos = this.standardValueKeyActivityTypeClone?.pos;
		this.standardValueKeyActivityType.is_clockin_enabled =
			this.standardValueKeyActivityTypeClone?.is_clockin_enabled;

		this.standardValueKeyActivityType = new StandardValueKeyActivityType().deserialize({});
		this.isAssociateDialogOpen = false;

		this.SVKActivityTypesChildComponentRef?.render();
	}

	onSVKActiveTypeSave() {
		this.standardValueKeyActivityType.standardValueKey = this.standardValueKey;
		if (this.isAssociateCreate) {
			this.standardValueKeyActivityTypes.push(
				structuredClone(this.standardValueKeyActivityType)
			);
		}
		this.isAssociateDialogOpen = false;
		this.standardValueKeyActivityType = new StandardValueKeyActivityType().deserialize({});
		if (this.SVKActivityTypesChildComponentRef) this.SVKActivityTypesChildComponentRef.filteredDataCount = this.standardValueKeyActivityTypes.length;
		this.SVKActivityTypesChildComponentRef?.render();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		const customId = this.standardValueKey.custom_id?.trim();
		this.standardValueKey.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.standardValueKey.custom_id || ""
		);
		const urlString = `StandardValueKeys?$filter=custom_id eq '${this.standardValueKey.custom_id}'&$select=custom_id`;
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
			this.selectedTab = "generalTab";
		}
	}

	onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.standardValueKey?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `StandardValueKeys(${this.standardValueKey?.id})`
			: `StandardValueKeys`;

		this.commonService[method](urlString, payload).subscribe({
			next: res => {
				const { recordSavedSuccessfully } = Localization;
				this.standardValueKey = new StandardValueKey().deserialize(res);
				let errorResponseCount = 0;
				this.syncSVKToSKVActivityTypes().then((res: any) => {
					res.responses?.map((res: any) => {
						if (res.status == 500) errorResponseCount++;
					});

					if (!this.isUpdate) {
						this.filterHandler();
					} else {
						this.refreshEditData();
					}
					this.isLoading = false;
					this.isDialogOpen = false;
					this.disableButtonDuringRequest = false;

					if (!errorResponseCount) {
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");
					} else {
						this.errorDialogSVK.elementRef.nativeElement.open = true;
					}
				});
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogSVK.elementRef.nativeElement.open = true;
			},
		});
	}

	syncSVKToSKVActivityTypes() {
		let requests: ODataBatchCall[] = [];
		let currentIndex = 0;

		this.deletedActivityTypes?.forEach((activityTypeId: number) => {
			const batchCall = new ODataBatchCall(
				currentIndex,
				"delete",
				`\/odata\/StandardValueKeyActivityTypes(${activityTypeId})`
			);

			requests.push(batchCall);
			currentIndex++;
		});

		this.standardValueKeyActivityTypes.forEach((activityType: StandardValueKeyActivityType) => {
			if (activityType.id) {
				activityType.standardValueKey = this.standardValueKey;
				const payload = new StandardValueKeyActivityType()
					.deserialize(activityType)
					.toOdata();

				const batchCall = new ODataBatchCall(
					currentIndex,
					"PUT",
					`\/odata\/StandardValueKeyActivityTypes(${activityType.id})`
				);
				batchCall.body = payload;

				requests.push(batchCall);
				currentIndex++;
			} else {
				activityType.standardValueKey = this.standardValueKey;

				const payload = new StandardValueKeyActivityType()
					.deserialize(activityType)
					.toOdata();

				const batchCall = new ODataBatchCall(
					currentIndex,
					"POST",
					`\/odata\/StandardValueKeyActivityTypes`
				);
				batchCall.body = payload;

				requests.push(batchCall);
				currentIndex++;
			}
		});

		return new Promise((resolve, reject) => {
			try {
				this.commonService.post("$batch", { requests }).subscribe({
					next: response => {
						resolve(response);
					},
					error: error => {
						console.log(error);
					},
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	deleteActivityTypes(value: any) {
		if (value.standard_value_key_id) {
			this.deletedActivityTypes.push(value.id);

			this.standardValueKeyActivityTypes = this.standardValueKeyActivityTypes.filter(
				(activityType: any) =>
					!(
						activityType.pos === value.pos &&
						activityType.standard_value_key_id === value.standard_value_key_id
					)
			);
		} else {
			this.standardValueKeyActivityTypes = this.standardValueKeyActivityTypes.filter(
				(activityType: any) =>
					!(activityType.pos === value.pos && !activityType.standard_value_key_id)
			);
		}
		if (this.SVKActivityTypesChildComponentRef) this.SVKActivityTypesChildComponentRef.filteredDataCount = this.standardValueKeyActivityTypes.length;
		this.SVKActivityTypesChildComponentRef?.render();
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/StandardValueKeys(${this.deleteItemId})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.childComponent?.onFilterAndSortingForEdit(this.standardValueKey, null);
				this.isLoading = false;
				this.closeDialogDelete();
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.closeDialogDelete();
				this.errorDialogSVK.elementRef.nativeElement.open = true;
			},
		});
	}

	async setTabInitialState(): Promise<void> {
		this.selectedTab = "generalTab";
		const detailsTab = (this.generalTab as any)?.elementRef?.nativeElement;
		const fileTab = (this.standardValueKeyActivityTypesTab as any)?.elementRef?.nativeElement;
		detailsTab.selected = true;
		fileTab.selected = false;
		if (this.SVKActivityTypesChildComponentRef) this.SVKActivityTypesChildComponentRef.filteredDataCount = this.standardValueKeyActivityTypes.length;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogSVK.elementRef.nativeElement.open = false;
	}

	closeDialogDelete() {
		this.deleteDialogSVK.elementRef.nativeElement.open = false;
	}

	filterHandler(fieldName: string = "", value: string = "", filterOperator: string = "Contain") {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `StandardValueKeys?$filter=is_active eq true and id eq ${this.standardValueKey?.id}&$orderby=custom_id asc&$expand=standardValueKeyActivityTypes($expand=standardValueKey)`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	onSearchOnChangeInput(value: any) {
		const foundArray = this.deepSearch(this.standardValueKeyActivityTypes, value)
		this.SVKActivityTypesChildComponentRef!.filteredDataCount = foundArray.length;
	}

	deepSearch(arr: any, searchString: string) {
		return arr.filter((item: any) => this.searchObject(item, searchString));
	}

	searchObject(obj: any, searchString: string): boolean {
		return Object.values(obj).some(value =>
			typeof value === 'object' && value !== null
				? this.searchObject(value, searchString)
				: typeof value === 'string' && value.includes(searchString)
		);
	}
}

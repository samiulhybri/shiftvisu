import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-market-segments",
	templateUrl: "./market-segments.component.html",
	styleUrl: "./market-segments.component.css",
})
export class MarketSegmentsComponent implements OnInit {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	localization = Localization;
	isLoading: boolean = false;
	disableButtonDuringRequest: boolean = false;
	isDialogOpen: boolean = false;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	customIdValueStateText: string = Localization.invalidEntry;
	customIdState: keyof typeof ValueState = "None";
	dialogTitle: string = "";
	isLoadingCustomId: boolean = false;
	isUpdate?: boolean;
	selectedMarketSegments: MarketSegment = new MarketSegment().deserialize({});
	cachedCustomId?: string = "";
	selectedId = "";
	customId?: string;
	@ViewChild("errorDialogMarketSegments", { static: false }) errorDialogMarketSegments: any;

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
	];

	constructor(
		private commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
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
		this.selectedMarketSegments = new MarketSegment().deserialize({});
		this.selectedMarketSegments.custom_id = this.customId;
		if (!this.customId) {
			this.selectedMarketSegments.custom_id = "";
			this.getCustomId();
		}
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.dialogTitle = this.localization.edit;
		this.customIdState = "None";
		this.selectedMarketSegments = this.selectedMarketSegments?.deserialize(value);
		this.cachedCustomId = this.selectedMarketSegments.custom_id;
		this.disableButtonDuringRequest = false;
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedMarketSegments.custom_id?.trim();
		this.selectedMarketSegments.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
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
		this.commonService.delete(`/MarketSegments(${this.selectedId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedMarketSegments, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.closeDialogDelete();
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogMarketSegments.elementRef.nativeElement.open = true;
			},
		});
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedMarketSegments?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `MarketSegments(${this.selectedMarketSegments?.id})`
			: `MarketSegments`;
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
				this.errorDialogMarketSegments.elementRef.nativeElement.open = true;
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
		const url = `MarketSegments?$filter=is_active eq true and id eq ${this.selectedMarketSegments?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		try {
			this.customId = await this.commonService.getEntity("MarketSegments");
			if (this.customId) {
				this.selectedMarketSegments.custom_id = this.customId;
			} else {
				this.selectedMarketSegments.custom_id = "";
			}
		} catch (error) {
			this.selectedMarketSegments.custom_id = "";
		} finally {
			this.isLoadingCustomId = false;
		}
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogMarketSegments.elementRef.nativeElement.open = false;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedMarketSegments.custom_id || ""
		);
		const urlString = `MarketSegments?$filter=custom_id eq '${this.selectedMarketSegments.custom_id}'&$select=custom_id`;
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
}

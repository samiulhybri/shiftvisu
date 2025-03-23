import { Component, OnInit, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-potential-classification",
	templateUrl: "./potential-classification.component.html",
	styleUrl: "./potential-classification.component.css",
})
export class PotentialClassificationComponent implements OnInit {
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
	selectedPotentialClassifications: PotentialClassification =
		new PotentialClassification().deserialize({});
	@ViewChild("errorDialogPotentialClassifications", { static: false })
	errorDialogPotentialClassifications: any;
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
		this.selectedPotentialClassifications = new PotentialClassification().deserialize({});
		this.selectedPotentialClassifications.custom_id = this.customId;
		if (!this.customId) {
			this.selectedPotentialClassifications.custom_id = "";
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
		this.selectedPotentialClassifications =
			this.selectedPotentialClassifications?.deserialize(value);
		this.cachedCustomId = this.selectedPotentialClassifications.custom_id;
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
		const url = `PotentialClassifications?$filter=is_activ eq true and id eq ${this.selectedPotentialClassifications?.id}`;
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
		const customId = this.selectedPotentialClassifications.custom_id?.trim();
		this.selectedPotentialClassifications.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedPotentialClassifications?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `PotentialClassifications(${this.selectedPotentialClassifications?.id})`
			: `PotentialClassifications`;
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
				this.errorDialogPotentialClassifications.elementRef.nativeElement.open = true;
			},
		});
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedPotentialClassifications.custom_id || ""
		);
		const urlString = `PotentialClassifications?$filter=custom_id eq '${this.selectedPotentialClassifications.custom_id}'&$select=custom_id`;
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
			this.customId = await this.commonService.getEntity("PotentialClassification");
			if (this.customId) {
				this.selectedPotentialClassifications.custom_id = this.customId;
			} else {
				this.selectedPotentialClassifications.custom_id = "";
			}
		} catch (error) {
			this.selectedPotentialClassifications.custom_id = "";
		} finally {
			this.isLoadingCustomId = false;
		}
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`PotentialClassifications(${this.selectedId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedPotentialClassifications, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.closeDialogDelete();
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogPotentialClassifications.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogPotentialClassifications.elementRef.nativeElement.open = false;
	}
}

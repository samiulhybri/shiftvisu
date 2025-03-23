import { Component, ViewChild } from "@angular/core";
import { Localization } from "@app/shared/utils/common-localize";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ColorScheme } from "@app/shared/models/color-scheme.model";
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
	selector: "app-color-scheme",
	templateUrl: "./color-scheme.component.html",
	styleUrl: "./color-scheme.component.css",
})
export class ColorSchemeComponent {
	disableButtonDuringRequest: boolean = false;
	isUpdateDialog?: boolean;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	dialogTitle: string = "";
	deletItemId = "";
	isUpdate?: boolean;
	localization = Localization;
	customIdState: keyof typeof ValueState = "None";
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	customId?: string;
	selectedColorScheme: ColorScheme = new ColorScheme().deserialize({});
	customIdValueStateText: string = Localization.idIsRequired;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("errorDialogColorSchemes", { static: false }) errorDialogColorSchemes: any;
	@ViewChild("deleteErrorDialogColorSchemes", { static: false })
	deleteErrorDialogColorSchemes: any;

	columns: any = [
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

	constructor(
		public commonService: CommonService,
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

	ngOnInit() {};

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedColorScheme = new ColorScheme().deserialize({});
		this.selectedColorScheme.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedColorScheme.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}
	onChangeCustomId() {
		this.customIdState = "None";
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedColorScheme?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedColorScheme.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedColorScheme.custom_id?.trim();
		this.selectedColorScheme.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ColorScheme").catch(() => false);
		this.selectedColorScheme.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedColorScheme.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedColorScheme?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `PlanVisuColorSchemes(${this.selectedColorScheme?.id})`
			: `PlanVisuColorSchemes`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				this.filterHandler();
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;

				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogColorSchemes.elementRef.nativeElement.open = true;
			},
		});
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedColorScheme.custom_id || ""
		);
		const urlString = `PlanVisuColorSchemes?$filter=custom_id eq '${this.selectedColorScheme.custom_id}'&$select=custom_id`;
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

	closeErrorDialog() {
		this.errorDialogColorSchemes.elementRef.nativeElement.open = false;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/PlanVisuColorSchemes(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.filterHandler();
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogColorSchemes.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogColorSchemes") as Dialog;
		dialog.open = true;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogColorSchemes") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogColorSchemes.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}
}

import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { EnergyConsumerGroup } from "@app/shared/models/energy-consumer-group.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
	selector: "app-energy-consumer-groups",
	templateUrl: "./energy-consumer-groups.component.html",
	styleUrl: "./energy-consumer-groups.component.css",
})
export class EnergyConsumerGroupsComponent implements OnInit {
	energyConsumerGroupsModel = EnergyConsumerGroup;
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
	selectedEnergyConsumerGroup: EnergyConsumerGroup = new EnergyConsumerGroup().deserialize({});
	@ViewChild("errorDialogEnergyConsumerGroups", { static: false })
	errorDialogEnergyConsumerGroups: any;
	customIdValueStateText: string = Localization.invalidEntry;
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
		this.selectedEnergyConsumerGroup = new EnergyConsumerGroup().deserialize({});
		this.selectedEnergyConsumerGroup.custom_id = this.customId;
		if (!this.customId) {
			this.selectedEnergyConsumerGroup.custom_id = "";
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
		this.selectedEnergyConsumerGroup = this.selectedEnergyConsumerGroup?.deserialize(value);
		this.cachedCustomId = this.selectedEnergyConsumerGroup.custom_id;
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
		const url = `EnergyConsumerGroups?$filter=is_active eq true and id eq ${this.selectedEnergyConsumerGroup?.id}`;
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
		const customId = this.selectedEnergyConsumerGroup.custom_id?.trim();
		this.selectedEnergyConsumerGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedEnergyConsumerGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `EnergyConsumerGroups(${this.selectedEnergyConsumerGroup?.id})`
			: `EnergyConsumerGroups`;
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
				this.errorDialogEnergyConsumerGroups.elementRef.nativeElement.open = true;
			},
		});
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedEnergyConsumerGroup.custom_id || ""
		);
		const urlString = `EnergyConsumerGroups?$filter=custom_id eq '${this.selectedEnergyConsumerGroup.custom_id}'&$select=custom_id`;
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
			this.customId = await this.commonService.getEntity("EnergyConsumerGroups");
			if (this.customId) {
				this.selectedEnergyConsumerGroup.custom_id = this.customId;
			} else {
				this.selectedEnergyConsumerGroup.custom_id = "";
			}
		} catch (error) {
			this.selectedEnergyConsumerGroup.custom_id = "";
		} finally {
			this.isLoadingCustomId = false;
		}
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/EnergyConsumerGroups(${this.selectedId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedEnergyConsumerGroup, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.closeDialogDelete();
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogEnergyConsumerGroups.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogEnergyConsumerGroups.elementRef.nativeElement.open = false;
	}
}

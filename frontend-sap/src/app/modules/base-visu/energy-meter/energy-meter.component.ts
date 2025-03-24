import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { EnergyType, EnergyTypeClass } from '@app/shared/enums/energy-type.enum';
import { EnergyConsumer } from '@app/shared/models/energy-consumer.model';
import { EnergyMeter } from '@app/shared/models/energy-meter.model';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';
import { HandleRowClickService } from '@app/shared/services/handle-row-click.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import { ComboBoxComponent } from '@ui5/webcomponents-ngx';
import Dialog from '@ui5/webcomponents/dist/Dialog';

@Component({
	selector: "app-energy-meter",
	templateUrl: "./energy-meter.component.html",
	styleUrl: "./energy-meter.component.css",
})
export class EnergyMeterComponent {
	energyMeterModel = EnergyMeter;
	localization = Localization;
	isUpdate?: boolean;
	isLoading: boolean = false;
	isDialogOpen: boolean = false;
	disableButtonDuringRequest: boolean = false;
	selectedRowValue: any;
	selectedEnergyMeter: EnergyMeter = new EnergyMeter().deserialize({});
	dialogTitle: string = "";
	customId?: string;
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	energyTypeItems = EnergyTypeClass.getEnergyType();
	isLoadingBatchCall: boolean = false;
	energyConsumers: EnergyConsumer[] = [];
	deletItemId = "";
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	private clickCount: number = 0;
	private singleClickTimeout: any;
	private lastClickTime: number = 0;

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("errorDialogEnergyMeter", { static: false }) errorDialogEnergyMeter: any;
	@ViewChild("energy_type") energy_type!: ComboBoxComponent;
	@ViewChild("energyMeterCombobox") energyMeterCombobox!: ComboBoxComponent;
	@ViewChild("createOrUpdateForm") form?: NgForm;

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
			disableFilters: true,
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
			Header: $localize`Energy Type`,
			accessor: "energy_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.energyTypeItems,
			autoResizable: true,
		},
		{
			Header: $localize`Energy Consumer`,
			accessor: "energyConsumer.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["energyConsumer.name", "energyConsumer.custom_id"],
			comboBoxValues: this.energyConsumers,
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
		public handleRowClickService: HandleRowClickService
	) {
		this.selectedEnergyMeter = new EnergyMeter().deserialize({});
	}

	ngOnInit(): void {
		this.loadData();
		this.getCustomId();
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
		const url = `EnergyMeters?$filter=is_active eq true and id eq ${this.selectedRowValue?.id}&$expand=energyConsumer`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
				const index = this.childComponent?.data.findIndex((data: any) => data.id === response?.value[0].id);
				this.childComponent!.data[index] = new EnergyMeter().deserialize(
					this.childComponent!.data[index]
				);
			}
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("EnergyMeter").catch(() => false);
		this.selectedEnergyMeter.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedEnergyMeter.custom_id = "";
		this.isLoadingCustomId = false;
	}

	inputEntryRestrict(event: any, value: any) {
		if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeTypes(event: any) {
		this.selectedEnergyMeter.energy_type = event.detail.item.text || EnergyType.GAS;

		if (this.energy_type && this.selectedEnergyMeter.energy_type) {
			this.energy_type.element.valueState = "None";
		}
	}

	onEnergyTypeInputChange(event: any) {
		const inputValue = event.target.value;
		const matchEnergyTypeData = this.energyTypeItems.find(
			(item: { text: any }) => item.text === inputValue
		);
		if (!matchEnergyTypeData && this.selectedEnergyMeter?.energy_type) {
			this.selectedEnergyMeter.energy_type = "";
		} else {
			this.selectedEnergyMeter.energy_type = inputValue;
			this.energy_type.element.valueState = "None";
		}
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchenergyConsumerData = this.energyConsumers.find(data => data.name === inputValue);
		if (!matchenergyConsumerData && this.selectedEnergyMeter?.energyConsumer) {
			this.selectedEnergyMeter.energyConsumer = new EnergyConsumer().deserialize({
				id: null,
				name: "",
			});
		}
	}

	checkRequiredComboboxes(): boolean {
		if (!this.energyMeterCombobox.element.value) {
			this.energyMeterCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.energyMeterCombobox.element.valueState = "None";
		}
		if (!this.energy_type.element.value) {
			this.energy_type.element.valueState = "Negative";
			return false;
		} else {
			this.energy_type.element.valueState = "None";
		}
		return true;
	}

	onChangEnergyConsumer(event: any) {
		this.energyMeterCombobox.element.valueState = "None";
		if (this.selectedEnergyMeter?.energyConsumer)
			this.selectedEnergyMeter.energyConsumer = new EnergyConsumer().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
			const id = event.target.id;
			switch (id) {
				case "energyMeterCombobox":
					this.selectedEnergyMeter.energyConsumer = new EnergyConsumer().deserialize({
						id: null,
					});
					break;
				default:
					break;
			}
		} else {
			event.target.value = value;
		}
	}

	loadData() {
		this.commonService.get("EnergyConsumers").subscribe((energyConsumers: any) => {
			energyConsumers.value.map((energyConsumer: EnergyConsumer) => {
				this.energyConsumers.push(new EnergyConsumer().deserialize(energyConsumer));
			});
			this.columns[2].comboBoxValues = this.energyConsumers;
		});
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedEnergyMeter = new EnergyMeter().deserialize({});
		this.selectedEnergyMeter.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedEnergyMeter.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		this.checkRequiredComboboxes();
		if (!form.valid || !this.checkRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedEnergyMeter.custom_id?.trim();
		this.selectedEnergyMeter.custom_id = customId;
		if (this.isUpdate) {
			if (this.cachedCustomId === customId) {
				this.onCreateOrUpdate();
			} else this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedEnergyMeter.custom_id || ""
		);
		const urlString = `EnergyMeters?$filter=custom_id eq '${this.selectedEnergyMeter.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedEnergyMeter?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `EnergyMeters(${this.selectedEnergyMeter?.id})`
			: `EnergyMeters`;
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
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogEnergyMeter.elementRef.nativeElement.open = true;
			},
		});
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	editClick(value: any) {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedRowValue = this.selectedEnergyMeter?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedEnergyMeter.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}


	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/EnergyMeters(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.errorDialogEnergyMeter.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogEnergyMeter") as Dialog;
		dialog.open = true;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogEnergyMeter") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogEnergyMeter.elementRef.nativeElement.open = false;
	}

	closeDialog() {
		(this.form as any).onReset();
		this.energyMeterCombobox.element.valueState = "None";
		this.energy_type.element.valueState = "None";
		this.isDialogOpen = false;
	}
}

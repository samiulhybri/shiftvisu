import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { EnergyConsumerGroup } from "@app/shared/models/energy-consumer-group.model";
import { EnergyConsumer } from "@app/shared/models/energy-consumer.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ConfigService } from "@app/shared/services/config.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
@Component({
	selector: "app-energy-consumer",
	templateUrl: "./energy-consumer.component.html",
	styleUrl: "./energy-consumer.component.css",
})
export class EnergyConsumerComponent {
	isLoading: boolean = false;
	selectedRowValue: any;
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	value!: string;
	deletItemId = "";
	autoIncrementId!: string;
	dialogTitle: string = "";
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	isUpdate?: boolean;
	customId?: string;
	cachedCustomId?: string = "";
	selectedEnergyConsumer: EnergyConsumer = new EnergyConsumer().deserialize({});
	energyConsumerGroups: EnergyConsumerGroup[] = [];
	@ViewChild("errorDialogEnergyConsumers", { static: false }) errorDialogEnergyConsumers: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	energyConsumerConfig: any = {};
	disableButtonDuringRequest: boolean = false;
	localization = Localization;

	columns: any = [
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
			Header: $localize`Energy Consumer Group`,
			accessor: "energyConsumerGroups.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["energyConsumerGroups.name", "energyConsumerGroups.custom_id"],
			comboBoxValues: this.energyConsumerGroups,
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.selectedEnergyConsumer = new EnergyConsumer().deserialize({});
		this.energyConsumerConfig = this.configService.getConfigValue("energy_consumers");
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

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
		const url = `EnergyConsumers?$filter=id eq ${this.selectedRowValue?.id}&$expand=energyConsumerGroups`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogEnergyConsumer") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/EnergyConsumers(${this.deletItemId})`).subscribe({
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
				this.errorDialogEnergyConsumers.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogEnergyConsumer") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogEnergyConsumers.elementRef.nativeElement.open = false;
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedEnergyConsumer = new EnergyConsumer().deserialize({});
		this.selectedEnergyConsumer.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedEnergyConsumer.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("EnergyConsumer").catch(() => false);
		this.selectedEnergyConsumer.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedEnergyConsumer.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedEnergyConsumer.custom_id?.trim();
		this.selectedEnergyConsumer.custom_id = customId;
		if (this.isUpdate) {
			if (this.cachedCustomId === customId) {
				this.onCreateOrUpdate();
			} else this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedEnergyConsumer.custom_id || ""
		);
		const urlString = `EnergyConsumers?$filter=custom_id eq '${this.selectedEnergyConsumer.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedEnergyConsumer?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `EnergyConsumers(${this.selectedEnergyConsumer?.id})`
			: `EnergyConsumers`;
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
				this.errorDialogEnergyConsumers.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedRowValue = this.selectedEnergyConsumer?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedEnergyConsumer.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	loadData() {
		this.commonService
			.get("EnergyConsumerGroups?$expand=topEnergyConsumer($select=custom_id)")
			.subscribe((energyConsumerGroups: any) => {
				energyConsumerGroups.value.map((energyConsumerGroup: EnergyConsumerGroup) => {
					this.energyConsumerGroups.push(
						new EnergyConsumerGroup().deserialize(energyConsumerGroup)
					);
				});

				this.columns[2].comboBoxValues = this.energyConsumerGroups;
			});
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	onChangEnergyConsumerGroup(event: any) {
		if (this.selectedEnergyConsumer?.energyConsumerGroups)
			this.selectedEnergyConsumer.energyConsumerGroups =
				new EnergyConsumerGroup().deserialize({
					id: parseInt(event.detail.item.id) || 0,
					name: event.detail.item.text || "",
				});
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchenergyConsumerGroupData = this.energyConsumerGroups.find(
			data => data.name === inputValue
		);
		if (!matchenergyConsumerGroupData && this.selectedEnergyConsumer?.energyConsumerGroups) {
			this.selectedEnergyConsumer.energyConsumerGroups =
				new EnergyConsumerGroup().deserialize({
					id: null,
					name: "",
				});
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
			const id = event.target.id;
			switch (id) {
				case "energyConsumerGroupsCombobox":
					this.selectedEnergyConsumer.energyConsumerGroups =
						new EnergyConsumerGroup().deserialize({
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

	shouldBeDisabled(fieldName: string) {
		if (this.energyConsumerConfig && this.selectedEnergyConsumer) {
			return (
				this.energyConsumerConfig[fieldName] === 0 &&
				this.selectedEnergyConsumer.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}

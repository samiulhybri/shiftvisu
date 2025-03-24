import { Component, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { OperationPlanPos } from "@app/shared/models/operation-plan-pos";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

@Component({
	selector: "app-settings",
	templateUrl: "./settings.component.html",
	styleUrl: "./settings.component.css",
})
export class SettingsComponent {
	isMaintenanceTypeDialog: boolean = false;
	isMaintenanceDialog: boolean = false;
	isBomDialog: boolean = false;
	isWarningDialog: boolean = false;
	operationPlanCustomId: string = "";
	operationPlanPosCustomName: string = "";
	customIdState: keyof typeof ValueState = "None";
	state: keyof typeof ValueState = "None";
	isLoadingMaintenanceTypeDialog: boolean = false;
	@ViewChild("createOrUpdateForm") createOrUpdateForm?: NgForm;
	@ViewChild("maintenanceTypeTable") maintenanceTypeTable?: CustomReactGridTable;
	@ViewChild("maintenanceTable") maintenanceTable?: CustomReactGridTable;
	@ViewChild("createForm") createForm?: NgForm;
	maintenanceTypeValueStateText = "";
	maintenanceValueStateText = "";
	isMaintenanceTypeSaveError: boolean = false;
	deletedId?: number;
	maintenanceTypeId?: number;
	selectedUpdateDataId?: number;
	defaultSelectedData: any;
	selectedMaintenanceType?: OperationPlan;
	selectedMaintenance?: OperationPlanPos;
	bomDialogTitle: string = $localize`Add BOM`;
	maintenanceDialogTitle: string = "";
	isMaintenanceTypeInEditMode: boolean = false;
	globalSearchValue = "";
	disableButtonDuringRequest = false;
	isLoading: boolean = false;
	internalServerError: string = Localization.internalServerError;
	recordExist: string = Localization.recordExist;
	doYouWantToDeleteThisRecord: string = Localization.doYouWantToDeleteThisRecord;
	recordDeleted: string = Localization.recordDeleted;
	recordSavedSuccessfully: string = Localization.recordSavedSuccessfully;
	noMaintenanceName: string = $localize`No Maintenance Type Selected`;
	isFiltering: boolean = false;

	constructor(
		private commonService: CommonService,
		private tosterService: ToastService
	) { }

	maintenanceTypeColumns: any = [
		{
			Header: $localize`Maintenance Type`,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
	];
	maintenanceColumns: any = [
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
	];

	itemsColumns: any = [
		{
			Header: $localize`Item Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
	];

	onConfirm() {
		this.disableButtonDuringRequest = true;
		if (this.maintenanceTypeId) {
			this.updateMaintenanceType();
		} else {
			this.createMaintenenceType();
		}
	}

	updateMaintenanceType() {
		const data = {
			custom_id: this.operationPlanCustomId,
		};

		if (data.custom_id !== '') {
			this.commonService.put(`OperationPlans/${this.maintenanceTypeId}`, data).subscribe({
				next: (response: any) => {
					this.selectedMaintenanceType = new OperationPlan().deserialize(response);
                	this.isMaintenanceTypeDialog = false;
					this.createOrUpdateForm?.reset();
                    this.maintenanceTypeTable?.onColumnFiltering();

                 	if (this.maintenanceTypeId !== undefined) {
						setTimeout(() => {
							this.selectRowById(this.maintenanceTypeId as number);
						}, 0);
					}

					this.disableButtonDuringRequest = false;
					this.tosterService.showToast(this.recordSavedSuccessfully, 'success');
				},
				error: (err: string) => {
					if (err.includes('Duplicate entry')) {
						this.maintenanceTypeValueStateText = this.recordExist;
						this.isMaintenanceTypeSaveError = true;
					} else {
						this.maintenanceTypeValueStateText = this.internalServerError;
						this.isMaintenanceTypeSaveError = true;
					}
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
		}
	}

	createMaintenenceType() {
		const data = {
			custom_id: this.operationPlanCustomId,
		};
		if (data.custom_id !== '') {
			this.commonService.post("OperationPlans", data).subscribe({
				next: (response: any) => {
					this.maintenanceTypeId = response.id;
					this.selectedMaintenanceType = new OperationPlan().deserialize(response);
					this.isMaintenanceTypeDialog = false;
					this.createOrUpdateForm?.reset();
					this.tosterService.showToast(this.recordSavedSuccessfully, "success");
					this.maintenanceTypeTable?.onColumnFiltering();
					this.isMaintenanceTypeDialog = false;
					this.disableButtonDuringRequest = false;
				},
				error: (err: string) => {
					if (err.includes("Duplicate entry")) {
						this.maintenanceTypeValueStateText = this.recordExist;
						this.isMaintenanceTypeSaveError = true;
					} else {
						this.maintenanceTypeValueStateText = this.internalServerError;
						this.isMaintenanceTypeSaveError = true;
					}
				},
			});
		} this.disableButtonDuringRequest = false;
	}

	createMaintenanceType() { }

	deleteMaintenanceType(event: any) {
		this.isWarningDialog = true;
		this.deletedId = event.id;
		this.disableButtonDuringRequest = false;
	}

	onClose() {
		this.isMaintenanceTypeDialog = false;
		this.isBomDialog = false;
	}
	onCancel() {
		this.isWarningDialog = false;
	}
	onClickMaintenanceType() {
		this.maintenanceDialogTitle = Localization.add;
		this.isMaintenanceTypeDialog = true;
		this.maintenanceTypeValueStateText = $localize`Field is required`;
		this.isMaintenanceTypeSaveError = false;
		this.createOrUpdateForm?.reset();
		this.maintenanceTypeId = undefined;
		setTimeout(() => {
			this.operationPlanCustomId = "";
		});
	}

	deleteMaintenanceTypeAndCloseDialog() {
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`OperationPlans/${this.deletedId}`).subscribe({
			next: () => {
				this.isWarningDialog = false;
				this.tosterService.showToast(this.recordDeleted, "success");
				this.maintenanceTypeTable?.onFilterAndSorting();
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
			error: () => {
				this.isWarningDialog = false;
				const { someThingWentWrong } = Localization;
				this.tosterService.showToast(someThingWentWrong, "error");
				this.deletedId = undefined;
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
		});
	}

	onClickNewMaintenance() {
		this.maintenanceDialogTitle = Localization.add;
		this.isMaintenanceDialog = true;
		this.isMaintenanceTypeInEditMode = false;
		this.state= 'None';
		this.maintenanceValueStateText = $localize`Field is required`;
		this.isMaintenanceTypeSaveError = false;
		this.createForm?.reset();
		setTimeout(() => {
			this.operationPlanPosCustomName = "";

		});
	}

	onClickEditwMaintenance(event: any) {
		this.isMaintenanceDialog = true;
		this.maintenanceDialogTitle = Localization.edit;
		this.isMaintenanceTypeInEditMode = true;
		this.state='None';
		this.operationPlanPosCustomName = event.name;
		this.selectedMaintenance = event;
	}

	onGlobalSearch(e: any) {
		this.globalSearchValue = e.target.typedInValue;
	}

	maintenanceTypeEdit(event: any) {
		if(this.maintenanceTypeId != event.id){
			this.checkSelectedDataId(event.id);
		}

		this.selectedMaintenanceType = new OperationPlan().deserialize(event);

		this.operationPlanCustomId = event.custom_id;
		this.maintenanceTypeId = event.id;
		this.isMaintenanceTypeDialog = true;
		
		this.maintenanceDialogTitle = Localization.edit;
	}

	checkSelectedDataId(id?: number) {
		if (id) {
			const index: number = this.maintenanceTypeTable?.data.findIndex((item: any) => item.id === id);
			if (this.maintenanceTypeTable && this.maintenanceTypeTable?.data.length && index !== undefined && index >= 0) {
				this.maintenanceTypeTable.selectedRowsId = { [index]: true };
				this.renderMaintenanceTable(this.maintenanceTypeTable?.data[index]);
				this.selectedMaintenanceType = new OperationPlan().deserialize(
					this.maintenanceTypeTable?.data[index]
				);
			}
			else {
				this.maintenanceTypeId = undefined;
				this.renderMaintenanceTable({});
			}
		}
	}

	renderMaintenanceTable(selectedMaintenanceType?: any) {
		if (selectedMaintenanceType && selectedMaintenanceType.id) {
			this.maintenanceTable!.expandQuery = `&$filter=operation_plan_id eq ${selectedMaintenanceType?.id}`;
			this.maintenanceTable!.addButtonDisable = false;
			this.maintenanceTable?.onFilterAndSorting();
		}
		else {
			this.maintenanceTable!.addButtonDisable = true;
			this.maintenanceTable!.data =[];
			this.maintenanceTable?.render();
		}
	}


	maintenanceTypeSelectionChange(event: any) {
		if (this.maintenanceTypeTable)  this.maintenanceTypeTable.selectedRowsId = { [event?.detail?.row?.index] : true };
		const tempSelectedMaintenanceType = {...this.selectedMaintenanceType};
		this.selectedMaintenanceType = event.detail.row.original;
		if (tempSelectedMaintenanceType?.id !== this.selectedMaintenanceType?.id) {
			this.renderMaintenanceTable(this.selectedMaintenanceType);
		}
	}

	defaultRowSelection() {
		if (this.maintenanceTypeId) {
			this.checkSelectedDataId(this.maintenanceTypeId);
		}
		else {
			if (this.maintenanceTypeTable && this.maintenanceTypeTable?.data.length) {
				this.maintenanceTypeTable.selectedRowsId = { 0: true };
				this.maintenanceTypeId = this.maintenanceTypeTable.data[0].id;
				this.selectedMaintenanceType = this.maintenanceTypeTable.data[0];
				this.renderMaintenanceTable(this.selectedMaintenanceType);
			}
			else {
				this.maintenanceTypeId = undefined;
				this.renderMaintenanceTable({});
			}
		}
	}

	selectRowById(id: number) {
		if (this.maintenanceTypeTable && this.maintenanceTypeTable.data.length) {
			const rowIndex = this.maintenanceTypeTable.data.findIndex((row: any) => row.id === id);
			if (rowIndex !== -1) {
				this.maintenanceTypeTable.selectedRowsId = { [rowIndex]: true };
				const selectedRow = this.maintenanceTypeTable.data[rowIndex];
				this.renderMaintenanceTable(selectedRow);
			}
		}
	}

	onChangeNameInput(event: Event) {
		const inputValue = (event.target as HTMLInputElement).value;
		this.state = inputValue.trim() === '' ? 'Negative' : 'None';
	}

	saveMaintenance() {
		this.disableButtonDuringRequest = true;
		if (this.isMaintenanceTypeInEditMode) {
			this.updateMaintenance();
		} else {
			this.createMaintenance();
		}
	}

	updateMaintenance() {
		const data = new OperationPlanPos().deserialize(this.selectedMaintenance).toOdata() as any;
		data.name = this.operationPlanPosCustomName;

		if (this.operationPlanPosCustomName !== '') {
			this.commonService.put(`OperationPlanPos/${this.selectedMaintenance?.id}`, data).subscribe({
				next: () => {
					this.isMaintenanceDialog = false;
					this.maintenanceTable?.onFilterAndSorting();
					this.disableButtonDuringRequest = false;
					this.tosterService.showToast(this.recordSavedSuccessfully, "success");
					this.state = 'None'; 
				},
				error: (err: any) => {
					this.disableButtonDuringRequest = false;
					this.state = 'Negative';
					if (err.includes("Duplicate entry")) {
						this.maintenanceTypeValueStateText = this.recordExist;
					} else {
						this.maintenanceTypeValueStateText = this.internalServerError;
					}
				},
			});
		}
	}

	createMaintenance() {
		if (!this.operationPlanPosCustomName || this.operationPlanPosCustomName.trim() === '') {
	    	this.state = 'Negative';
			this.disableButtonDuringRequest = false;
			return;
		}
		this.commonService
			.get(
				`OperationPlanPos?filter=operation_plan_id eq ${this.selectedMaintenanceType?.id} & orderby=pos desc &$top=1&select=pos`
			)
			.subscribe({
				next: (data: any) => {
					const payload = {
						operation_plan_id: this.selectedMaintenanceType?.id,
						name: this.operationPlanPosCustomName,
						pos: data.value[0]?.pos ? parseInt(data.value[0].pos) + 10 : 10,
						is_warm_in_warm: false,
					};
				
						this.commonService.post("OperationPlanPos", payload).subscribe({
							next: () => {
								this.isMaintenanceDialog = false;
								this.createForm?.reset();
								this.tosterService.showToast(this.recordSavedSuccessfully, "success");
								this.maintenanceTable?.onFilterAndSorting();
								this.state = 'None'; 
								this.disableButtonDuringRequest = false;

							},
							error: (err: any) => {
								if (err.includes("Duplicate entry")) {
									this.maintenanceTypeValueStateText = this.recordExist;
									this.isMaintenanceTypeSaveError = true;
								} else {
									this.maintenanceTypeValueStateText = this.internalServerError;
									this.isMaintenanceTypeSaveError = true;
								}
								this.state = 'Negative';
								this.disableButtonDuringRequest = false;
							},
						});
					
				},
			});
	}

	onCloseMaintenanceDialog() {
		this.isMaintenanceDialog = false;
		this.isMaintenanceTypeSaveError = false;
		this.disableButtonDuringRequest = false;
		this.state='None';
	}

	handleSearchClick($event: any) {
		this.isFiltering = true;
	}
}

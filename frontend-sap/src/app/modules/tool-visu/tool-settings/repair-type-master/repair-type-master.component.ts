import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Localization } from "@app/shared/utils/common-localize";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
	selector: "app-repair-type-master",
	templateUrl: "./repair-type-master.component.html",
	styleUrl: "./repair-type-master.component.css",
})
export class RepairTypeMasterComponent {
	private authUser!: User;
	public hasAuth: boolean = true;
	operationPlan: OperationPlan = new OperationPlan().deserialize({});

	isUpdateDialog?: boolean;
	selectedRowId?: number;
	isLoading: boolean = false;
	isOpen: boolean = false;
	isUpdate?: boolean;
	dialogTitle: string = "";
	errorValue: keyof typeof ValueState = "None";
	saveOrUpdateButtonTitle: string = "";
	customIdValueStateText?: string;
	selectedUpdateDataId?: number;
	saveDone?: boolean;
	editDone?: boolean;
	deleteModalText?: string;
	isDeleteModalOpen = false;
	isRepairTypeUsed = false;
	isDeleteModalLoading = false;
	localization = Localization;
	selectedRepairTypeIdForDelete?:number

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@Output() selectionChange = new EventEmitter<any>();
	constructor(public commonService: CommonService, public tosterService: ToastService, private _authSrv: AuthService) {}
	ngOnInit() {
		this.authUser = this._authSrv.getUser();
		const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') || 
						this.authUser.roleString?.includes('ADMIN_TOOLVISU') || 
						this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_SETTINGS_EDIT);
		if(checkAuth) this.hasAuth = true;
		else this.hasAuth = false;
	}
	columns: any = [
		{
			Header: $localize`Repair Type`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			showSearch: false,
			isSelected: true
		},
	];
	saveRepairTypeMaster() {
		if (!this.operationPlan.custom_id?.trim()) {
			this.errorValue = "Negative";
			this.customIdValueStateText = $localize`Please Enter Repair Type`;
			return;
		}
		
		if (this.isUpdate == false || this.isUpdate == undefined) {
			this.isLoading = true;
			
			this.commonService.post("/OperationPlans", this.operationPlan.toOdata()).subscribe({
				
				next: (response: any) => {
					if(response.message)
					this.saveDone = true;
					let message = this.localization.recordSavedSuccessfully;
					this.tosterService.showToast(message, 'success')
					this.selectedRowId = response.id;
					this.childComponent?.onFilterAndSorting("", "", "Contains");
					this.isLoading = false;
					this.isOpen = false;
				},
				error: (err) => {
					if(err.includes('already exists')){
						this.customIdValueStateText = $localize`Repair Type is already Taken`;
						this.errorValue = "Negative";
					}else{
						let message = this.localization.someThingWentWrong;
						this.tosterService.showToast(message, 'warning')
					}
					this.isLoading = false;
					
				},
			});
		} else {
			this.commonService
				.put(
					`/OperationPlans/${this.operationPlan.id}`,
					new OperationPlan().deserialize(this.operationPlan).toOdata()
				)
				.subscribe({
					next: () => {
						this.editDone = true;
						let message = this.localization.recordSavedSuccessfully;
						this.tosterService.showToast(message, 'success')
						this.selectedRowId = this.operationPlan.id;
						this.childComponent?.onFilterAndSorting("", "", "Contains");
						this.isLoading = false;
						this.isOpen = false;
					},
					error: (err) => {
					if(err.includes('already exists')){
						this.errorValue = "Negative";
						this.customIdValueStateText = $localize`Repair Type is already Taken`;
					}else{
						let message = this.localization.someThingWentWrong;
						this.tosterService.showToast(message, 'warning')
					}
					this.isLoading = false;
					},
				});
		}
	}
	checkSelectedDataId(id?: number, isEditButtonClick = false) {
		if (id) {
			let index: number = this.childComponent?.data.findIndex((item: any) => item.id == id);
			if (this.childComponent && this.childComponent?.data.length && index > -1){
				this.childComponent.selectedRowsId = { [index]: true };
				this.selectionChange.emit(this.childComponent?.data[index]);
			}
			else {
				this.selectedRowId = undefined;
				this.selectionChange.emit({});
			}
		}
		if (!isEditButtonClick) {
			this.saveDone = undefined;
			this.editDone = undefined;
		}
	}

	newButtonClick() {
		this.errorValue = "None";
		this.operationPlan = new OperationPlan().deserialize({});
		this.dialogTitle = $localize`Add Repair Type`;
		this.saveOrUpdateButtonTitle = this.localization.save;
		this.operationPlan = new OperationPlan();
		this.isUpdate = false;
		this.isUpdateDialog = false;
		this.isOpen = true;
	}
	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogRepairType") as Dialog;
		dialog.open = false;
	}

	closeDialog() {
		this.isOpen = false;
	}
	editRepairType(event: any) {
		if(this.selectedRowId != event.id){
			this.checkSelectedDataId(event.id, true);
		}
		this.selectedRowId = event.id
		this.errorValue = `None`;
		this.dialogTitle = $localize`Update Repair type`;
		this.saveOrUpdateButtonTitle = $localize`Update`;
		this.isUpdate = true;
		this.isOpen = true;
		this.operationPlan = { ...event };
	}
	selectRepairType(event: any) {
		const tempSelectedRowId = this.selectedRowId;
		this.selectedRowId = event.detail.row.original.id;
		if (this.childComponent) this.childComponent.selectedRowsId = { [event?.detail?.row?.index] : true };
		if (tempSelectedRowId != event.detail.row.original.id) {			
			this.selectionChange.emit(event.detail.row.original);
		}
	}

	defaultRowSelection() {
		if (this.selectedRowId) {
			this.checkSelectedDataId(this.selectedRowId);
		} else {
			if (this.childComponent && this.childComponent?.data.length){
				this.childComponent.selectedRowsId = { 0: true };
				this.selectionChange.emit(this.childComponent?.data[0]);
				this.selectedRowId = this.childComponent?.data[0].id;
			}
			else {
				this.selectedRowId = undefined;
				this.selectionChange.emit({});
			}	
			
		}
		
		
	}
	openRepairTypeDeleteModal(event:any){
		this.isDeleteModalOpen = true;
		if(this.selectedRowId != event.id){
			this.checkSelectedDataId(event.id, true);
		}
		this.selectedRowId = event.id;
		this.selectedRepairTypeIdForDelete = event.id;
		if(event.prodOrderPosOperations.length > 0){
			this.isRepairTypeUsed = true;
 			this.deleteModalText = $localize `This repair type is already in use`;
		}else{
			this.isRepairTypeUsed = false;
			this.deleteModalText = this.localization.doYouWantToDeleteThisRecord;
		}
	}
	DeleteSelectedRepairType(){
		this.commonService.delete(`OperationPlans/${this.selectedRepairTypeIdForDelete}`).subscribe({
			next: (res:any)=>{
				this.isDeleteModalOpen = false;
				this.tosterService.showToast(this.localization.recordDeleted, 'success');
				this.selectedRepairTypeIdForDelete = undefined;
				this.childComponent?.onFilterAndSorting("", "", "Contains");
			},
			error:()=>{
				this.isDeleteModalOpen = false;
				this.tosterService.showToast(this.localization.someThingWentWrong, 'error');
				this.selectedRepairTypeIdForDelete = undefined;
			}
		})
	}
}

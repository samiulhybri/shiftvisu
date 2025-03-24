import { Component, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import OperationPlanPos from "@app/shared/models/operation-plan-pos.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

@Component({
	selector: "app-repair-type",
	templateUrl: "./repair-type.component.html",
	styleUrl: "./repair-type.component.css",
})
export class RepairTypeComponent {
	private authUser!: User;
	public hasAuth: boolean = true;
	operationPlanPos: OperationPlanPos = new OperationPlanPos().deserialize({});
	isLoading: boolean = false;
	isDialogOpen: boolean = false;
	isOpen = false;
	errorValue: keyof typeof ValueState = 'None'
	customIdValueStateText: string = $localize`Invalid input`
	isUpdate?: boolean;
	diaLogTitle: string = ''
	saveOrUpdateTitle: string = ''
	selectedRepairName?: string = $localize`No Repair Type Selected`;
	selectedRepair?: OperationPlan;
	expandQuery = "$top=0";
	idDisabled = true
	deleteModalText?: string;
	isDeleteModalOpen = false;
	isRepairTypeUsed = false;
	selectedRepairIdForDelete?:number;
	localization = Localization;

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	columns: any = [
		{
			Header: $localize`Repair`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true
		}
	];

	constructor(private commonService: CommonService, private tosterService: ToastService, private _authSrv: AuthService) { }

	ngOnInit() {
		this.authUser = this._authSrv.getUser();
		const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') || 
						this.authUser.roleString?.includes('ADMIN_TOOLVISU') || 
						this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_SETTINGS_EDIT);
		if(checkAuth) this.hasAuth = true;
		else this.hasAuth = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.isOpen = false;
		this.isUpdate ? this.isUpdate = undefined : this.isUpdate;
	}

	openDialog() {
		this.errorValue = 'None'
		this.operationPlanPos = new OperationPlanPos().deserialize({})
		this.diaLogTitle = $localize`Add New Repair`
		this.saveOrUpdateTitle = this.localization.save;
		this.isOpen = true
		this.isDialogOpen = true;
	}

	editClick(value: any): void {
		this.errorValue = 'None'
		this.isUpdate = true;
		this.diaLogTitle = $localize`Update Repair`
		this.saveOrUpdateTitle = this.localization.update;
		this.isDialogOpen = true;
		this.isOpen = true;
		this.operationPlanPos = { ...value };
	}
	saveNewRepair() {
		if (!this.operationPlanPos.name?.trim()) {
			this.errorValue = 'Critical'
			return;
		}

		if (!this.isUpdate) {
			this.isLoading = true;
			this.operationPlanPos.operation_plan_id = this.selectedRepair?.id
			this.commonService.get(`/OperationPlanPos?$orderby=pos desc&$top=1 & $filter= operation_plan_id eq ${this.operationPlanPos.operation_plan_id}`).subscribe((data: any) => {

				if (data.value.length > 0) {
					let highestPosNumber = parseInt(data.value[0].pos)
					this.operationPlanPos.pos = highestPosNumber + 10;
				} else {
					this.operationPlanPos.pos = 10;
				}
				this.commonService.post('/OperationPlanPos', this.operationPlanPos.toOdata()).subscribe({
					next: () => {
						let message = this.localization.recordSavedSuccessfully;
						this.tosterService.showToast(message, 'success')
						this.childComponent?.onFilterAndSorting("", "", "Contains")
						this.isLoading = false;
						this.closeDialog();
					},
					error: (err) => {
						let message = this.localization.someThingWentWrong;
						this.tosterService.showToast(message, 'warning')
						this.isLoading = false;
						
					},
				});
			})

		} else {
			this.isLoading = true;
			this.commonService.put(`/OperationPlanPos/${this.operationPlanPos.id}`, new OperationPlanPos().deserialize(this.operationPlanPos).toOdata()).subscribe({
				next: () => {
					let message = this.localization.recordSavedSuccessfully;
					this.tosterService.showToast(message, 'success')
					this.childComponent?.onFilterAndSorting("", "", "Contains");
					this.isLoading = false;
					this.closeDialog();
				},
				error: (err) => {
					let message = this.localization.someThingWentWrong;
					this.tosterService.showToast(message, 'warning');
					this.isLoading = false;
				},
			});
		}
	}
	fileterById(data: any) {
		if (data?.custom_id) {
			this.idDisabled = false;
			this.selectedRepair = data;
			this.selectedRepairName = data?.custom_id ?? this.selectedRepairName;
			this.expandQuery = `operation_plan_id eq ${data.id}&$expand=prodOrderPosOperation($select=id,custom_id)`
			setTimeout(() => {
				if(!this.idDisabled){
					this.childComponent?.onFilterAndSorting("", "", "Contains")
				}
			}, 500);
		} else {
			this.idDisabled = true;
			this.selectedRepairName = $localize `No Repair Type Selected`;
			this.childComponent!.data =[];
			this.childComponent?.render();
		}

	}
	
	openRepairDeleteModal(event:any){
		this.selectedRepairIdForDelete = event.id
		if(event.prodOrderPosOperation){
			this.isRepairTypeUsed = true;
			this.deleteModalText = $localize `This repair is already in use`
		}else{
			this.isRepairTypeUsed = false;
			this.deleteModalText = this.localization.doYouWantToDeleteThisRecord;
		}
		this.isDeleteModalOpen = true
	}
	DeleteSelectedRepair(){
		this.commonService.delete(`OperationPlanPos/${this.selectedRepairIdForDelete}`).subscribe({
			next: (res:any)=>{
				this.isDeleteModalOpen = false
				this.tosterService.showToast(this.localization.recordDeleted, 'success')
				this.selectedRepairIdForDelete = undefined;
				this.childComponent?.onFilterAndSorting("", "", "Contains");
			},
			error:()=>{
				this.isDeleteModalOpen = false
				this.tosterService.showToast(this.localization.someThingWentWrong, 'error')
				this.selectedRepairIdForDelete = undefined;
			}
		})
	}
}

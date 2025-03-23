import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Permission } from "@app/shared/models/permission.model";
import { Role } from "@app/shared/models/role.model";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { DialogComponent } from "@ui5/webcomponents-ngx/main/dialog";
import { ReplaySubject, takeUntil } from "rxjs";

@Component({
	selector: "app-role-dialog",
	templateUrl: "./role-dialog.component.html",
	styleUrl: "./role-dialog.component.css",
})
export class RoleDialogComponent implements OnInit, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@ViewChild("modalRef") modalRef!: DialogComponent;
	@ViewChild("permissionRef") permissionRef: any;
	@ViewChild("errorDialogMachines", { static: false }) errorDialogMachines: any;
	@Input("roleModel") roleModel: Role;
	@Input("reactTableComponentRef") reactTableComponentRef: CustomReactGridTable | undefined;;
	public isIndicator: boolean = false;
	public valueState: keyof typeof ValueState = "None";
	public roleList: Role[] = [];
	public permissionList: Permission[] = [];
	public selectedPermissionList: number[] = [];
	dialogTitle: string = "";
	localization = Localization;

	constructor(
		private commonService: CommonService, 
		private dataService: DataService,
		public _toasterSrv: ToastService
	) {
		this.roleModel = new Role().deserialize({ name: "" });
	}

	ngOnInit(): void {
		if (this.roleModel) {
			this.selectedPermissionList = this.roleModel.permissions.map(el => el.id!);
		}
		this.getRolePermissionData();
	}

	getRolePermissionData() {
		this.dataService.permissions$.pipe(takeUntil(this.destroyed$)).subscribe({
			next: res => {
				this.permissionList = res.sort((a, b) => (a.name! > b.name! ? 1 : -1));
			},
			error: error => {},
			complete: () => {},
		});

		this.dataService.roles$.pipe(takeUntil(this.destroyed$)).subscribe({
			next: res => {
				this.roleList = res.sort((a, b) => (a.name! > b.name! ? 1 : -1));
			},
			error: error => {},
			complete: () => {},
		});
	}

	onPermissionChange() {
		this.selectedPermissionList =
			this.permissionRef.elementRef.nativeElement.selectedValues.map(
				(el: any) => +el.ariaValueText
			) as number[];
	}

	submitForm() {
		this.selectedPermissionList =
			this.permissionRef.elementRef.nativeElement.selectedValues.map(
				(el: any) => +el.ariaValueText
			) as number[];
		this.roleModel.permissions = this.permissionList.filter(el =>
			this.selectedPermissionList.includes(el.id!)
		);
		const postData = this.roleModel.toJSON();
		const isNameValid = postData.name?.replace(/\s/g, "").length;

		if (!isNameValid) {
			this.valueState = "Negative";
			return;
		}
		this.isIndicator = true;

		if (this.roleModel.id) {
			this.update(this.roleModel.id, postData);
		} else {
			this.commonService.post("roles", postData, false).subscribe({
				next: (res: any) => {
					const { recordSavedSuccessfully }= Localization;
					const modifiedRes = new Role().deserialize(res);
					this.dataService.roleList = [...this.roleList, modifiedRes];
					this._toasterSrv.showToast(
						recordSavedSuccessfully,
						"success"
					);
				},
				error: err => {
					this.isIndicator = false;
					this.errorDialogMachines.elementRef.nativeElement.open = true;
				},
				complete: () => {
					this.roleModel = new Role().deserialize({ name: "" });
					this.isIndicator = false;
					this.modalRef.open = false;
					this.syncDataHandler();
				},
			});
		}
	}

	update(id: number, data: Role) {
		this.commonService.patch(`roles/${id}`, data, false).subscribe({
			next: (res: any) => {
				const updatedData = this.roleList.map(el => {
					if (el.id === res.id) {
						el = new Role().deserialize(res);
					}
					return el;
				});
				const { recordSavedSuccessfully }= Localization;
				this._toasterSrv.showToast(
					recordSavedSuccessfully,
					"success"
				);
			},
			error: () => {
				this.isIndicator = false;
				this.errorDialogMachines.elementRef.nativeElement.open = true;
			},
			complete: () => {
				this.roleModel = new Role().deserialize({ name: "" });
				this.isIndicator = false;
				this.modalRef.open = false;
				this.syncDataHandler();
			},
		});
	}

	syncDataHandler() {
		const fieldName: string = "";
		const value: string = "";
		const filterOperator: string = "Contain";
		this.reactTableComponentRef?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	onCloseModal() {
		this.modalRef.open = false;
	}

	closeErrorDialog() {
		this.errorDialogMachines.elementRef.nativeElement.open = false;
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	onRoleNameChange(event: any) {
		const value = (event.target as any).value;

		this.valueState = value ? "None" : "Negative";
	}
}

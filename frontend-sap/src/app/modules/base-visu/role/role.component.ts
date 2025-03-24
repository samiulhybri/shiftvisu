import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Role } from '@app/shared/models/role.model';
import { CommonService } from '@app/shared/services/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import Dialog from '@ui5/webcomponents/dist/Dialog';
import Toast from '@ui5/webcomponents/dist/Toast';
import { Permission } from '@app/shared/models/permission.model';
import { DataService } from '@app/shared/services/data.service';
import { AuthService } from "@app/shared/services/auth.service";
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { ToastService } from '@app/shared/services/toaster.service';
import { Localization } from '@app/shared/utils/common-localize';
import { HandleRowClickService } from '@app/shared/services/handle-row-click.service';

@Component({
	selector: "app-role",
	templateUrl: "./role.component.html",
	styleUrl: "./role.component.css",
})
export class RoleComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	protected role = Role;
	@ViewChild("dialogDynamic", { static: true, read: ViewContainerRef })
	dialogDynamic!: ViewContainerRef;
	@ViewChild("childComponentRef", { static: false }) reactTableComponentRef:
		| CustomReactGridTable
		| undefined;
	@ViewChild("deleteErrorDialogRoles", { static: false })
	deleteErrorDialogRoles: any;
	public roleList: Role[] = [];
	public isIndicator: boolean = false;
	localization = Localization;
	private deletItemId: number = 0;
	public roleModel: Role;
	@Input() dialogTitle = "";
	top: number = 500;

	public columns: any[] = [
		{
			id: "name",
			Header: $localize`Role`,
			accessor: "name",
			headerTooltip: "Role Name",
			isSelected: true,
			disableGroupBy: true,
			width: 300,
			autoResizable: true,
		},
		{
			id: "permissions",
			Header: $localize`Permissions`,
			accessor: "permissionString",
			headerTooltip: "Permissions",
			disableGroupBy: true,
			disableFilters: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
		{
			id: "created_at",
			Header: $localize`Created At`,
			accessor: "createdDate",
			headerTooltip: "Created At",
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			disableFilters: true,
			disableGroupBy: true,
			width: 200,
			autoResizable: true,
		},
	];

	constructor(
		private commonService: CommonService,
		private dataService: DataService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {
		this.roleModel = new Role().deserialize({ name: "" });
	}

	ngOnInit(): void {
		this.getPermissions();
	}

	getPermissions() {
		this.commonService
			.get(`Permissions?$top=${this.top}`, true)
			.pipe(takeUntil(this.destroyed$))
			.subscribe((res: any) => {
				const mappedData: Permission[] = [];
				res.value.forEach((el: any) => {
					mappedData.push(new Permission().deserialize(el));
				});
				this.dataService.permissionList = [...mappedData];
			});
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.dialogDynamic.clear();
		const dialogComponent = this.dialogDynamic.createComponent(RoleDialogComponent);
		dialogComponent.instance.dialogTitle = this.dialogTitle;
		dialogComponent.instance.roleModel = new Role().deserialize({ name: "" });
		dialogComponent.instance.reactTableComponentRef = this.reactTableComponentRef;
	}

	editClick(role: any) {
		this.dialogTitle = this.localization.edit;
		this.dialogDynamic.clear();
		const dialogComponent = this.dialogDynamic.createComponent(RoleDialogComponent);
		dialogComponent.instance.dialogTitle = this.dialogTitle;
		dialogComponent.instance.roleModel = new Role().deserialize({ ...role });
		dialogComponent.instance.reactTableComponentRef = this.reactTableComponentRef;
	}

	deleteClick(data: any) {
		this.deletItemId = data.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.isIndicator = true;
		this.commonService
			.delete(`roles/${this.deletItemId}`, false)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: res => {
					this.dataService.roleList = this.roleList.filter(
						el => el.id !== this.deletItemId
					);
					this.closeDialogDelete();
					this.isIndicator = false;

					this._toasterSrv.showToast(recordDeleted, "success");
				},
				error: err => {
					this.deleteErrorDialogRoles.elementRef.nativeElement.open = true;
					this.isIndicator = false;
				},
				complete: () => {
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

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogRoles.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}
}

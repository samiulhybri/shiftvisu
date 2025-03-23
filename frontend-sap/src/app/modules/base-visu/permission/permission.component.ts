import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Permission } from '@app/shared/models/permission.model';
import { ReplaySubject, takeUntil } from 'rxjs';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';
import { CommonService } from '@app/shared/services/common.service';
import Dialog from '@ui5/webcomponents/dist/Dialog';
import Toast from '@ui5/webcomponents/dist/Toast';
import { DataService } from '@app/shared/services/data.service';
import { GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { Localization } from '@app/shared/utils/common-localize';
import { ToastService } from '@app/shared/services/toaster.service';

@Component({
	selector: 'app-permission',
	templateUrl: './permission.component.html',
	styleUrl: './permission.component.css'
})
export class PermissionComponent implements OnInit, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	protected permission = Permission;
	@ViewChild('dialogDynamic', { static: true, read: ViewContainerRef }) dialogDynamic!: ViewContainerRef
	public permissionList: Permission[] = [];
	public isIndicator: boolean = false;
	private deletItemId: number = 0;
	public permissionModel: Permission;
	localization = Localization;

	public columns: any[] = [
		{
			id: 'name',
			Header: this.localization.name,
			accessor: "name",
			headerTooltip: 'Permission Name',
			disableGroupBy: true,
			isSelected: true,
			autoResizable: true,
		},
		{
			id: 'created_at',
			Header: $localize`Created At`,
			accessor: 'createdDate',
			headerTooltip: 'Created At',
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			disableFilters: true,
			disableGroupBy: true,
			width: 200,
			autoResizable: true,
		}
	];

	constructor(
		private commonService: CommonService,
		private dataService: DataService,
		public _toasterSrv: ToastService,
	) {
		this.permissionModel = new Permission().deserialize({ name: '' });
	}

	ngOnInit(): void { }

	newButtonClick() {
		this.dialogDynamic.clear();
		const dialogComponent = this.dialogDynamic.createComponent(PermissionDialogComponent);
		dialogComponent.instance.permissionModel = new Permission().deserialize({ name: '' });
	}

	editClick(permission: any) {
		this.dialogDynamic.clear();
		const dialogComponent = this.dialogDynamic.createComponent(PermissionDialogComponent);
		dialogComponent.instance.permissionModel = new Permission().deserialize({ ...permission });
	}

	deleteClick(data: any) {
		this.deletItemId = data.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.isIndicator = true;
		this.commonService.delete(`permissions/${this.deletItemId}`, false)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res) => {
					this.dataService.permissionList = this.permissionList.filter(el => el.id !== this.deletItemId)
					this.closeDialogDelete();
					this._toasterSrv.showToast(recordDeleted, "success");
					this.isIndicator = false;
				},
				error: (err) => {

				},
				complete: () => {

				}
			});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}
}

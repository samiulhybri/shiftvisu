import { Component } from '@angular/core';
import { PermissionEnum } from '@app/shared/enums/PermissionEnum';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { environment } from "@app/environments/environment";

@Component({
	selector: 'app-export-import',
	templateUrl: './export-import.component.html',
	styleUrl: './export-import.component.css'
})
export class ExportImportComponent {
	orderPLaceholder = $localize`Insert Order`;
	orderNo?: string
	isBusy: boolean = false;
	selectedContainer: number = 0;
	permissionEnums = PermissionEnum;
	environment = environment

	constructor(protected _commonService: CommonService, protected authService: AuthService,
		protected _toastSerVice: ToastService
	) { }

	runOperation(url: string, isSingleOrder = false) {
		if (isSingleOrder) {
			if (this.orderNo) {

				url = `${url}/${this.orderNo}/0`
			} else {
				this._toastSerVice.showToast($localize`Order must not be null.`, 'error');
				return;
			};
		}
		this.isBusy = true;
		this._commonService.post(url, {}, false).subscribe({
			next: (response: any) => {
				this._toastSerVice.showToast($localize`Request succesfully done.`, 'success')
				this.isBusy = false;
			},
			error: (error: any) => {
				this._toastSerVice.showToast($localize`Something went wrong.`, 'error')
				this.isBusy = false;
			}
		})

	}
}

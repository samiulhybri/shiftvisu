import { Injectable } from '@angular/core';
import { NotificationService } from "@progress/kendo-angular-notification";
import { ObjectEquals } from '../helpers/object-equals'
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { lastValueFrom } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class Notification {

	constructor(private notificationService: NotificationService,
		private dialogService: DialogService) { }

	public showDefault(content: string): void {
		this.notificationService.show({
			content: content,
			hideAfter: 3000,
			height: 45,
			position: { horizontal: "right", vertical: "bottom" },
			animation: { type: "fade", duration: 400 },
			type: { style: "none", icon: false },
		});
	}
	public showSuccess(content: string): void {
		this.notificationService.show({
			content: content,
			hideAfter: 3000,
			height: 45,
			position: { horizontal: "right", vertical: "bottom" },
			animation: { type: "fade", duration: 400 },
			type: { style: "success", icon: true },
		});
	}
	public showWarning(content: string): void {
		this.notificationService.show({
			content: content,
			hideAfter: 3000,
			height: 45,
			position: { horizontal: "right", vertical: "bottom" },
			animation: { type: "fade", duration: 400 },
			type: { style: "warning", icon: true },
		});
	}
	public showInfo(content: string): void {
		this.notificationService.show({
			content: content,
			hideAfter: 3000,
			height: 45,
			position: { horizontal: "right", vertical: "bottom" },
			animation: { type: "fade", duration: 400 },
			type: { style: "info", icon: true },
		});
	}
	public showError(content: string): void {
		this.notificationService.show({
			content: content,
			hideAfter: 3000,
			height: 45,
			position: { horizontal: "right", vertical: "bottom" },
			animation: { type: "fade", duration: 400 },
			type: { style: "error", icon: true },
		});
	}

	public async formValueChangeDetect(first: any, second: any, exclude: any) {
		let isEqual = false

		if (!ObjectEquals(first, second, exclude)) {
			const dialog: DialogRef = this.dialogService.open({
				title: $localize`Warning`,
				content: $localize`Save the changes?`,
				actions: [{ text: $localize`Don\'t Save`, action: 'canceled' }, { text: $localize`Save`, themeColor: "primary", action: 'next-action' }],
				width: 450,
				height: 200,
				minWidth: 250
			});
			const dialogResult: any = await lastValueFrom(dialog.result)
			if (dialogResult.action === 'next-action') isEqual = true;
		}
		return isEqual;
	}

	deleteItem(isMultipleDeltete?: boolean) {
		let content = isMultipleDeltete ?  $localize`Are you sure you want to delete all data?` :   $localize`Are you sure you want to delete?`
		return this.dialogService.open({
			title: $localize`Warning`,
			content: content,
			actions: [{ text: $localize`No`, action: 'canceled' }, { text: $localize`Yes`, themeColor: "primary", action: 'next' }],
			width: 450,
			height: 200,
			minWidth: 250
		}).result;
	}

	confirmCustomAction(title: string, message: string) {
		return this.dialogService.open({
			title: title,
			content: message,
			actions: [{ text: $localize`No`, action: 'canceled' }, { text: $localize`Yes`, themeColor: "primary", action: 'next' }],
			width: 450,
			height: 200,
			minWidth: 250
		}).result;
	}
}
export { NotificationService };


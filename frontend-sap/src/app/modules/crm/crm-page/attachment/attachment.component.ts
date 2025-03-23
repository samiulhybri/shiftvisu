import { Component, Input, ViewChild } from "@angular/core";
import { AttachmentUploadComponent } from "@app/shared/components/attachment-upload/attachment-upload.component";
import { Customer } from "@app/shared/models/customer.model";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";

@Component({
	selector: "app-attachment",
	templateUrl: "./attachment.component.html",
	styleUrl: "./attachment.component.css",
})
export class AttachmentComponent {
	@Input() public selectedCustomer!: Customer;
	public tempFiles: any = [];
	isLoading: boolean = false;
	public deletedSavedFiles: any = [];
	public selectedStandardFile: any = {};
	public attachmentCount: number = 0;
	public checkForNewAttachments: boolean = false;

	@ViewChild("reuseableAttachmentRef", { static: false }) reuseableAttachmentRef:
		| AttachmentUploadComponent
		| undefined;

	constructor(
		public commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.setModalInitialState();
	}

	async setModalInitialState(): Promise<void> {
		this.tempFiles = [];
	}

	async saveItemAttachments(customer: any): Promise<void> {
		this.selectedCustomer = customer;

		try {
			this.isLoading = true;
			if (this.tempFiles && this.tempFiles.length > 0) await this.uploadTempFiles();
			if (this.deletedSavedFiles && this.deletedSavedFiles.length > 0)
				await this.deleteSavedAttachments();
		} catch (error) {
			console.error("Error during file operations: ", error);
			// Notify user about the error
			this._toasterSrv.showToast($localize`Failed to save attachment details!`, "error");
		} finally {
			this.afterSavingItem();
		}
	}

	uploadTempFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			let count = 0;
			this.tempFiles.forEach((file: any, index: number) => {
				if (this.selectedCustomer) {
					const formData = new FormData();
					formData.append("id", this.selectedCustomer?.id + "");
					formData.append("model", "Customer");
					formData.append("media", file);

					this.commonService.post("media/upload", formData, false).subscribe({
						next: (res: any) => {
							count++;
							this.attachmentCount++;
							if (count === this.tempFiles.length) {
								this._toasterSrv.showToast(
									$localize`Attachments uploaded successfully!`,
									"success"
								);
								resolve();
							}
						},
						error: err => {
							count++;
							console.log("upload file error: ", err);
							if (count === this.tempFiles.length) reject(err);
						},
					});
				}
			});
		});
	}

	afterSavingItem() {
		this.tempFiles = [];
		this.selectedStandardFile = [];
	}

	async deleteSavedAttachments(): Promise<boolean> {
		let count = 0;
		return new Promise((resolve, reject) => {
			this.deletedSavedFiles.forEach((file: any, index: number) => {
				this.commonService.delete(`media/${file.id}`, false).subscribe({
					next: () => {
						count++;
						if (count === this.deletedSavedFiles.length) resolve(true);
					},
					error: err => {
						count++;
						console.log("delete file error: ", err);
						if (count === this.deletedSavedFiles.length) resolve(err);
					},
				});
			});
		});
	}

	onAttachmentChanges(data: any, type: string) {
		switch (type) {
			case "fileCount":
				this.attachmentCount = data;
				break;
			case "onUpload":
				this.tempFiles = data;
				break;
			case "onDelete":
				this.deletedSavedFiles = data;
				break;
			case "onStandardSelect":
				this.selectedStandardFile = data;
				break;
			default:
				break;
		}
	}
}

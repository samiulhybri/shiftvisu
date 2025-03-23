import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Item } from "@app/shared/models/item.model";
import { AttachmentUploadComponent } from "@app/shared/components/attachment-upload/attachment-upload.component";
import { ToastService } from "@app/shared/services/toaster.service";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-eight-d-attachment",
	templateUrl: "./eight-d-attachment.component.html",
	styleUrl: "./eight-d-attachment.component.css",
})
export class EightDAttachmentComponent {
	@Input() isSaving: boolean = false;
	@Input() eightDReportId: number = 0;

	@Output() refreshGrid: EventEmitter<void> = new EventEmitter<void>();
	public tempFiles: any = [];
	isLoading: boolean = false;
	public deletedSavedFiles: any = [];
	public selectedStandardFile: any = {};
	public attachmentCount: number = 0;
	public checkForNewAttachments: boolean = false;

	@ViewChild("eightDAttachment", { static: false }) eightDAttachment:
		| AttachmentUploadComponent
		| undefined;

	constructor(
		public qualiVisuService: QualiVisuService,
		public _toasterSrv: ToastService
	) {
		this.setModalInitialState();
	}

	async setModalInitialState(): Promise<void> {
		this.tempFiles = [];
	}

	async saveItemAttachments(): Promise<void> {
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
				if (this.eightDReportId) {
					const formData = new FormData();
					formData.append("id", this.eightDReportId + "");
					formData.append("model", "EightDReport");
					formData.append("media", file);

					this.qualiVisuService.post("media/upload", formData, false).subscribe({
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
		this.refreshGrid.emit();
	}

	async deleteSavedAttachments(): Promise<boolean> {
		let count = 0;
		return new Promise((resolve, reject) => {
			this.deletedSavedFiles.forEach((file: any, index: number) => {
				this.qualiVisuService.delete(`media/${file.id}`, false).subscribe({
					next: () => {
						count++;
						if (count === this.deletedSavedFiles.length) resolve(true);
					},
					error: (err: any) => {
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

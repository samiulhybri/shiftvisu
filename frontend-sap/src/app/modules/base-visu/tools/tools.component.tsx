import {Component, ViewChild } from "@angular/core";
import Toast from "@ui5/webcomponents/dist/Toast";
import { CommonService } from "@app/shared/services/common.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Item } from "@app/shared/models/item.model";
import React from "react";
import { Button } from "@ui5/webcomponents-react";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-tools",
	templateUrl: "./tools.component.html",
	styleUrl: "./tools.component.css",
})
export class ToolsComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
    customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	selectedTool: Item = new Item().deserialize({});
	cachedCustomId?: string = "";
	toolConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	selectedTab: string = "core_data";
	public tempFiles: any = [];
	public isAttachmentTabClicked: boolean = false;
	public attachmentCount: number = 0;
	public deletedSavedFiles: any = [];
	public selectedStandardFile: any = {};
	public isCancelClicked: boolean = false;
	public checkForNewAttachments: boolean = false;
	isPreviewDialogOpen: boolean = false;
	public filePreviewHeight = 629;
	public fileCount: number = 0;

	@ViewChild("deleteErrorDialogTools", { static: false })
	deleteErrorDialogTools: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("errorDialogTools", { static: false }) errorDialogTools: any;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			maxWidth: 72,
			autoResizable: true
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true
		},
		{
			Header: $localize`Attachment`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalAttachments: any[] = [];

				rowData.media.map((item: any) => {
					totalAttachments.push(item.id);
				});
				if (totalAttachments.length > 0) {
					return (
						<React.StrictMode>
							<Button icon="attachment" onClick={() => this.showPreview(rowData, totalAttachments.length)}>
								{totalAttachments.length + $localize` Files`}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
	];

	showPreview(attachments: any, totalFiles: number) {
		this.fileCount = totalFiles;
		this.selectedTool = this.selectedTool?.deserialize(attachments);
		this.isPreviewDialogOpen = true;
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
	}

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.selectedTool = new Item().deserialize({});
		this.toolConfig = this.configService.getConfigValue("tools");
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `Items?$filter=is_active eq true and is_tool eq true and id eq ${this.selectedTool?.id} &$orderby=custom_id asc&$expand=media`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogTools") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Items(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.deleteErrorDialogTools.elementRef.nativeElement.open = true;
			},
		});
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedTool = new Item().deserialize({});
		this.selectedTool.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedTool.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
		this.attachmentCount = 0;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "core_data";
			return;
		}
		const customId = this.selectedTool.custom_id?.trim();
		this.selectedTool.custom_id = customId;

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const urlString = `Items?$filter=custom_id eq '${this.selectedTool.custom_id}'`;
		if (this.selectedTool.custom_id) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (!response.value.length) this.onCreateOrUpdate();
					else {
						const { idIsAlreadyTaken } = Localization;
						this.customIdState = "Negative";
						this.customIdValueStateText = idIsAlreadyTaken;
					}
				},
				error: e => {
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			const { idIsRequired }= Localization;
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = idIsRequired;
		}
	}

	editClick(value: object): void {
		this.isUpdate = true;
		this.selectedTool?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.isDialogOpen = true;
		this.cachedCustomId = this.selectedTool.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		this.attachmentCount = this.selectedTool?.media ? this.selectedTool.media.length : 0;
	}
	
	async onCreateOrUpdate() {
		this.isLoading = true;
		this.selectedTool.is_tool = true;
		const payload = this.selectedTool?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Items(${this.selectedTool?.id})` : `Items`;
		this.commonService[method](urlString, payload).subscribe({
			next: async (response: any) => {
				const { recordSavedSuccessfully }= Localization;
				this.selectedTool = new Item().deserialize(response);
				await this.saveItemAttachments();
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(
					recordSavedSuccessfully,
					"success"
				);
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogTools.elementRef.nativeElement.open = true;
			},
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Item").catch(() => false);
		this.selectedTool.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedTool.custom_id = "";
		this.isLoadingCustomId = false;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogTools") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogTools.elementRef.nativeElement.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogTools.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.isCancelClicked = true;
		this.tempFiles = [];
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		setTimeout(() => {
			this.selectedTab = "core_data";
		}, 0);
	}

	onChangeIsActive(event: any) {
		if (this.selectedTool) this.selectedTool.is_active = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedTool) this.selectedTool.name = (event.target as any).value;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.toolConfig && this.selectedTool) {
			return this.toolConfig[fieldName] === 0 && this.selectedTool.is_imported_from_erp;
		} else {
			return false;
		}
	}

	async saveItemAttachments(): Promise<void> {
		try {
			this.isLoading = true;
			if (this.tempFiles && this.tempFiles.length > 0) await this.uploadTempFiles();
			if (this.deletedSavedFiles && this.deletedSavedFiles.length > 0)
				await this.deleteSavedAttachments();
			if (this.selectedStandardFile && this.selectedStandardFile.name)
				await this.setStandardImage();
		} catch (error) {
			console.error("Error during file operations: ", error);
		} finally {
			this.afterSavingItem();
		}
	}

	afterSavingItem() {
		this.filterHandler();
		this.isLoading = false;
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.isCancelClicked = false;
		this.tempFiles = [];
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		this.disableButtonDuringRequest = false;
	}

	uploadTempFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			let count = 0;
			this.tempFiles.forEach((file: any, index: number) => {
				if (this.selectedTool) {
					const formData = new FormData();
					formData.append("id", this.selectedTool?.id + "");
					formData.append("model", "Item");
					formData.append("media", file);

					this.commonService.post("media/upload", formData, false).subscribe({
						next: (res: any) => {
							count++;
							this.attachmentCount++;
							if (count === this.tempFiles.length) resolve();
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

	async setStandardImage(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.commonService
				.post(
					`media/update/${this.selectedStandardFile.id}`,
					this.selectedStandardFile,
					false
				)
				.subscribe({
					next: () => resolve(true),
					error: () => reject(false),
				});
		});
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

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}
}

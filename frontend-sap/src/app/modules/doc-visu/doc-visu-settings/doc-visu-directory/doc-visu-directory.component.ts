import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";

import { Subject, take, takeUntil } from "rxjs";

import { GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";

import { DocVisuService } from "@doc-visu/doc-visu.service";
import { IDirectory } from "@app/shared/interfaces/directory.interface.";
import { DocVisuDirectoryViewComponent } from "@doc-visu/doc-visu-directory-view/doc-visu-directory-view.component";
import { AuthService } from "@app/shared/services/auth.service";

@Component({
	selector: "app-doc-visu-directory",
	templateUrl: "./doc-visu-directory.component.html",
	styleUrl: "./doc-visu-directory.component.css",
})
export class DocVisuDirectoryComponent implements OnInit, OnDestroy {
	valueState: "Negative" | "None" = "None";
	public structureId: number = 0;
	public isLoading: boolean = false;
	public inProgress: boolean = false;
	public localization = Localization;
	public headerTitle: string = "";
	public directories: any[] = [];
	public gridColumns = [
		{
			Header: $localize`Description`,
			accessor: "name",
			icon: "icon",
			disableGroupBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.IconText,
			hAlign: "Left",
			disableResizing: false,
		},
	];
	private selectedFolderId?: number;
	private selectedId: string = "0";
	public selectedRow: any;
	public folderName: string = "";
	public isUpdate: boolean = false;
	public actionButtons = [
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_ADD")
			? [
					{
						id: "add",
						name: "add",
						icon: "add-folder",
						onClick: (rowData: any) => {
							this.headerTitle = $localize`New Folder`;
							this.selectedRow = rowData;
							this.selectedId = rowData.id;
							this.selectedFolderId = rowData.id;
							this.addFolderDialog.elementRef.nativeElement.open = true;
						},
					},
				]
			: []),
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_EDIT")
			? [
					{
						id: "edit",
						name: "edit",
						icon: "edit",
						onClick: (rowData: any) => {
							this.headerTitle = $localize`Edit Folder`;
							this.isUpdate = true;
							this.selectedRow = rowData;
							this.selectedId = rowData.id;
							this.selectedFolderId = rowData.id;
							this.folderName = rowData.name;
							this.addFolderDialog.elementRef.nativeElement.open = true;
						},
					},
				]
			: []),
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_DELETE")
			? [
					{
						id: "delete",
						icon: "delete",
						name: "delete",
						onClick: (rowData: any) => {
							this.selectedRow = rowData;
							this.selectedId = rowData.id;
							this.folderName = rowData.name;
							this.selectedFolderId = rowData.id;
							this.addFolderDialog.elementRef.nativeElement.open = false;
							this.deleteFolderDialog.elementRef.nativeElement.open = true;
						},
					},
				]
			: []),
	];

	public processActionButtons = [
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_ADD")
			? [
					{
						id: "add",
						name: $localize`Add`,
						icon: "add-folder",
						onClick: (rowData: any) => {
							this.headerTitle = $localize`New Folder`;
							this.selectedRow = rowData;
							this.selectedId = rowData.id;
							this.selectedFolderId = rowData.id;
							this.addFolderDialog.elementRef.nativeElement.open = true;
						},
					},
				]
			: []),
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_EDIT")
			? [
					{
						id: "edit",
						name: $localize`Edit`,
						icon: "edit",
						disable: () => {
							return true;
						},
						onClick: (rowData: any) => {},
					},
				]
			: []),
		...(this.authService.isPermissionValid("DOCVISU_FOLDER_DELETE")
			? [
					{
						id: "delete",
						icon: "delete",
						name: $localize`Delete`,
						disable: () => {
							return true;
						},
						onClick: (rowData: any) => {},
					},
				]
			: []),
	];

	@ViewChild("addFolderDialog", { static: false }) addFolderDialog: any;
	@ViewChild("deleteFolderDialog", { static: false }) deleteFolderDialog: any;
	private destroy$ = new Subject<void>();
	public directory?: IDirectory;

	constructor(
		public authService: AuthService,
		private toasterSrv: ToastService,
		private docVisuService: DocVisuService
	) {}

	ngOnInit(): void {
		this.initializeComponent();
	}

	initializeComponent(): void {
		this.directories = [];
		this.docVisuService.selectedStructureId
			.pipe(takeUntil(this.destroy$))
			.subscribe((id: number) => {
				this.structureId = id;
				if (id !== 0) {
					this.getStructure(this.structureId);
					this.getStructureWithDirectories(this.structureId);
				} else {
					this.directory = undefined;
				}
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getStructure(id: number) {
		this.isLoading = true;
		this.directories = [];
		this.docVisuService
			.getStructureWithDirectories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe((res: any) => {
				const structure = res;
				structure["icon"] = "factory";
				this.directories = [{ ...structure }];
				this.isLoading = false;
			});
	}

	@ViewChild("directoryViewComponent", { static: false })
	directoryViewComponent!: DocVisuDirectoryViewComponent;

	processClick = (param: any) => {};

	getStructureWithDirectories(id: number) {
		this.docVisuService
			.getStructureWithDirectories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: any) => {
					this.directory = undefined;
					this.directory = data as IDirectory;
					this.directoryViewComponent?.buildTree(data);
				},
				error: e => {
					this.toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.closeDialog();
				},
			});
	}

	onChangeInput(event: any) {
		this.folderName = event.target.value.trim();
		if (!this.folderName) {
			this.valueState = "Negative";
		} else {
			this.valueState = "None";
		}
	}

	createNewFolder() {
		if (!this.folderName || this.folderName.trim().length < 1) {
			this.valueState = "Negative";
			this.inProgress = false;
			return;
		} else {
			this.valueState = "None";
		}

		this.inProgress = true;
		this.isLoading = true;
		this.folderName = this.folderName.trim();

		const { recordSavedSuccessfully, failedToSaveData } = Localization;

		if (this.selectedRow && this.selectedRow.custom_id) {
			this.docVisuService
				.createRootFolder(this.folderName, this.structureId)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.initializeComponent();
						this.closeDialog();
					},
					error: err => {
						this.isLoading = false;
						this.toasterSrv.showToast(failedToSaveData, "error-toaster");
						this.closeDialog();
					},
				});
		} else if (this.selectedRow) {
			this.docVisuService
				.createSubFolder(this.folderName, this.selectedFolderId!, this.isUpdate)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.toasterSrv.showToast(recordSavedSuccessfully, "success");
						this.initializeComponent();
						this.closeDialog();
					},
					error: err => {
						this.isLoading = false;
						this.toasterSrv.showToast(failedToSaveData, "error-toaster");
						this.closeDialog();
					},
				});
		}
	}

	deleteFolder() {
		const { recordDeleted, someThingWentWrong } = Localization;
		this.inProgress = true;
		this.isLoading = true;
		if (this.selectedRow && !this.selectedRow.custom_id) {
			this.docVisuService
				.deleteFolder(this.selectedFolderId!)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.inProgress = false;
						this.toasterSrv.showToast(recordDeleted, "success");
						this.directoryViewComponent!.selectedTreeIndex = "0";
						this.initializeComponent();
						this.closeDialog();
					},
					error: () => {
						this.toasterSrv.showToast(someThingWentWrong, "error-toaster");
						this.closeDialog();
					},
				});
		}
	}

	closeDialog() {
		this.valueState = "None";
		this.isUpdate = false;
		this.folderName = "";
		this.selectedRow = undefined;
		this.selectedId = "";
		this.inProgress = false;
		this.selectedFolderId = undefined;
		this.addFolderDialog.elementRef.nativeElement.open = false;
		this.deleteFolderDialog.elementRef.nativeElement.open = false;
	}
}

import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

import { firstValueFrom, Subject, takeUntil } from "rxjs";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import { IDirectory } from "@app/shared/interfaces/directory.interface.";
import { DocumentSection } from "@app/shared/models/document-section.model";
import { DirectoryStructure } from "@app/shared/models/directory-structure.model";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import { PlantsService } from "@app/shared/services/plants.service";

import { DocVisuService } from "@doc-visu/doc-visu.service";
import { DocVisuDirectoryViewComponent } from "@doc-visu/doc-visu-directory-view/doc-visu-directory-view.component";
import { DocVisuFilePreviewComponent } from "@doc-visu/doc-visu-file-preview/doc-visu-file-preview.component";
import { AuthService } from "@app/shared/services/auth.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
	selector: "app-doc-visu-process-details",
	templateUrl: "./doc-visu-process-details.component.html",
	styleUrls: ["./doc-visu-process-details.component.css"],
})
export class DocVisuProcessDetailsComponent implements OnDestroy {
	@Input() public machineId?: number;
	@Input() public processId: number = 0;
	@Input() public isLoadingPage: boolean = false;
	@Input() public isMachineBoardActive: boolean = false;

	@ViewChild("childComponentRef", { static: false }) childComponentRef:
		| CustomReactGridTable
		| undefined;
	@ViewChild("menuButton", { static: false }) menuButton!: ElementRef;
	@ViewChild("myMenu", { static: false }) myMenu!: ElementRef;
	@ViewChild("isLinkDialogOpen", { static: false }) isLinkDialogOpen: any;
	@ViewChild("isNewFolderDialogOpen", { static: false }) isNewFolderDialogOpen: any;
	@ViewChild("isRenameFileDialogOpen", { static: false }) isRenameFileDialogOpen: any;
	@ViewChild("addGroupDialog", { static: false }) addGroupDialog: any;
	@ViewChild("isAddFileDialogOpen", { static: false }) isAddFileDialogOpen: any;
	@ViewChild("deleteDialog", { static: false }) deleteDialog: any;
	@ViewChild("sectionCombobox") sectionCombobox!: ComboBoxComponent;
	@ViewChild("directoryStructureComboBox") directoryStructureComboBox!: ComboBoxComponent;
	@ViewChild("directoryViewComponent", { static: false })
	directoryViewComponent!: DocVisuDirectoryViewComponent;
	@ViewChild("showMediaPreview", { static: false })
	showMediaPreview!: DocVisuFilePreviewComponent;

	// Attachment
	public tempFiles: any = [];
	public attachmentCount: number = 0;
	public deletedSavedFiles: any = [];
	public selectedStandardFile: any = {};
	public checkForNewAttachments: boolean = false;
	public fileCount: number = 0;
	public filename: string = "";
	public fileNotes: string = "";
	public selectedFile: any;
	public selectedFolder: any;
	public selectedProcess: any;

	public structure: any = null;
	public folder: any = null;
	public section: any = null;

	public linkedStructure?: IDirectory;

	private directoryModel = "App\\Models\\DocVisu\\DocVisuDirectory";

	public directories?: IDirectory;
	public folderDetails: any[] = [];
	public fileDetails: any[] = [];
	public folderDetail: any[] = [];
	public processDetails: any[] = [];
	directoryStructures: DirectoryStructure[] = [];
	documentSections: any[] = [];
	public isLoading: boolean = false;
	public isMenuOpen: boolean = false;
	public folderName: string = "";
	public fileName: string = "";
	public inProgress: boolean = false;
	public isUpdate: boolean = false;
	private selectedId: string = "0";
	private selectedFolderId?: number;
	private selectedFileId?: number;
	private selectedRow: any;
	selectedSegment: string = "menu";
	localization = Localization;
	disableButtonDuringRequest: boolean = false;
	isLoadingLink: boolean = false;
	dialogTitle: string = "";
	newFolderDialogTitle: string = "";
	isFileDialogOpen: string = "";
	titleName: string = "";
	notificationContent: string = "";
	historyList: any = [];
	mediaList: any = [];
	filePreview: boolean = true;
	linkDialogTitle: string = "";
	addFileDialogTitle: string = "";
	filterQuery: string = "";
	documentSectionName: string = "";
	directoryStructure: string = "";
	createDocuments: boolean = false;
	permissionEnums = PermissionEnum;
	docSection?: any;
	public itemName: string = "";
	public endPoint: string = "";
	public directory?: IDirectory;
	public isNewVersion: boolean = false;
	public isSelectStructure: boolean = false;
	public isStructureLoading: boolean = false;
	private docSectionStructure: any = null;
	public clonedStructure: IDirectory | null = null;
	public parentLinkFolder?: any = null;
	private clonedFileWithFolder: any[] = [];
	filenameValueState: "Positive" | "Negative" | "None" | "Critical" | "Information" = "None";
	valueState: "Negative" | "None" = "None";
	public directoryMap: Map<number, any> = new Map<number, any>();
	selectedDocumentSection: DocumentSection = new DocumentSection().deserialize({});
	private plantId: number = 0;
	isConfirmationModalOpen: boolean = false;
	confirmationText = Localization.allUnsavedChangesWillBeLost;

	folderOptions: any = [
		{
			id: "more",
			name: "more",
			icon: "overflow",
			type: "MenuButton",
			items: [
				// {
				// 	id: "create",
				// 	name: "Create Document",
				// 	icon: "write-new-document",
				// 	onClick: () => this.handleCreateDocument(),
				// },
				...(this.authService.isPermissionValid("DOCVISU_DOCUMENTS_ADD")
					? [
							{
								id: "add-document",
								name: $localize`Add File`,
								icon: "add-document",
								disable: (rowData: any) =>
									rowData.type === "LinkedDocVisuDirectory",
								onClick: (rowData: any, tableId: string) => {
									if (rowData.type === "DocVisuDirectory") {
										this.handleAddFile(rowData, tableId);
									}
								},
							},
						]
					: []),
				...(this.authService.isPermissionValid("DOCVISU_FOLDER_ADD")
					? [
							{
								id: "add-folder",
								name: $localize`New Folder`,
								icon: "add-folder",
								disable: (rowData: any) =>
									rowData.type === "LinkedDocVisuDirectory",
								onClick: (rowData: any, tableId: string) => {
									this.isLoadingLink = false;
									if (rowData.type === "DocVisuDirectory") {
										this.handleNewFolder(rowData, tableId);
									}
								},
							},
						]
					: []),
				...(this.authService.isPermissionValid("DOCVISU_LINK_DOCUMENTS_ADD")
					? [
							{
								id: "chain-link",
								name: $localize`Link`,
								icon: "chain-link",
								disable: (rowData: any) =>
									rowData.type === "LinkedDocVisuDirectory",
								onClick: (rowData: any, tableId: string) => {
									if (rowData.type === "DocVisuDirectory") {
										this.handleLink(rowData, tableId);
									}
								},
							},
						]
					: []),
				...(this.authService.isPermissionValid("DOCVISU_FOLDER_EDIT")
					? [
							{
								id: "edit",
								name: $localize`Rename`,
								icon: "request",
								disable: (rowData: any) =>
									rowData.type === "LinkedDocVisuDirectory",
								onClick: (rowData: any, tableId: string) => {
									if (rowData.type === "DocVisuDirectory") {
										this.handleRename(rowData, tableId);
									}
								},
							},
						]
					: []),
				...(this.authService.isPermissionValid("DOCVISU_FOLDER_DELETE")
					? [
							{
								id: "delete",
								name: $localize`Delete`,
								icon: "delete",
								onClick: (rowData: any, tableId: string) =>
									this.handleDelete(rowData, tableId),
							},
						]
					: []),
				{
					id: "cancel",
					name: $localize`Cancel`,
					icon: "decline",
					onClick: (id: number) => {},
				},
			],
		},
	];

	fileOptions: any = [
		{
			id: "more",
			name: "more",
			icon: "overflow",
			type: "MenuButton",
			items: [
				{
					id: "download",
					name: $localize`Download`,
					icon: "download",
					onClick: (rowData: any) =>
						rowData.versions && rowData.versions.length > 0
							? this.downloadFile(rowData.versions[0])
							: null,
				},
				...(this.authService.isPermissionValid("DOCVISU_DOCUMENTS_VERSION") ? [

					{
						id: "edit-version",
						name: $localize`Add New Version`,
						icon: "create",
						disable: (rowData: any) => rowData.type === "LinkedDocVisuFile",
						onClick: (rowData: any, tableId: string) => {
							if (rowData.type === "DocVisuFile") {
								this.handleNewVersion(rowData, tableId);
							}
						},
					},
				] : []),
				...(this.authService.isPermissionValid("DOCVISU_DOCUMENTS_EDIT")
					? [
							{
								id: "edit",
								name: $localize`Rename`,
								icon: "request",
								disable: (rowData: any) => rowData.type === "LinkedDocVisuFile",
								onClick: (rowData: any, tableId: string) => {
									if (rowData.type === "DocVisuFile") {
										this.handleFileRename(rowData);
									}
								},
							},
						]
					: []),
				// {
				// 	id: "permission",
				// 	name: "Release Options",
				// 	icon: "permission",
				// 	onClick: (rowData: any, tableId: string) => this.handleRename(rowData, tableId),
				// },
				...(this.authService.isPermissionValid("DOCVISU_DOCUMENTS_DELETE")
					? [
							{
								id: "delete",
								name: $localize`Delete`,
								icon: "delete",
								onClick: (rowData: any, tableId: string) =>
									this.handleDelete(rowData, tableId),
							},
						]
					: []),
				{
					id: "cancel",
					name: $localize`Cancel`,
					icon: "decline",
					onClick: (id: number) => {},
				},
			],
		},
	];

	processOptions: any = [
		{
			id: "more",
			name: $localize`More`,
			icon: "overflow",
			type: "MenuButton",
			items: [
				...(this.authService.isPermissionValid("DOCVISU_FOLDER_ADD")
					? [
							{
								id: "add-folder",
								name: $localize`New Folder`,
								icon: "add-folder",
								onClick: (rowData: any, tableId: string) =>
									this.handleNewFolder(rowData, tableId),
							},
						]
					: []),
				...(this.authService.isPermissionValid("DOCVISU_LINK_DOCUMENTS_ADD")
					? [
							{
								id: "chain-link",
								name: $localize`Link`,
								icon: "chain-link",
								onClick: (rowData: any, tableId: string) =>
									this.handleLink(rowData, tableId),
							},
						]
					: []),
				{
					id: "cancel",
					name: $localize`Cancel`,
					icon: "decline",
					onClick: (id: number) => {},
				},
			],
		},
	];

	public showTreeView: boolean = true;
	public showItemDetails: boolean = true;

	private destroy$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private location: Location,
		public authService: AuthService,
		private _toasterSrv: ToastService,
		private docVisuService: DocVisuService,
		private plantsService: PlantsService,
		private cdr: ChangeDetectorRef
	) {
		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});

		if (this.machineId) {
			this.processId = this.machineId;
		} else {
			this.processId = Number(this.route.snapshot.paramMap.get("processId") || 0);
		}
	}

	ngOnInit(): void {
		if (this.isMachineBoardActive) {
			this.showItemDetails = false;
			this.showTreeView = true;
		}
		this.getStructure(this.processId);
		this.loadDocumentSections();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	toggleTreeView() {
		if (this.isMachineBoardActive) {
			if (!this.showTreeView && this.showItemDetails) {
				this.showItemDetails = !this.showItemDetails;
				this.showTreeView = !this.showTreeView;
			} else {
				this.showTreeView = !this.showTreeView;
			}
		} else {
			this.showTreeView = !this.showTreeView;
		}
	}

	toggleDetails() {
		if (this.isMachineBoardActive) {
			if (!this.showItemDetails && this.showTreeView) {
				this.showItemDetails = !this.showItemDetails;
				this.showTreeView = !this.showTreeView;
			} else {
				this.showItemDetails = !this.showItemDetails;
			}
		} else {
			this.showItemDetails = !this.showItemDetails;
		}
	}

	populateWithSubRow(directory: any[], isLink: boolean = false, withLinks: boolean = true): any {
		if (!directory || directory.length === 0) {
			return [];
		}
		return directory.map((dir: any) => {
			this.directoryMap.set(dir.id, {
				name: dir.name,
			});
			return {
				...dir,
				icon: isLink ? "chain-link" : "folder-blank",
				link: isLink,
				action: null,
				subRows: dir.directories
					? [
							...this.populateWithSubRow(
								dir.directories,
								isLink,
								isLink ? false : withLinks
							),
						]
					: [],
			};
		});
	}

	/** Fetch Blob data */
	async getFilesBlobData(path: string, name: string): Promise<any> {
		try {
			const blobResponse = await fetch(path);
			if (!blobResponse.ok) {
				return {};
			}
			return await blobResponse.blob();
		} catch (e) {
			return {};
		}
	}

	async downloadFile(history: any) {
		let isFileDownloaded = false;
		try {
			const index = this.historyList.findIndex((item: any) => item.id === history.id);

			if (index > -1) {
				this.filePreview = false;
				const media = this.mediaList[index];

				this.filePreview = true;
				this.cdr.detectChanges();

				const blob = await this.getFilesBlobData(
					media.original_url,
					this.selectedFile.name
				);

				if (blob) {
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.setAttribute("download", this.selectedFile.name);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
					isFileDownloaded = true;
				}
				if (isFileDownloaded)
					this._toasterSrv.showToast(
						$localize`Files downloaded successfully!`,
						"success"
					);
			}
		} catch (error) {
			this._toasterSrv.showToast($localize`Failed to download files!`, "error");
		} finally {
		}
	}

	viewFile(history: any) {
		const index = this.historyList.findIndex((item: any) => item.id === history.id);

		if (index > -1) {
			this.filePreview = false;
			const media = this.mediaList[index];
			let details = this.fileDetails[0];

			details = {
				...details,
				mime_type: media?.mime_type || "Unknown",
				created_at: media?.created_at || null,
				updated_at: media?.updated_at || null,
				size: media?.size,
			};

			this.selectedFile.media = [{ ...media }];
			this.fileDetails = [{ ...details }];
			setTimeout(() => {
				this.filePreview = true;
			}, 0);
			this.cdr.detectChanges();
		}
	}

	getStructure(id: number) {
		this.isLoadingPage = true;
		this.docVisuService.selectedNavDocSection.pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				this.section = {
					...res,
					docSection: {
						...res?.docSection,
						model_type:
							res?.docSection?.model_type !== null
								? res?.docSection?.model_type?.split("\\").pop()
								: "",
					},
				};
			},
			error: () => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				this.isLoading = false;
			},
		});

		this.docVisuService
			.getStructureWithDirectories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.directories = res;
					this.directoryViewComponent?.buildTree(res);
					this.isLoadingPage = false;
				},
				error: () => {
					this.isStructureLoading = false;
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.isLoading = false;
					this.cdr.detectChanges();
				},
				complete: () => this.closeDialog(),
			});
	}

	handleCreateDocument = () => {
		this.filePreview = false;
		this.createDocuments = true;
	};

	handleAddFile = (rowData: any, tableId: string) => {
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.selectedFolderId = rowData.id;
		this.isNewVersion = false;
		this.isAddFileDialogOpen.elementRef.nativeElement.open = true;
		this.addFileDialogTitle = $localize`Add File`;
	};

	handleNewFolder = (rowData: any, tableId: string) => {
		this.disableButtonDuringRequest = false;
		this.valueState = "None";
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.selectedFolderId = rowData.id;
		this.newFolderDialogTitle = $localize`New Folder`;
		this.titleName = $localize`Folder Name`;
		this.isNewFolderDialogOpen.elementRef.nativeElement.open = true;
	};

	handleLink = (rowData: any, tableId: string) => {
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.selectedFolderId = rowData.id;
		this.parentLinkFolder = rowData;
		this.linkedStructure = undefined;

		this.isLinkDialogOpen.elementRef.nativeElement.open = true;
		this.isLoadingLink = false;
		this.clonedStructure = null;
		this.linkDialogTitle = $localize`Link Document`;
	};

	handleRename = (rowData: any, tableId: string) => {
		this.newFolderDialogTitle = $localize`Rename Folder`;
		this.titleName = $localize`Folder Name`;
		this.isUpdate = true;
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.selectedFolderId = rowData.id;
		this.folderName = rowData.name;
		this.isNewFolderDialogOpen.elementRef.nativeElement.open = true;
	};

	handleFileRename = (rowData: any) => {
		this.isFileDialogOpen = $localize`Rename File`;
		this.isUpdate = true;
		this.selectedRow = rowData;
		this.selectedFileId = rowData.media[0].id;
		this.fileName = rowData.name;
		this.isRenameFileDialogOpen.elementRef.nativeElement.open = true;
	};

	handleNewVersion = (rowData: any, tableId: string) => {
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.selectedFolderId = rowData.id;
		this.isNewVersion = true;
		this.isAddFileDialogOpen.elementRef.nativeElement.open = true;
		this.addFileDialogTitle = $localize`New Version`;
	};

	handleDelete = (rowData: any, tableId: string) => {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
		this.selectedRow = rowData;
		this.selectedId = tableId;
		this.folderName = rowData.name;
		this.selectedFolderId = rowData.id;
	};

	public onFolderSelect = (folder: any) => {
		this.selectedFolder = folder;
		this.selectedFile = null;
		this.selectedProcess = null;
		this.selectedSegment = "menu";
		let parentName = "Unknown";

		if (folder.parent_type === "App\\Models\\DocVisu\\DocVisuDirectory") {
			parentName = folder.parent_name;
		} else if (folder.parent_type === "App\\Models\\DocVisu\\DirectoryStructure") {
			parentName = this.directories?.name || "";
		}

		this.folderDetail = [
			{
				folder_name: folder.name,
				parent_name: parentName,
				created_at: folder.created_at,
				updated_at: folder.updated_at,
				version: `1`,
			},
		];

		this.filePreview = false;
		this.createDocuments = false;
	};

	public onFileSelect = (file: any) => {
		this.filePreview = false;
		this.cdr.detectChanges(); // Ensure Angular detects the change

		const media = file.media?.[file.media.length - 1];
		const versions = file.versions;
		const allMedia = file.allMedia;
		this.selectedFolder = null;
		this.selectedProcess = null;
		this.selectedFile = file;
		this.selectedSegment = "menu";

		// Populate file details
		this.fileDetails = [
			{
				file_name: file.name || "Unknown",
				mime_type: media?.mime_type || "Unknown",
				created_at: media?.created_at || null,
				creator: versions[0]?.creator?.name || "Unknown",
				updated_at: media?.updated_at || null,
				size: media?.size,
				version: versions?.length || "N/A",
			},
		];

		this.historyList = [...versions].sort((a, b) => {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});

		this.mediaList = [...allMedia].sort((a, b) => {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});

		this.filePreview = true;
		this.cdr.detectChanges(); // Apply the final change
	};

	public onProcessSelect = (process: any) => {
		this.selectedFile = null;
		this.selectedFolder = null;
		this.fileDetails = []; // Clear file details
		this.folderDetail = []; // Clear folder details
		this.selectedProcess = process;
		this.documentSectionName = "";
		this.directoryStructure = "";
		this.selectedSegment = "menu";

		// Find document section name
		if (
			process.sectionable_type.includes("DocVisu") ||
			!process.sectionable_type.includes("DocVisu")
		) {
			if (this.section) {
				this.documentSectionName = this.section?.name || this.section?.title || "Unknown";

				if (this.section.docSection && this.section.docSection.directory_structure) {
					this.directoryStructure =
						this.section.docSection.directory_structure.name ?? "Unknown";
				} else if (this.section.directory_structure) {
					this.directoryStructure = this.section.directory_structure.name ?? "Unknown";
				}
			}
		}

		this.processDetails = [
			{
				process_name: process.name,
				sectionable_type: process.sectionable_type?.split("\\").pop() || "Unknown",
				document_section: this.documentSectionName,
				directory_structure: this.directoryStructure,
				created_at: process.created_at,
				updated_at: process.updated_at,
			},
		];

		this.filePreview = false;
		this.createDocuments = false;

		this.docVisuService.selectedMedia.next(null);
		this.docVisuService.selectedFile.next(null);
	};

	onSegmentSelect(segment: string): void {
		this.selectedSegment = segment;
		this.cdr.detectChanges();
	}

	onBackButtonClick = () => {
		this.location.back();
	};

	checkRequiredComboboxes(): boolean {
		if (!this.sectionCombobox.element.value) {
			this.sectionCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.sectionCombobox.element.valueState = "None";
		}
		return true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
	}

	customClose() {
		this.isConfirmationModalOpen = true;
	}

	closeDialog() {
		this.isConfirmationModalOpen = false;
		this.inProgress = false;
		this.isUpdate = false;
		this.isLoading = false;
		this.folderName = "";
		this.tempFiles = [];
		this.attachmentCount = 0;
		this.deletedSavedFiles = [];
		this.selectedStandardFile = {};
		this.checkForNewAttachments = false;
		this.fileCount = 0;
		this.filename = "";
		this.fileNotes = "";
		this.isStructureLoading = false;
		this.addGroupDialog.elementRef.nativeElement.open = false;
		this.isNewFolderDialogOpen.elementRef.nativeElement.open = false;
		this.isRenameFileDialogOpen.elementRef.nativeElement.open = false;
		this.deleteDialog.elementRef.nativeElement.open = false;
		this.isLinkDialogOpen.elementRef.nativeElement.open = false;
		this.isAddFileDialogOpen.elementRef.nativeElement.open = false;
		this.sectionCombobox.element.value = "";
		this.directoryStructureComboBox.element.value = "";
		this.parentLinkFolder = null;
		this.clonedFileWithFolder = [];
		this.clonedStructure = null;
		this.filenameValueState = "None";
		this.selectedRow = undefined;
		this.selectedId = "";
		this.selectedFolderId = undefined;
		this.valueState = "None";
		this.isRenameFileDialogOpen.elementRef.nativeElement.open = false;
		this.disableButtonDuringRequest = false;
		this.cdr.detectChanges();
	}

	newNoteButtonClick() {
		this.disableButtonDuringRequest = false;
		this.isLoading = false;
		if (this.selectedFile === null) return;
		this.dialogTitle = $localize`New Note`;
		this.fileNotes = "";
		this.addGroupDialog.elementRef.nativeElement.open = true;
	}

	async onNoteSave() {
		this.isLoading = true;
		if (!this.selectedFile) return;

		try {
			await firstValueFrom(
				this.docVisuService.post(
					`doc-visu/files/${this.selectedFile.id}/notes`,
					{ notes: this.fileNotes },
					false
				)
			);

			this._toasterSrv.showToast(Localization.recordSavedSuccessfully, "success");
		} catch (error) {
			this._toasterSrv.showToast(Localization.failedToSaveData, "error-toaster");
		} finally {
			this.isLoading = false;
			this.closeDialog();
			await this.getNotes();
		}
		this.cdr.detectChanges();
	}

	async getNotes() {
		this.isLoading = true;

		try {
			const res: any = await firstValueFrom(
				this.docVisuService.get(
					`DocVisuFiles/${this.selectedFile.id}?$expand=notes($expand=creator($select=id,name))`
				)
			);

			this.selectedFile.notes = res.notes;
		} catch (error) {
			this._toasterSrv.showToast(Localization.failedToSaveData, "error-toaster");
		} finally {
			this.isLoading = false;
		}
	}

	closeDialogDelete() {
		this.isUpdate = false;
		this.folderName = "";
		this.selectedRow = undefined;
		this.selectedId = "";
		this.inProgress = false;
		this.selectedFolderId = undefined;
		this.deleteDialog.elementRef.nativeElement.open = false;
		this.cdr.detectChanges();
	}

	cancelButton() {
		this.filePreview = false;
		this.selectedFile = undefined;

		this.closeDialog();

		this.filePreview = true;
		this.cdr.detectChanges();
	}

	renameFile() {
		this.isLoading = true;
		if (!this.fileName || this.fileName.trim().length < 1) {
			this.filenameValueState = "Negative";
			this.inProgress = false;
			return;
		} else {
			this.filenameValueState = "None";
		}
		this.inProgress = true;
		this.docVisuService
			.patch(`Media/${this.selectedFileId}`, {
				name: this.fileName.trim(),
			})
			.subscribe({
				next: (res: any) => {
					this.isLoading = false;
					this._toasterSrv.showToast(Localization.recordSavedSuccessfully, "success");
					this.getStructure(this.processId);
					this.closeDialog();
				},
				error: (err: any) => {
					this.isLoading = false;
					this._toasterSrv.showToast(Localization.failedToSaveData, "error-toaster");
					this.closeDialog();
				},
			});
	}

	onChangeFolderNameInput(event: any) {
		this.folderName = event.target.value.trim();
		if (!this.folderName) {
			this.valueState = "Negative";
		} else {
			this.valueState = "None";
		}
	}

	createNewFolder() {
		this.isLoading = true;
		if (!this.folderName || this.folderName.trim().length < 1) {
			this.valueState = "Negative";
			this.disableButtonDuringRequest = false;
			this.isLoading = false;
			return;
		} else {
			this.valueState = "None";
		}

		if (this.disableButtonDuringRequest) return;

		this.disableButtonDuringRequest = true;
		this.folderName = this.folderName.trim();

		const { recordSavedSuccessfully, failedToSaveData } = Localization;

		if (this.selectedRow && this.selectedRow.custom_id) {
			this.docVisuService
				.createRootFolder(this.folderName, this.processId)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.disableButtonDuringRequest = false;
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");
						this.getStructure(this.processId);
						this.closeDialog();
					},
					error: err => {
						this._toasterSrv.showToast(failedToSaveData, "error-toaster");
						this.closeDialog();
						this.isLoading = false;
						this.cdr.detectChanges();
					},
				});
		} else if (this.selectedRow) {
			this.docVisuService
				.createSubFolder(this.folderName, this.selectedFolderId!, this.isUpdate)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.disableButtonDuringRequest = false;
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");
						this.getStructure(this.processId);
						this.closeDialog();
					},
					error: err => {
						this.isLoading = false;
						this._toasterSrv.showToast(failedToSaveData, "error-toaster");
						this.closeDialog();
					},
				});
		} else {
			this.isLoading = false;
			this.disableButtonDuringRequest = false;
		}
	}

	deleteFolderOrFile() {
		if (this.inProgress) return;
		this.inProgress = true;
		this.isLoading = true;
		const { recordDeleted, someThingWentWrong } = Localization;
		if (this.selectedRow) {
			if (this.selectedRow.custom_id) {
				this.docVisuService
					.deleteFile(this.selectedRow.id)
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (res: any) => {
							this.inProgress = false;
							this.isLoading = false;
							this._toasterSrv.showToast(recordDeleted, "success");
							this.directoryViewComponent!.selectedTreeIndex = "0";
							this.getStructure(this.processId);
							this.closeDialogDelete();
						},
						error: () => {
							this.inProgress = false;
							this.isLoading = false;
							this._toasterSrv.showToast(someThingWentWrong, "error-toaster");
							this.closeDialogDelete();
						},
					});
			} else {
				this.docVisuService
					.deleteFolder(this.selectedFolderId!)
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (res: any) => {
							this.inProgress = false;
							this.isLoading = false;
							this._toasterSrv.showToast(recordDeleted, "success");
							this.directoryViewComponent!.selectedTreeIndex = "0";
							this.getStructure(this.processId);
							this.closeDialogDelete();
						},
						error: () => {
							this.inProgress = false;
							this.isLoading = false;
							this._toasterSrv.showToast(someThingWentWrong, "error-toaster");
							this.closeDialogDelete();
						},
					});
			}
		}
	}

	getStructureByQuery$(data: any) {
		let id = data.id;
		let model = this.docSection.model_type;

		if (model && id) {
			return this.docVisuService.getStructureByFilter(
				`sectionable_type=${model}&sectionable_id=${id}`
			);
		} else {
			model = "App\\Models\\DocVisu\\DocumentSection";
			const modelId = this.docSection?.id;
			return this.docVisuService.getStructureByFilter(
				`sectionable_type=${model}&sectionable_id=${modelId}&id=${id}`
			);
		}
	}

	processClick = (param: any) => {};

	onChangeDirectoryStructure(data: any) {
		this.isStructureLoading = true;
		const comboBox = data.target;
		const selectedValue = comboBox.value;

		const selectedItem = this.directoryStructures.find(
			(item: any) => item.name === selectedValue
		);

		if (!selectedItem) {
			this._toasterSrv.showToast(
				$localize`Invalid selection. Please try again.`,
				"error-toaster"
			);
			this.isStructureLoading = false;
			this.cdr.detectChanges();
			return;
		}

		const request$ = this.getStructureByQuery$(selectedItem);

		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					/// Get directory
					this.docVisuService
						.getStructureWithDirectories(directoryStructure.id!)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (structure: any) => {
								this.linkedStructure = undefined;

								setTimeout(() => {
									this.linkedStructure = structure;
									this.cdr.detectChanges();
								}, 0);

								if (structure.directories.id) {
									this.docVisuService
										.getStructureByFilter(`id=${structure.directories.id}`)
										.subscribe({
											next: (data: any) => {
												if (data && data.length > 0) {
													this.docSectionStructure = data[0];
													this.getStructureWithDirectories(
														this.docSectionStructure.id
													);
												}
												this.isStructureLoading = false;
												this.cdr.detectChanges();
											},
											error: e => {
												this._toasterSrv.showToast(
													Localization.someThingWentWrong,
													"error-toaster"
												);
												this.isStructureLoading = false;
												this.cdr.detectChanges();
											},
										});
								}

								const firstDirectory = structure.directories?.[0];
								const firstFile = firstDirectory?.files?.[0];
								const details = {
									file_name:
										firstFile?.media?.[0]?.name ||
										firstDirectory?.name ||
										"N/A",
									model_type: firstFile?.parent_type || "Unknown",
									created_at:
										firstFile?.created_at ||
										firstDirectory?.created_at ||
										"N/A",
									creator: firstFile?.creator || "System",
									updated_at:
										firstFile?.updated_at ||
										firstDirectory?.updated_at ||
										"N/A",
									size: firstFile?.size || "Unknown",
									version: firstFile?.version || "1.0",
								};
								this.folderDetails = [details];
								this.isStructureLoading = false;
								this.cdr.detectChanges();
							},
							error: e => {
								this._toasterSrv.showToast(
									Localization.someThingWentWrong,
									"error-toaster"
								);
								this.isStructureLoading = false;
								this.cdr.detectChanges();
							},
						});
				} else {
					this.itemName = data.name || "Default Name";
					if (!this.itemName || !this.directory) {
						this._toasterSrv.showToast(
							$localize`Missing required data to assign a directory structure.`,
							"error-toaster"
						);
						this.linkedStructure = undefined;
					}
					this.isStructureLoading = false;
					this.cdr.detectChanges();
				}
			},
			error: () => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				this.isStructureLoading = false;
				this.cdr.detectChanges();
			},
		});
	}

	getStructureWithDirectories(id: number) {
		this.isStructureLoading = true;
		this.docVisuService.getStructureWithDirectories(id).subscribe({
			next: (data: any) => {
				this.directory = data as IDirectory;
			},
			error: e => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				this.closeDialog();
			},
			complete: () => {
				this.isStructureLoading = false;
				this.cdr.detectChanges();
			},
		});
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchDirectoryStructureData = this.directoryStructures.find(
			data => data.name === inputValue
		);
		if (!matchDirectoryStructureData && this.selectedDocumentSection?.directoryStructure) {
			this.selectedDocumentSection.directoryStructure = new DirectoryStructure().deserialize({
				id: null,
				name: "",
			});
		}
		if (this.selectedDocumentSection?.directoryStructure?.id) {
			this.getStructureWithDirectories(this.selectedDocumentSection.directoryStructure.id);
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
			const id = event.target.id;
			switch (id) {
				case "directoryStructureComboBox":
					this.selectedDocumentSection.directoryStructure =
						new DirectoryStructure().deserialize({
							id: null,
						});
					break;
				default:
					break;
			}
		} else {
			event.target.value = value;
		}
	}

	onAttachmentChanges(data: any, type: string) {
		if (data.length > 0) {
			this.filename = data[0].name.trim();
			this.filenameValueState = "None";
		} else {
			this.filename = "";
		}

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

	onChangeFileNameInput(event: any) {
		this.filename = event.target.value.trim();
		if (!this.filename) {
			this.filenameValueState = "Negative";
		} else {
			this.filenameValueState = "None";
		}
	}

	async uploadAttachments(): Promise<void> {
		try {
			this.isLoading = true;
			if (!this.tempFiles || this.tempFiles.length === 0) {
				this.filenameValueState = "Negative";
				return;
			}
			if (!this.filename || this.filename.trim() === "") {
				this.filenameValueState = "Negative";
				return;
			}
			this.filenameValueState = "None";
			await this.uploadTempFiles();
		} finally {
			this.isLoading = false;
		}
		this.getStructure(this.processId);
	}

	onChangeNotes(data: any) {
		this.fileNotes = data;
	}

	uploadTempFiles(isNewVersion: boolean = this.isNewVersion): Promise<void> {
		return new Promise((resolve, reject) => {
			let count = 0;
			this.tempFiles.forEach((file: any, index: number) => {
				const formData = new FormData();

				formData.append("parent_type", this.directoryModel);
				formData.append("parent_id", `${this.selectedFolderId}`);
				formData.append("media", file);
				formData.append("filename", this.filename);
				formData.append("notes", this.fileNotes);

				if (isNewVersion) {
					this.docVisuService
						.updateFile(this.selectedRow.id, formData)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (res: any) => {
								count++;
								this.attachmentCount++;
								this.docVisuService
									.get(
										`DocVisuFiles/${this.selectedRow.id}?expand=versions($expand=creator($select=id,name)),media($expand=creator($select=id,name))`
									)
									.subscribe({
										next: (response: any) => {
											const sortedMedia = [...response.media].sort(
												(a, b) =>
													new Date(b.created_at).getTime() -
													new Date(a.created_at).getTime()
											);

											const latestMedia = sortedMedia[0];
											const mimeType =
												latestMedia.mime_type?.toLowerCase() || "";

											let icon = "document";
											if (mimeType.includes("image"))
												icon = "attachment-photo";
											else if (mimeType.includes("pdf"))
												icon = "pdf-attachment";
											else if (mimeType.includes("word"))
												icon = "doc-attachment";
											else if (mimeType.includes("excel"))
												icon = "excel-attachment";
											else if (mimeType.includes("powerpoint"))
												icon = "ppt-attachment";
											else if (mimeType.includes("audio"))
												icon = "attachment-audio";
											else if (mimeType.includes("video"))
												icon = "attachment-video";
											else if (mimeType.includes("zip"))
												icon = "attachment-zip-file";
											else if (mimeType.includes("text"))
												icon = "attachment-text-file";

											const data = {
												...response,
												name: latestMedia.name,
												icon: icon,
												mimeType: mimeType,
												media: [latestMedia],
												allMedia: sortedMedia,
											};

											this.onFileSelect(data);
										},
									});
								if (count === this.tempFiles.length) resolve();
							},
							error: err => {
								count++;
								if (count === this.tempFiles.length) reject(err);
							},
						});
				} else {
					this.docVisuService
						.post("doc-visu/files", formData, false)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (res: any) => {
								count++;
								this.attachmentCount++;
								if (count === this.tempFiles.length) resolve();
							},
							error: err => {
								count++;
								if (count === this.tempFiles.length) reject(err);
							},
						});
				}
			});
		});
	}

	loadDocumentSections() {
		this.getDocumentSections().subscribe(
			(data: any) => {
				if (data && data.length > 0) {
					this.documentSections = data.map((item: any) => {
						return {
							...item,
							slug: item.name
								.trim()
								.toLowerCase()
								.replace(/[^a-zA-Z0-9]+/g, "-")
								.replace(/^-+|-+$/g, ""),
						};
					});
				}
			},
			error => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
			}
		);
	}

	getDocumentSections() {
		return this.docVisuService.getDocumentSectionNavItems();
	}

	onChangeSelectionSection(event: any) {
		this.sectionCombobox.element.valueState = "None";
		const comboBox = event.target;
		const selectedValue = comboBox.value;
		// TODO: Need to change, use native element ref or try to change implementation
		const selectedItem = comboBox.querySelector(`ui5-cb-item[text="${selectedValue}"]`);

		if (selectedItem) {
			const selectedId = selectedItem.getAttribute("id");
			const docSection = this.documentSections.find(
				(section: any) => section.id == selectedId
			);
			if (docSection) {
				const docSectionModelName = "App\\Models\\DocVisu\\DocumentSection";
				this.docSection = docSection;
				if (docSection.model_type) {
					const modelType = docSection.model_type;
					const models = BackendModelTypeClass.getEnumArrayDocVisu();

					const model = models.find((m: any) => m.modelType === modelType);

					if (model && model.modelType && model.route) {
						this.endPoint = model.route;
						this.filterQuery = `is_active eq true`;
					}

					switch (model?.modelType) {
						case BackendModelType.MACHINE:
							this.filterQuery = `${this.filterQuery} and plant_id eq ${this.plantId}`;
							break;
						case BackendModelType.SERIAL_NUMBER_PROFILE:
							this.filterQuery = ``;
							break;
						case BackendModelType.STORAGE_LOCATION:
							this.filterQuery = `${this.filterQuery} and plant_id eq ${this.plantId}`;
							break;
						case BackendModelType.QUALIFICATION:
							this.filterQuery = ``;
							break;
						case BackendModelType.ITEM:
							this.endPoint = `Plants(${this.plantId})/items`;
							this.filterQuery = `${this.filterQuery} and (is_tool ne true or is_tool eq null)`;
							break;
						default:
							break;
					}
				} else {
					this.endPoint = `DirectoryStructures`;
					this.filterQuery = `is_active eq true and sectionable_id eq ${selectedId} & sectionable_type eq ${docSectionModelName}`;
				}
				this.directoryStructureComboBox.element.value = "";
				this.fetchData();
			}
		}
	}

	fetchData() {
		this.isSelectStructure = true;
		this.docVisuService.get(`${this.endPoint}?$filter=${this.filterQuery}`).subscribe({
			next: (data: any) => {
				this.directoryStructures = data.value || [];
			},
			error: err => {
				console.error("API Error:", err);
			},
			complete: () => {
				this.isSelectStructure = false;
				this.cdr.detectChanges();
			},
		});
	}

	fileClick = (file: any): void => {
		if (file) {
			if (!this.clonedStructure) {
				this.clonedStructure = {
					directories: [],
					files: [],
					id: 0,
					name: this.parentLinkFolder.name,
				};
			}

			if (this.clonedStructure.files.find((f: any) => f.id === file.id)) {
				return;
			}

			this.clonedFileWithFolder.push({
				linkable_type: "App\\Models\\DocVisu\\DocVisuFile",
				linkable_id: file.id,
			});
			this.clonedStructure.files.push(file);

			const temp = structuredClone(this.clonedStructure);
			this.clonedStructure = null;
			setTimeout(() => {
				this.clonedStructure = structuredClone(temp);
			}, 0);
		}
	};

	folderClick = (folder: any): void => {
		if (folder) {
			if (!this.clonedStructure) {
				this.clonedStructure = {
					directories: [],
					files: [],
					id: 0,
					name: this.parentLinkFolder.name,
				};
			}

			if (this.clonedStructure.directories.find((dir: any) => dir.id === folder.id)) {
				return;
			}

			this.clonedFileWithFolder.push({
				linkable_type: "App\\Models\\DocVisu\\DocVisuDirectory",
				linkable_id: folder.id,
			});

			this.clonedStructure.directories.push({ ...folder });

			const temp = structuredClone(this.clonedStructure);
			this.clonedStructure = null;
			setTimeout(() => {
				this.clonedStructure = structuredClone(temp);
			}, 0);
		}
	};

	onSaveCloned() {
		if (!this.checkRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			return;
		}

		if (!this.clonedStructure) {
			this._toasterSrv.showToast(
				$localize`Please select a document structure before saving.`,
				"error-toaster"
			);
			return;
		}

		this.isLoadingLink = true;
		const links = [];
		const parent_type =
			this.parentLinkFolder.parent_type === "App\\Models\\DocVisu\\DocVisuDirectory" ||
			this.parentLinkFolder.parent_type === "App\\Models\\DocVisu\\DirectoryStructure"
				? "App\\Models\\DocVisu\\DocVisuDirectory"
				: "App\\Models\\DocVisu\\DirectoryStructure";

		const parent_id = this.parentLinkFolder.id;

		for (let i = 0; i < this.clonedFileWithFolder.length; i++) {
			links.push({
				linkable_type: this.clonedFileWithFolder[i].linkable_type,
				linkable_id: this.clonedFileWithFolder[i].linkable_id,
				parent_type: parent_type,
				parent_id: parent_id,
			});
		}
		this.docVisuService.linksDirectories({ links: links }).subscribe({
			next: (data: any) => {
				this._toasterSrv.showToast(
					$localize`Link created successfully.`,
					"success-toaster"
				);
				this.getStructure(this.processId);
				this.sectionCombobox.element.value = "";
				this.directoryStructureComboBox.element.value = "";
				this.sectionCombobox.element.valueState = "None";
				this.parentLinkFolder = null;
				this.clonedFileWithFolder = [];
				this.clonedStructure = null;
			},
			error: e => {
				this._toasterSrv.showToast($localize`Failed to create link.`, "error-toaster");
			},
		});
	}
}

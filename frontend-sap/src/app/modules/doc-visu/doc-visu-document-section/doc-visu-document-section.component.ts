import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgModel } from "@angular/forms";

import { Subject, takeUntil } from "rxjs";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import { DocumentSection } from "@app/shared/models/document-section.model";
import { Localization } from "@app/shared/utils/common-localize";
import { DirectoryStructure } from "@app/shared/models/directory-structure.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { IDirectory } from "@app/shared/interfaces/directory.interface.";
import { PlantsService } from "@app/shared/services/plants.service";

import { DocVisuService } from "@doc-visu/doc-visu.service";
import { AuthService } from "@app/shared/services/auth.service";

@Component({
	selector: "app-doc-visu-document-section",
	templateUrl: "./doc-visu-document-section.component.html",
	styleUrl: "./doc-visu-document-section.component.css",
})
export class DocVisuDocumentSectionComponent implements OnInit, OnDestroy {
	isLoadingpage: boolean = false;
	public localization = Localization;
	public title = $localize`Folder Structure`;
	public processList: {}[] = [];
	public tableTitle = " ";
	public endPoint = "";
	public itemName: string = "";
	public filterQuery: string = "";
	public useFilter: boolean = true;
	public usePlantId: boolean = false;
	disableButtonDuringRequest: boolean = false;
	isActive: boolean = true;
	isPrepared: boolean = false;
	public gridColumns: {}[] = [
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
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableGroupBy: true,
			dataType: GridTableColumnDataType.String,
			hAlign: "Left",
			isSelected: true,
			disableResizing: false,
		},
	];
	public canAddNew: boolean = false;
	public isLoading: boolean = true;
	public isLoadingData: boolean = false;
	public isStructureLoading: boolean = false;
	public selectedProcessItem: any = null;
	private docSectionStructure: any = null;
	public directory?: IDirectory;

	onEditClick = (rowData: any) => {
		this.isLoading = false;
		const data = rowData.original ? rowData.original : rowData;
		this.selectedProcessItem = { ...data };
		this.editProcessDialog.elementRef.nativeElement.open = true;
		this.itemName = this.selectedProcessItem.name;
		const request$ = this.getStructureByQuery$(data);
		request$.subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.itemName = directoryStructure.name;
					this.isActive = directoryStructure.is_active;
					this.cdr.detectChanges();
					this.isLoading = false;
				} else {
					this.itemName = data.name;
				}
			},
			error: e => {
				this.editProcessDialog.elementRef.nativeElement.open = false;
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
			},
		});
	};

	public onDoubleClick = (rowData: any): void => {
		const disabled = this.actionButtons[1].disable();
		if (disabled) return;
		this.onEditClick(rowData);
	};

	public actionButtons = [
		{
			id: "view",
			icon: "inspection",
			disable: () => false,
			onClick: (rowData: any) => {
				const data = rowData.original;
				this.gotoDetails(data);
			},
		},
		{
			id: "edit",
			icon: "edit",
			disable: () => false,
			onClick: this.onEditClick,
		},
		{
			id: "copy",
			icon: "copy",
			disable: () => true,
			onClick: (rowData: any) => {
				const data = rowData.original;
				this.selectedProcessItem = { ...data };
			},
		},
		{
			id: "delete",
			icon: "delete",
			disable: () => false,
			onClick: (rowData: any) => {
				const data = rowData.original;
				this.selectedProcessItem = { ...data };
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.deleteProcessDialog.elementRef.nativeElement.open = true;
			},
		},
	];
	public plantId: number = 0;
	public detailsOnProcess: boolean = false;

	directoryStructures: DirectoryStructure[] = [];
	selectedDocumentSection: DocumentSection = new DocumentSection().deserialize({});
	docSection?: any;
	private destroy$ = new Subject<void>();

	@ViewChild("directoryStructureComboBox") directoryStructureComboBox!: ComboBoxComponent;
	@ViewChild("addNewDialog", { static: false }) addNewDialog: any;
	@ViewChild("editProcessDialog", { static: false }) editProcessDialog: any;
	@ViewChild("consumptionChildComponentRef") consumptionChildComponentRef?: CustomReactGridTable;
	@ViewChild("deleteProcessDialog", { static: false }) deleteProcessDialog: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		public _toasterSrv: ToastService,
		private docVisuService: DocVisuService,
		public authService: AuthService,
		private cdr: ChangeDetectorRef,
		private plantsService: PlantsService
	) {
		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});

		this.selectedDocumentSection = new DocumentSection().deserialize({});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.loadData();
	}

	ngAfterViewInit(){
		this.docVisuService.selectedNavDocSection
		.pipe(takeUntil(this.destroy$))
		.subscribe({
			next: (docSection: any) => {
				if (docSection) {
					this.isPrepared = false;
					const docSectionModelName = "App\\Models\\DocVisu\\DocumentSection";
					this.docSection = docSection;
					if (docSection.model_type) {
						this.canAddNew = false;
						const modelType = docSection.model_type;
						const models = BackendModelTypeClass.getEnumArrayDocVisu();

						const model = models.find((m: any) => m.modelType === modelType);
						this.actionButtons[1].disable = () => true;
						this.actionButtons[2].disable = () => true;
						this.actionButtons[3].disable = () => true;
						this.useFilter = true;
						this.usePlantId = false;
						this.filterQuery = ``;
						if (model && model.modelType && model.route) {
							this.endPoint = model.route;
						}

						switch (model?.modelType) {
							case BackendModelType.MACHINE:
								this.usePlantId = true;
								break;
							case BackendModelType.SERIAL_NUMBER_PROFILE:
								this.useFilter = false;
								break;
							case BackendModelType.STORAGE_LOCATION:
								this.usePlantId = true;
								break;
							case BackendModelType.QUALIFICATION:
								this.useFilter = false;
								break;
							case BackendModelType.ITEM:
								this.endPoint = `/Plants(${this.plantId})/items`;
								this.filterQuery = `(is_tool ne true or is_tool eq null)`;
								break;
							case BackendModelType.TOOL:
								this.endPoint = "/Items";
								this.filterQuery = `is_tool eq true`;
								break;
							default:
								break;
						}
					} else {
						this.actionButtons[1].disable = () => false;
						this.actionButtons[2].disable = () => true;
						this.actionButtons[3].disable = () => false;
						this.canAddNew = true;
						this.endPoint = `/DirectoryStructures`;
						this.filterQuery = `sectionable_id eq ${docSection?.id} & sectionable_type eq ${docSectionModelName}`;
					}
					this.tableTitle = docSection.name;

					if (docSection?.directory_structure_id) {
						this.docVisuService
							.getStructureByFilter(`id=${docSection?.directory_structure_id}`)
							.subscribe({
								next: (data: any) => {
									if (data && data.length > 0) {
										this.docSectionStructure = data[0];
										this.getStructureWithDirectories(
											this.docSectionStructure.id
										);
									}
								},
								error: e => {
									this._toasterSrv.showToast(
										Localization.someThingWentWrong,
										"error-toaster"
									);
									this.closeDialog();
								},
							});
					}
					try {
						this.consumptionChildComponentRef!.url = this.endPoint;
						this.consumptionChildComponentRef!.headerTitle = docSection?.name ?? '';
						this.consumptionChildComponentRef!.customActionButtons = this.actionButtons;
						this.consumptionChildComponentRef!.filterQuery = this.useFilter
							? this.filterQuery
							: "";
						this.consumptionChildComponentRef!.showActiveButton = this.useFilter;
						this.consumptionChildComponentRef!.plantId = this.usePlantId
							? this.plantId
							: undefined;
		
						this.consumptionChildComponentRef?.onFilterAndSorting();
					} catch (error) {
						
					}
					this.isPrepared = true;
				} else {
					this.canAddNew = false;
					this.docSection = null;
				}

			},
			error: e => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				this.closeDialog();
			},
		});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.consumptionChildComponentRef?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	loadData() {
		this.docVisuService
			.getDirectoryStructures()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: any) => {
					this.directoryStructures = data?.map((directoryStructure: DirectoryStructure) =>
						new DirectoryStructure().deserialize(directoryStructure)
					);
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.closeDialog();
				},
			});
	}

	processClick = (param: any) => {};

	getStructureWithDirectories(id: number) {
		this.isStructureLoading = true;
		this.docVisuService
			.getStructureWithDirectories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (structure: any) => {
					this.directory = undefined;
					setTimeout(() => {
						this.directory = structure;
					}, 0);
					this.isStructureLoading = false;
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.closeDialog();
				},
			});
	}

	onCreateItem(nameInput: NgModel) {
		this.isLoading = true;
		this.addNewDialog.elementRef.nativeElement.isBusy = false;
		this.docVisuService
			.createDirectoryStructure(
				this.itemName,
				this.docSection?.id!,
				this.isActive,
				this.directory
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.createPopUpClose(nameInput);
					this._toasterSrv.showToast(Localization.recordSavedSuccessfully, "success");
					this.filterHandler();
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.createPopUpClose(nameInput);
				},
			});
	}

	newButtonClick() {
		this.isLoading = false;
		this.selectedDocumentSection.directoryStructure = this.docSectionStructure;
		this.addNewDialog.elementRef.nativeElement.open = true;
		this.isActive = true;
	}

	closeDialog() {
		this.isLoading = false;
		this.itemName = "";
		this.selectedProcessItem = null;
		this.disableButtonDuringRequest = false;
		this.editProcessDialog.elementRef.nativeElement.open = false;
		this.deleteProcessDialog.elementRef.nativeElement.open = false;
	}

	createPopUpClose(nameInput: NgModel) {
		this.isLoading = false;
		this.itemName = "";
		nameInput.reset("");
		this.addNewDialog.elementRef.nativeElement.open = false;
	}

	updateProcess() {
		if (this.itemName.trim().length === 0 || this.isLoading) return;
		this.isLoading = true;
		this.docVisuService
			.updateProcess(this.itemName, this.selectedProcessItem?.id, this.isActive)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.closeDialog();
					this.filterHandler();
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.closeDialog();
				},
			});
	}

	createProcess(nameInput: NgModel) {
		if (this.itemName.trim().length === 0 || this.isLoading) {
			nameInput.control.markAsTouched();
			return;
		}
		this.onCreateItem(nameInput);
	}

	deleteProcess() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		if (!this.selectedProcessItem) return;
		this.docVisuService
			.deleteProcess(this.selectedProcessItem?.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
					this._toasterSrv.showToast(recordDeleted, "success");
					this.filterHandler();
					this.closeDialog();
				},
				error: e => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
					this.closeDialog();
				},
			});
	}

	onChangeDirectoryStructure(event: any) {
		if (this.selectedDocumentSection?.directoryStructure) {
			this.selectedDocumentSection.directoryStructure = new DirectoryStructure().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
		} else {
			this.selectedDocumentSection = new DocumentSection().deserialize({});

			this.selectedDocumentSection.directoryStructure = new DirectoryStructure().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
		}
		this.getStructureWithDirectories(this.selectedDocumentSection.directoryStructure?.id!);
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
		this.getStructureWithDirectories(this.selectedDocumentSection.directoryStructure?.id!);
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

	getStructureByQuery$(data: any) {
		let id = data.id;
		let model = this.docSection?.model_type;

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

	gotoDetails(data: any) {
		if (this.detailsOnProcess) return;
		const request$ = this.getStructureByQuery$(data);
		this.detailsOnProcess = true;
		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (this.editProcessDialog.elementRef.nativeElement.open) return;
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.router.navigate([`./${directoryStructure.id}/details`], {
						relativeTo: this.route,
					});
					this.detailsOnProcess = false;
				} else {
					this.itemName = data.name;

					this.docVisuService
						.assignDirectoryStructure(
							this.itemName,
							this.docSection?.model_type!,
							data.id,
							this.directory
						)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (data: any) => {
								this.detailsOnProcess = false;
								this.router.navigate([`./${data.id}/details`], {
									relativeTo: this.route,
								});
							},
							error: e => {
								this.detailsOnProcess = false;
								this._toasterSrv.showToast(
									Localization.someThingWentWrong,
									"error-toaster"
								);
							},
						});
				}
			},
			error: e => {
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				this.closeDialog();
			},
		});
	}

	handleRowClick(event: any) {
		if (this.detailsOnProcess) return;
		const data = event.detail.row.original;
		this.gotoDetails(data);
	}
}

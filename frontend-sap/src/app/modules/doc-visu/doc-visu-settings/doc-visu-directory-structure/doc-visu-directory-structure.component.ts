import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";

import { Subject, takeUntil } from "rxjs";

import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { DirectoryStructure } from "@app/shared/models/directory-structure.model";
import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";

import { DocVisuService } from "@doc-visu/doc-visu.service";

@Component({
	selector: "app-doc-visu-directory-structure",
	templateUrl: "./doc-visu-directory-structure.component.html",
	styleUrl: "./doc-visu-directory-structure.component.css",
})
export class DocVisuDirectoryStructureComponent implements OnDestroy {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("departmentSettingsTab") departmentSettingsTab!: ElementRef;
	@ViewChild("directoryStructureTab") directoryStructureTab!: ElementRef;
	@ViewChild("createOrUpdateForm") form?: NgForm;

	selectedStructureList: DirectoryStructure = new DirectoryStructure().deserialize({});
	isDialogOpen: boolean = false;
	dialogTitle: string = "";
	isLoading: boolean = false;
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	customIdValueStateText: string = Localization.invalidEntry;
	customIdState: keyof typeof ValueState = "None";
	isUpdate?: boolean;
	cachedCustomId?: string = "";
	customId?: string;
	selectedStructureId: number = 0;
	selectedRow: any = null;
	folderName: string = "";
	structureName: string = "";
	isActive: boolean = false;
	previousActiveStatus: boolean = false;
	valueState: "Negative" | "None" = "None";
	apiUrl: string = "/doc-visu/directory-structures";

	columns: any = [
		{
			Header: this.localization.name,
			accessor: "name",
			isSelected: true,
			minWidth: 200,
			disableFilters: false,
			disableGroupBy: true,
		},
	];

	@ViewChild("deleteStructureDialog", { static: false }) deleteStructureDialog: any;
	private destroy$ = new Subject<void>();

	constructor(
		public authService: AuthService,
		public _toasterSrv: ToastService,
		private docVisuService: DocVisuService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.docVisuService.selectedStructureId.next(0);
		this.getCustomId();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	selectFirstRowIfNeeded(): void {
		if (this.childComponent && this.childComponent.data.length) {
			const newRow = this.childComponent.data.find(
				(item: any) => item.id === this.selectedRow?.id
			);
	
			if (newRow) {
				const index = this.childComponent.data.indexOf(newRow);
				this.childComponent!.selectedRowsId = { [index]: true };
				this.handleRowClick({
					detail: { isSelected: true, row: { original: newRow } },
				});
				this.childComponent?.render();
			} else {
				// Fallback: select first row if new row isn't found
				const firstRow = this.childComponent.data[0];
				if (firstRow) {
					this.childComponent!.selectedRowsId = { 0: true };
					this.handleRowClick({ detail: { isSelected: true, row: { original: firstRow } } });
					this.childComponent?.render();
				}
			}
		}
	}

	handleRowClick = (event: any) => {
		if (event.detail.isSelected) {		
			this.valueState = "None";	
			this.selectedRow = event.detail.row.original as any;
			this.isActive = event.detail.row.original.is_active ? true : false;
			this.previousActiveStatus = this.isActive;
			this.folderName = event.detail.row.original.name;
			this.structureName = event.detail.row.original.name;
			this.selectedStructureId = event.detail.row.original.id;
			this.docVisuService.selectedStructureId.next(this.selectedStructureId);
		} else {
			this.selectedStructureId = 0;
			this.valueState = "None";
			this.folderName = "";
			this.structureName = "";
			this.isActive = false;
			this.selectedRow = null;
			this.docVisuService.selectedStructureId.next(0);
		}
	};

	closeDialog() {
		this.isDialogOpen = false;
		this.deleteStructureDialog.elementRef.nativeElement.open = false;
		(this.form as any).onReset();
	}

	openDeleteStructureDialog() {
		this.deleteStructureDialog.elementRef.nativeElement.open = true;
	}

	deleteStructure() {
		if (this.selectedStructureId != 0) {
			this.isLoading = true;
			this.docVisuService
				.delete(`DirectoryStructures(${this.selectedStructureId})`)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.selectedRow = null;
						this.selectedStructureId = 0;
						this.folderName = "";
						this.structureName = "";
						this.docVisuService.selectedStructureId.next(0);
						this.filterHandler();
						this._toasterSrv.showToast(Localization.recordDeleted, "success");
						this.isLoading = false;
						this.closeDialog();
					},
					error: () => {
						this._toasterSrv.showToast(
							Localization.someThingWentWrong,
							"error-toaster"
						);
						this.isLoading = false;
						this.closeDialog();
					},
				});
		}
	}

	onIsActiveChange(event: any): void {
		this.isActive = event.target.checked;
	}
	 
	onChangeStructureNameInput(event: any) {
		this.structureName = event.target.value.trim();
		if (!this.structureName) {
			this.valueState = "Negative";
		} else {
			this.valueState = "None";
		}
	}

	updateStructure() {	
		this.disableButtonDuringRequest = true;
		if (!this.structureName || this.structureName.trim().length < 1) {
			this.valueState = "Negative";
			this.disableButtonDuringRequest = false;
			return;
		}else {		
			this.valueState = "None";
		}
	
		if (this.selectedStructureId != 0) {
			this.isLoading = true;
			this.docVisuService
				.put(`DirectoryStructures/${this.selectedStructureId}`, {
					name: this.structureName,
					is_active: this.isActive,
				})
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						const { recordSavedSuccessfully } = Localization;
						this.selectedRow = res;
						this.folderName = "";
						this.structureName = "";
						this.isActive = false;
						this.previousActiveStatus = this.isActive;
						this.docVisuService.selectedStructureId.next(this.selectedStructureId);
						this.filterHandler();
						this.isLoading = false;
						this.disableButtonDuringRequest = false;
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");		
					},
					error: () => {
						this.disableButtonDuringRequest = false;
						this.isLoading = false;
					},
				});
		}
	}

	newButtonClick() {
		this.disableButtonDuringRequest = false;
		this.isLoading = false;
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.selectedStructureList = new DirectoryStructure().deserialize({});
		this.selectedStructureList.custom_id = this.customId;
		this.customIdState = "None";
		if (!this.customId) {
			this.selectedStructureList.custom_id = "";
			this.getCustomId();
		}
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}

		const customId = this.selectedStructureList.custom_id?.trim();
		this.selectedStructureList.custom_id = customId;

		this.checkCustomId();
	}

	checkCustomId() {
		const result = this.docVisuService.customIdValidation(
			this.customId || "",
			this.selectedStructureList.custom_id || ""
		);
		const urlString = `DirectoryStructures?$filter=custom_id eq '${this.selectedStructureList.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.docVisuService
				.get(urlString)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (response: any) => {
						if (response.value.length === 0) this.onCreateOrUpdate();
						else {
							const { idIsAlreadyTaken } = Localization;
							this.disableButtonDuringRequest = false;
							this.customIdState = "Negative";
							this.customIdValueStateText = idIsAlreadyTaken;
						}
					},
					error: () => {
						this.disableButtonDuringRequest = false;
					},
				});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		this.disableButtonDuringRequest = true;
		const payload = this.selectedStructureList?.toOdata();
		const urlString = `DirectoryStructures`;
	
		this.docVisuService.post(urlString, payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					const { recordSavedSuccessfully } = Localization;
					this.filterHandler(); // Refresh the table data
					this.isLoading = false;
					this.isDialogOpen = false;
					(this.form as any).onReset();
					this.disableButtonDuringRequest = false;
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");		
						this.selectedRow = res;
				},
				error: () => {
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
				},
			});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.docVisuService
			.getEntity("DocVisuDirectoryStructure")
			.catch(() => false);
		this.selectedStructureList.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedStructureList.custom_id = "";
		this.isLoadingCustomId = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedStructureList) this.selectedStructureList.is_active = event.target.checked;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}
}

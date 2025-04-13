import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";

import { MultiComboBoxSelectionChangeEventDetail } from "@ui5/webcomponents/dist/MultiComboBox";
import React from "react";
import { Subscription } from "rxjs";
import { Text } from "@ui5/webcomponents-react";
import Dialog from "@ui5/webcomponents/dist/Dialog";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { Hall } from "@app/shared/models/hall.model";
import { ICustomButton } from "@app/shared/interfaces/custom-button.interface";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ToastService } from "@app/shared/services/toaster.service";
import { ShiftVisuIssueTypeModel } from "@app/shared/models/shift-visu-issue-type.model";
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import { objectsDeepEqual } from "@app/shared/utils/compare-objects-deep";

import { FailureSettingsType, FailureSettingsTypeClass } from "@shift-visu/enums/settings-type";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
import { ShiftVisuModelComponentComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-model-component/shift-visu-model-component.component";
import { ShiftVisuGeneralComponentComponent } from "@shift-visu/shift-visu-issue-type/shift-visu-general-component/shift-visu-general-component.component";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";

@Component({
	selector: "app-shift-visu-issue-type",
	templateUrl: "./shift-visu-issue-type.component.html",
	styleUrl: "./shift-visu-issue-type.component.css",
})
export class ShiftVisuIssueTypeComponent implements OnInit {
	@ViewChild("failureSettingsRef", { static: false }) failureSettingsGrid:
		| CustomReactGridTable
		| undefined;

	@ViewChild(ShiftVisuModelComponentComponent) modelComponent:
		| ShiftVisuModelComponentComponent
		| undefined;
	@ViewChild(ShiftVisuGeneralComponentComponent) generalComponent:
		| ShiftVisuGeneralComponentComponent
		| undefined;

	@ViewChild("addOrEditIssueTypeDialog") addOrEditIssueTypeDialog: DialogComponent | undefined;
	@ViewChild("deleteIssueTypeDialog") deleteIssueTypeDialog: Dialog | undefined;
	@ViewChild("archiveIssueTypeDialog") archiveIssueTypeDialog: Dialog | undefined;
	@ViewChild("retrieveIssueTypeDialog") retrieveIssueTypeDialog: Dialog | undefined;

	@Output() selectedIssue = new EventEmitter<any>();
	are_active_errors_displaying = true;

	odataUrl = "/ShiftVisuIssueTypes";
	filterQuery = "is_active eq true";
	rightCardDefaultTitle = $localize`No Failure Selected`;

	modalIssueType: ShiftVisuIssueTypeModel;
	saveMode: "post" | "patch" | undefined;
	deleteId: number = 0;
	retrieveId: number = 0;

	isSavingOrDeletingIssueType: boolean = false;

	isBatchCallRunning = false;
	settingsListName = "";
	selectedIssueType: any = null;
	selectedModelComponents: ShiftVisuComponentModel[] = [];
	seletedGeneralComponents: ShiftVisuComponentModel[] = [];
	failureSettingsTypes = FailureSettingsType;
	failureSettingsTypesArray = FailureSettingsTypeClass.getEnumArray();
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	showArchiveButtonInAction = true;
	halls: Hall[] = [];
	hallsObservable: Subscription | undefined;
	selectedRowsId: Record<any, any> = {};

	initialIssueType: any = {};

	columns: any = [
		{
			Header: $localize`Repair`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Hall`,
			accessor: "halls.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			disableGlobalFilter: true,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				let text = this.shiftVisuService.getChildrenNames(row.original.halls);
				return (
					<React.StrictMode>
						<Text title={text}>{text}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	emptyIssueType: ShiftVisuIssueTypeModel = {
		name: "",
		halls: [],
	};

	customButtons: ICustomButton[] = [
		{
			id: "edit",
			icon: "edit",
			onClick: this.archivedEditClick.bind(this),
		},
		{
			id: "retrieve",
			icon: "fallback",
			onClick: this.retrieveClick.bind(this),
		},
	];

	isLoadingCustomId: boolean = false;
	customId: any;
	isSaveFailureLoading: boolean = false;
	selectedIssueTypeId: number | undefined;

	constructor(
		public authService: AuthService,
		private shiftVisuService: ShiftVisuService,
		private toast: ToastService,
		private cdr: ChangeDetectorRef
	) {
		this.modalIssueType = {
			...this.emptyIssueType,
		};
	}

	saveFailureSettings() {
		this.isSaveFailureLoading = true;
		const url = "shift-visu/component-issue-type";
		if (this.modelComponent && this.modelComponent.selectedOriginalData) {
			this.selectedModelComponents = this.modelComponent.selectedOriginalData.map(
				(data: any) => {
					const model = new ShiftVisuComponentModel();
					model.deserialize(data);
					return model;
				}
			);
		}
		if (this.generalComponent && this.generalComponent.selectedOriginalData) {
			this.seletedGeneralComponents = this.generalComponent.selectedOriginalData.map(
				(data: any) => {
					const model = new ShiftVisuComponentModel();
					model.deserialize(data);
					return model;
				}
			);
		}
		const payload = {
			shiftVisuIssueType: this.selectedIssueType, 
			shiftVisuModelComponents: this.selectedModelComponents, 
			shiftVisuGeneralComponents: this.seletedGeneralComponents, 
		};
		this.selectedIssueTypeId = this.selectedIssueType.id;

		this.shiftVisuService["post"](url, payload, false).subscribe({
			next: async response => {
				this.updateIssueTypes();
				const { recordSavedSuccessfully } = Localization;
				this.toast.showToast(recordSavedSuccessfully, "success");
				await this.getCustomId();
			},
			error: async () => {
				const { failedToSaveData } = Localization;
				this.toast.showToast(failedToSaveData, "error");
				this.isSaveFailureLoading = false;
				await this.getCustomId();
			},
		});
	}

	processData(data: any, recentData: any) {
		if (this.failureSettingsGrid) this.failureSettingsGrid.isBusy = false;
		this.are_active_errors_displaying = this.filterQuery == "is_active eq true" ? true : false;
		if (
			this.failureSettingsGrid &&
			data?.length > 0 &&
			recentData?.length > 0 &&
			data.length == recentData.length
		) {
			if (this.selectedIssueTypeId) {
				const id = this.selectedIssueTypeId;
				const index: number = this.failureSettingsGrid?.data.findIndex((item: any) => item.id === id);

				if (this.failureSettingsGrid && this.failureSettingsGrid?.data.length && index !== undefined && index >= 0) {
					this.selectedIssueType = this.failureSettingsGrid?.data[index];
					this.selectedRowsId = {};
					this.selectedRowsId[index] = true;
					this.failureSettingsGrid.selectedRowsId = structuredClone(this.selectedRowsId);
					this.selectedIssue.emit(this.selectedIssueType);
				}
			}else if (data?.length > 0) {
				this.selectedRowsId[0] = true;
				this.failureSettingsGrid.selectedRowsId = structuredClone(this.selectedRowsId);
				this.selectedIssueType = data[0];
				this.selectedIssue.emit(this.selectedIssueType);
			}
		}
		this.cdr.detectChanges();
	}

	public get shiftVisuAdminPermission() {
		return PermissionEnum.SHIFTVISU_ADMIN;
	}

	async ngOnInit(): Promise<void> {
		this.settingsListName = FailureSettingsTypeClass.getStateTranslate(
			FailureSettingsType.FAILURE
		);
		this.batchCall();
		await this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.shiftVisuService
			.getEntity("ShiftVisuIssueType")
			.catch(() => false);
		if (typeof this.customId === "boolean") this.modalIssueType.custom_id = "";
		this.isLoadingCustomId = false;
	}

	isCurrentFailureTextOfType(key: FailureSettingsType) {
		return FailureSettingsTypeClass.getStateTranslate(key) == this.settingsListName;
	}

	onSettingsLinkedSelected(event: any) {
		let newValue = event.detail.selectedItems[0].getAttribute("value");
		this.settingsListName = FailureSettingsTypeClass.getStateTranslate(newValue);
	}

	onRowClicked(event: any) {
		let unsavedFailureId = this.warnChildrenBeforeSwitch(event);
		if (unsavedFailureId) {
			for (let key in event.detail.selectedRowIds) {
				event.detail.selectedRowIds[key] = undefined;
			}
		} else {
			if (this.failureSettingsGrid)
				this.failureSettingsGrid.selectedRowsId = { [event?.detail?.row?.index]: true };
			this.selectedIssueType = event.detail.row.original;
			this.selectedIssueTypeId = this.selectedIssueType.id;
			this.selectedIssue.emit(this.selectedIssueType);
		}
	}

	batchCall() {
		this.isBatchCallRunning = true;
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(0, "get", `\/odata\/Halls`));

		this.shiftVisuService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.halls = response.responses[0].body.value;
				this.isBatchCallRunning = false;
			},
			error: e => {
				this.isBatchCallRunning = false;
			},
		});
	}

	warnChildrenBeforeSwitch(event: any) {
		return false;

		/**
		 * ToDo: Add proper warning condition check when Issue Type backend is updated.
		 */
		let unsavedFailureId = this.modelComponent?.returnIdForUnsavedFailure();
		if (unsavedFailureId) {
			event.preventDefault();
			return unsavedFailureId;
		}

		unsavedFailureId = this.generalComponent?.returnIdForUnsavedFailure();
		if (unsavedFailureId) {
			event.preventDefault();
			return unsavedFailureId;
		}

		return true;
	}

	newButtonClick() {
		this.saveMode = "post";
		if (this.addOrEditIssueTypeDialog) this.addOrEditIssueTypeDialog.isDialogOpen = true;
		this.modalIssueType = structuredClone(this.emptyIssueType);
		this.initialIssueType = structuredClone(this.emptyIssueType);

		this.modalIssueType.custom_id = this.customId;
	}

	editClick(data: any) {
		this.modalIssueType = { ...data, halls: [] };
		this.initialIssueType = { ...data, halls: [] };
		data.halls.forEach((h: Hall) => this.modalIssueType.halls.push(h?.id ?? 0));
		this.initialIssueType = structuredClone(this.modalIssueType);
		this.saveMode = "patch";
		if (this.addOrEditIssueTypeDialog) this.addOrEditIssueTypeDialog.isDialogOpen = true;
	}

	archivedEditClick(row: any) {
		this.editClick(row.original);
	}

	setComboboxValue(event: MultiComboBoxSelectionChangeEventDetail, model: NgModel) {
		let result: any[] = [];
		event.items.forEach((element: any) => {
			result.push(Number(element.id));
		});
		this.modalIssueType.halls = result;
	}

	onIssueTypeSave(form: NgForm) {
		let url = "shift-visu/issue-type";
		let payload: any = {};
		if (this.saveMode == "post") {
			payload = structuredClone(this.modalIssueType);
		} else if (this.saveMode == "patch") {
			url += `/${this.modalIssueType.id}`;
			Object.keys(this.initialIssueType).forEach(c => {
				if (
					!objectsDeepEqual(
						(this.initialIssueType as any)[c],
						(this.modalIssueType as any)[c]
					)
				) {
					payload[c] = (this.modalIssueType as any)[c];
				}
			});
		}

		if (this.saveMode) {
			this.isSavingOrDeletingIssueType = true;
			this.shiftVisuService[this.saveMode](url, payload, false).subscribe({
				next: async response => {
					this.updateIssueTypes();
					this.handleIssueTypePopupClose(form);
					const { recordSavedSuccessfully } = Localization;
					this.toast.showToast(recordSavedSuccessfully, "success");
					this.shiftVisuService.triggerHallRefresh();
					await this.getCustomId();
				},
				error: async () => {
					this.handleIssueTypePopupClose(form);
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
					await this.getCustomId();
				},
			});
		}
	}

	deleteClick(event: any) {
		this.deleteId = event.id;
		if (this.deleteIssueTypeDialog) this.deleteIssueTypeDialog.open = true;
	}

	deleteIssueType() {
		this.isSavingOrDeletingIssueType = true;
		if (this.deleteId) {
			this.shiftVisuService.delete(`${this.odataUrl}/${this.deleteId}`).subscribe({
				next: () => {
					this.updateIssueTypes();
					this.handleIssueTypePopupClose();
					const { recordDeleted } = Localization;
					this.toast.showToast(recordDeleted, "success");
				},
				error: () => {
					this.handleIssueTypePopupClose();
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
				},
			});
		}
	}

	archiveIssueType() {
		throw new Error("Method not implemented.");
	}

	retrieveClick(row: any) {
		this.retrieveId = row.original.id;
		if (this.retrieveIssueTypeDialog) this.retrieveIssueTypeDialog.open = true;
	}

	retrieveIssueType() {
		let url = this.odataUrl + `/${this.retrieveId}`;
		let payload = {
			is_active: true,
		};
		this.isSavingOrDeletingIssueType = true;
		this.shiftVisuService.patch(url, payload).subscribe({
			next: async response => {
				this.updateIssueTypes();
				this.handleIssueTypePopupClose();
				const { recordSavedSuccessfully } = Localization;
				this.toast.showToast(recordSavedSuccessfully, "success");

				await this.getCustomId();
			},
			error: async () => {
				this.handleIssueTypePopupClose();
				const { failedToSaveData } = Localization;
				this.toast.showToast(failedToSaveData, "error");

				await this.getCustomId();
			},
		});
	}

	switchErrorDisplayType() {
		if (this.are_active_errors_displaying) {
			this.filterQuery = "is_active eq false";
			this.settingsListName = FailureSettingsTypeClass.getStateTranslate(
				FailureSettingsType.ARCHIVED
			);
		} else {
			this.filterQuery = "is_active eq true";
			this.settingsListName = FailureSettingsTypeClass.getStateTranslate(
				FailureSettingsType.FAILURE
			);
		}
		this.cdr.detectChanges();
		this.selectedIssueType = structuredClone(this.emptyIssueType);
		this.failureSettingsGrid?.onFilterAndSorting();
	}

	handleIssueTypePopupClose(form?: NgForm) {
		this.initialIssueType = {};

		this.isSavingOrDeletingIssueType = false;

		this.modalIssueType = { ...this.emptyIssueType };
		this.selectedIssueType = null;

		if (form) {
			form.resetForm(structuredClone(this.emptyIssueType));
		}

		this.modalIssueType = structuredClone(this.emptyIssueType);

		if (this.deleteIssueTypeDialog) this.deleteIssueTypeDialog.open = false;
		if (this.deleteIssueTypeDialog) this.deleteIssueTypeDialog.open = false;
		if (this.retrieveIssueTypeDialog) this.retrieveIssueTypeDialog.open = false;
		if (this.addOrEditIssueTypeDialog) this.addOrEditIssueTypeDialog.isDialogOpen = false;
	}

	updateIssueTypes() {
		this.modalIssueType = structuredClone(this.emptyIssueType);
		this.selectedIssueType = {
			...this.emptyIssueType,
		};

		this.failureSettingsGrid?.onFilterAndSorting();
	}
}

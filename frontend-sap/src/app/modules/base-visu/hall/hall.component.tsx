import { Component, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Hall } from "@app/shared/models/hall.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";

import {
	ProductionPlanningPageName,
	ProductionPlanningPageNameClass,
} from "@app/shared/enums/ProductionPlanningPageName";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-hall",
	templateUrl: "./hall.component.html",
	styleUrl: "./hall.component.css",
})
export class HallComponent {
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
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	hallConfig: any = {};
	productionPlanningPageNameClass = new ProductionPlanningPageNameClass();
	productionPlanningPageNameItems = ProductionPlanningPageNameClass.getEnumArray();
	selectedHall: Hall = new Hall().deserialize({});
	@ViewChild("errorDialogHalls", { static: false }) errorDialogHalls: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogHall", { static: false })
	deleteErrorDialogHall: any;
	public selectedTab: string = "core_data";
	localization = Localization;
	private lastClickTime: number = 0;
	private clickCount: number = 0;
	private singleClickTimeout: any;

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
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Frozen Zone Before Days`,
			accessor: "frozen_zone_before_days",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Frozen Zone After Weeks`,
			accessor: "frozen_zone_after_weeks",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
	];

	hallClass = new Hall();

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
	) {
		this.selectedHall = new Hall().deserialize({});
		this.hallConfig = this.configService.getConfigValue("item_state");
	}
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
	}

	getPageName(value: ProductionPlanningPageName) {
		return ProductionPlanningPageNameClass.getStateTranslate(value);
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedHall = new Hall().deserialize({});
		this.selectedHall.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedHall.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedHall.custom_id || ""
		);
		const urlString = `Halls?$filter=custom_id eq '${this.selectedHall.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
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

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedHall?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Halls(${this.selectedHall?.id})` : `Halls`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogHalls.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedHall?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedHall.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Hall").catch(() => false);
		this.selectedHall.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedHall.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async getDbAutoIncrementId() {
		this.commonService.getAutoIncrementId("Halls").subscribe(res => {
			this.autoIncrementId = res.value[0].id + 1;
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

	refreshEditData() {
		const url = `Halls?$filter=is_active eq true and id eq ${this.selectedHall?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogHall") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Halls(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedHall, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogHall.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogHall") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogHall.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeErrorDialog() {
		this.errorDialogHalls.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedHall) this.selectedHall.is_active = event.target.checked;
	}

	onChangeIsPlanVisu(event: any) {
		if (this.selectedHall) this.selectedHall.is_enabled_plan_visu = event.target.checked;
		if (this.selectedHall && this.selectedHall?.is_enabled_plan_visu == false)
			this.selectedHall.production_planning_page = ProductionPlanningPageName.DEFAULT;
	}

	onChangeName(event: any) {
		if (this.selectedHall) this.selectedHall.name = (event.target as any).value;
	}

	onChangeProductionPlanningPage(event: any) {
		if (this.selectedHall && this.selectedHall?.is_enabled_plan_visu)
			this.selectedHall.production_planning_page =
				ProductionPlanningPageNameClass.getStateValue(event.detail.item.text) ||
				ProductionPlanningPageName.DEFAULT;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.selectedTab = "core_data";
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "core_data";
			return;
		}
		const customId = this.selectedHall.custom_id?.trim();
		this.selectedHall.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.hallConfig && this.selectedHall) {
			return this.hallConfig[fieldName] === 0 && this.selectedHall.is_imported_from_erp;
		} else {
			return false;
		}
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}
}

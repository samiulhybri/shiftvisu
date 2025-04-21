import { Component, ViewChild } from "@angular/core";
import { Localization } from "@app/shared/utils/common-localize";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { NgForm } from "@angular/forms";
import { ColorSchemeSorting } from "@app/shared/models/color-scheme-sorting.model";
import { ColorScheme } from "@app/shared/models/color-scheme.model";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { ColorPalette } from "@app/shared/enums/ColorPalette";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";

@Component({
	selector: "app-color-scheme-sorting",
	templateUrl: "./color-scheme-sorting.component.html",
	styleUrl: "./color-scheme-sorting.component.css",
})
export class ColorSchemeSortingComponent {
	disableButtonDuringRequest: boolean = false;
	colorSchemeComboboxLoading: boolean = false;
	colorSchemes: ColorScheme[] = [];
	isUpdateDialog?: boolean;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	dialogTitle: string = "";
	deletItemId = "";
	valueStateText: string = "";
	valueStateTextColorScheme: string = "";
	isUpdate?: boolean;
	localization = Localization;
	selectedColorSchemeSorting: ColorSchemeSorting = new ColorSchemeSorting().deserialize({});
	cachedColorSchemeSorting: ColorSchemeSorting = new ColorSchemeSorting().deserialize({});
	colorPaletteKeys = Object.values(ColorPalette);
	selectedStateColor?: string = ColorPalette.BLACK;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("planVisuColorSchemeSortingDialog", { static: false })
	planVisuColorSchemeSortingDialog: any;
	@ViewChild("deleteErrorDialogColorSchemeSorting", { static: false })
	deleteErrorDialogColorSchemeSorting: any;
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("colorSchemeCombobox") colorSchemeCombobox!: ComboBoxComponent;
	public isBackgroundColor: boolean = true;

	columns: any = [
		{
			Header: $localize`Color Scheme`,
			accessor: "colorScheme.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			dataType: GridTableColumnDataType.NestedString,
		},
		{
			Header: $localize`Sorting`,
			accessor: "sorting",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			hAlign: "End",
			dataType: GridTableColumnDataType.Number,
		},
		{
			Header: $localize`Model Type`,
			accessor: "model_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Model Column`,
			accessor: "model_column",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Value String`,
			accessor: "value_string",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Color`,
			accessor: "color",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Color,
			autoResizable: true,
		},
		{
			Header: $localize`Border`,
			accessor: "border_color",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Color,
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	ngOnInit() {
		this.loadData();
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	loadData() {
		this.colorSchemeComboboxLoading = true;
		this.commonService.get(`/PlanVisuColorSchemes`).subscribe({
			next: (res: any) => {
				this.colorSchemes = res.value.map((colorScheme: any) =>
					new ColorScheme().deserialize(colorScheme)
				);
				this.colorSchemeComboboxLoading = false;
			},
			error: err => {
				console.error(err);
				this.colorSchemeComboboxLoading = false;
			},
		});
	}

	newButtonClick() {
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedColorSchemeSorting = new ColorSchemeSorting().deserialize({});
		this.selectedColorSchemeSorting.color = ColorPalette.BLACK;
		this.selectedStateColor = "";
		this.disableButtonDuringRequest = false;
		this.valueStateText = "";
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedColorSchemeSorting?.deserialize(value);
		this.cachedColorSchemeSorting?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.disableButtonDuringRequest = false;
		this.valueStateText = "";
	}

	onSubmit(form: NgForm) {
		this.valueStateText = "";
		this.colorSchemeCombobox.element.valueState = "None";
		void this.checkAllRequiredComboboxes();

		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			return;
		}
		if (
			this.cachedColorSchemeSorting.colorScheme?.id ===
				this.selectedColorSchemeSorting.colorScheme?.id &&
			this.cachedColorSchemeSorting.sorting?.toString() ===
				this.selectedColorSchemeSorting?.sorting?.toString()
		) {
			this.onCreateOrUpdate();
		} else {
			this.commonService
				.get(
					`/PlanVisuColorSchemeSortings?$filter=plan_visu_color_scheme_id eq ${this.selectedColorSchemeSorting.colorScheme?.id} and sorting eq ${this.selectedColorSchemeSorting.sorting}`
				)
				.subscribe({
					next: (res: any) => {
						if (res.value.length) {
							const errorMsg = $localize`Value should be unique.`;
							this.colorSchemeCombobox.element.valueState = "Negative";
							this.valueStateText = errorMsg;
							this.valueStateTextColorScheme = errorMsg;
							this.disableButtonDuringRequest = false;
						} else this.onCreateOrUpdate();
					},
					error: error => {
						this.disableButtonDuringRequest = false;
					},
				});
		}
	}

	toggleSwitch() {
		this.selectedColorSchemeSorting.has_border = !this.selectedColorSchemeSorting.has_border;
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedColorSchemeSorting?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `PlanVisuColorSchemeSortings(${this.selectedColorSchemeSorting?.id})`
			: `PlanVisuColorSchemeSortings`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				this.filterHandler();
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
				this.selectedColorSchemeSorting = new ColorSchemeSorting().deserialize({});
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.planVisuColorSchemeSortingDialog.elementRef.nativeElement.open = true;
			},
		});
	}

	closeErrorDialog() {
		this.planVisuColorSchemeSortingDialog.elementRef.nativeElement.open = false;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/PlanVisuColorSchemeSortings(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.filterHandler();
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogColorSchemeSorting.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogColorSchemes") as Dialog;
		dialog.open = true;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogColorSchemes") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogColorSchemeSorting.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onChangeColorScheme(event: any) {
		this.colorSchemeCombobox.element.valueState = "None";
		this.valueStateText = "";
		if (this.selectedColorSchemeSorting)
			this.selectedColorSchemeSorting.colorScheme = new ColorScheme().deserialize({
				custom_id: (event.target as any).value || "",
				id: parseInt((event.detail as any).item.id) || 0,
			});
	}

	openColorPicker(type: string) {
		this.isBackgroundColor = type == 'background' ? true : false;
		this.popover.elementRef.nativeElement.open = true;
	}

	itemclicked(color: string): void {
		this.selectedStateColor = color;
		if(this.isBackgroundColor) this.selectedColorSchemeSorting.color = this.selectedStateColor;
		else this.selectedColorSchemeSorting.border_color = this.selectedStateColor;
	}

	closeResponsiveDialog() {
		this.popover.elementRef.nativeElement.open = false;
	}

	checkAllRequiredComboboxes(): boolean {
		if (!this.colorSchemeCombobox.element.value) {
			this.colorSchemeCombobox.element.valueState = "Negative";
			this.valueStateTextColorScheme = this.localization.invalidEntry;
			return false;
		}
		return true;
	}

	onChangeSorting() {
		if (this.colorSchemeCombobox.element.value)
			this.colorSchemeCombobox.element.valueState = "None";
		this.valueStateText = "";
	}
}

import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import { ProdOrderPosOperationHandlingUnitTypeClass } from "@app/shared/enums/ProdOrderPosOperationHandlingUnitType";
import { TransportableType, TransportableTypeClass } from "@app/shared/enums/TransportableType";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { Localization } from "@app/shared/utils/common-localize";
import { formatNumber } from "@app/shared/utils/number-formatter";
import { ToastComponent } from "@ui5/webcomponents-ngx";
import { Button, FlexBox } from "@ui5/webcomponents-react";
import React from "react";
import { ReplaySubject, takeUntil } from "rxjs";

@Component({
	selector: "app-staging-area",
	templateUrl: "./staging-area.component.html",
	styleUrl: "./staging-area.component.css",
})
export class StagingAreaComponent implements OnInit, OnDestroy {
	@Input() public tableHeader: string = $localize`Production Supply Area`;
	@Input() public showScanButton: boolean = false;
	@Input() public isQuantityEntry: boolean = false;
	@Input() public isQuantityExit: boolean = false;
	@Input() public isFromQuantity: boolean = true;
	@Input() public keyForCacheCustomDataTableColumns = "productionSupplyAreas";
	@Input() public operation: any;
	@Input() public machineId: any;
	@Input() public selectedOrderInDetailsId: any;

	@ViewChild("deleteToast", { static: false }) deleteToast!: ToastComponent;
	@ViewChild("errorDialog", { static: false }) errorDialog: any;
	@ViewChild("stagingAreaTable", { static: false }) stagingAreaTable:
		| CustomReactGridTable
		| undefined;

	@Input() public set filterQuery(filterQuery: string | undefined) {
		if (filterQuery) {
			this.filterQueryPSA = filterQuery;
			if (this.stagingAreaTable && this.currentMachine) {
				if (this.isFromQuantity) {
					this.page = 1;
					this.perPage = 30;
				}
				this.generateCustomURL();

				this.triggerAPICall();
			}
		}
	}

	@Output() public clickOnScanButton = new EventEmitter<any>();
	@Output() public clickOnUnlinkEntryButton = new EventEmitter<any>();
	@Output() public clickTransportOrderFromEntry = new EventEmitter<any>();
	@Output() public clickTransportOrderFromExit = new EventEmitter<any>();
	@Output() public generateFilterQuery = new EventEmitter<any>();

	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

	filterQueryPSA: string = "";
	localization = Localization;
	isLoading: boolean = false;
	transportOrders: any[] = [];
	selectedStatus: string = "all";
	operationsData: ProdOrderPosOperation[] = [];
	currentMachine: Machine | undefined;
	stockCustomUrl: string = "";
	toastMessage: string = "";
	transportableTypeClass = TransportableTypeClass;
	transportableType = TransportableType;
	transportableTypeArray = TransportableTypeClass.getEnumArray();
	page = 1;
	perPage = 30;
	qtyToScrap = 1;
	isStopApiCalling = false;
	isDeleteDialogOpen = false;
	isEditDialogOpen = false;
	selectedRow: any = undefined;
	errorMessage: string = this.localization?.someThingWentWrong;

	constructor(
		private dataService: DataService,
		public authService: AuthService,
		public commonService: CommonService
	) {}

	ngOnInit(): void {
		this.getCurrentMachine();
	}

	deleteScrapComponent(rowData: any) {
		this.selectedRow = rowData;
		this.isDeleteDialogOpen = true;
	}

	closeDialogDelete() {
		this.isDeleteDialogOpen = false;
		this.isEditDialogOpen = false;
	}

	deleteScrapComponentSubmit() {
		this.editScrapComponentSubmit(true);
	}

	printLabel(rowData: any) {
		this.commonService
			.post(`production-supply-area/stocks/${rowData?.id}/print`, {}, false)
			.subscribe({
				next: () => {
					this.toastMessage = $localize`Print Successfully!`;
					this.isLoading = false;
					this.deleteToast.open = true;
				},
				error: err => {
					this.errorMessage = err?.error?.message;
					this.isLoading = false;
					this.errorDialog.elementRef.nativeElement.open = true;
				},
			});
	}

	createTransportOrder(rowData: any) {
		if (this.isQuantityEntry) {
			this.clickTransportOrderFromEntry.emit(rowData);
		} else {
			this.clickTransportOrderFromExit.emit(rowData);
		}
	}

	editPartialScrap(rowData: any) {
		this.selectedRow = rowData;

		this.selectedRow.quantity = parseFloat(rowData.quantity ?? '0') ?? 0;

		this.isEditDialogOpen = true;
		this.qtyToScrap = 1;
	}

	editScrapComponentSubmit(isFromDelete = false) {
		this.isLoading = true;

		const payload = isFromDelete ? {} : { qty_to_scrap: this.qtyToScrap };

		this.commonService
			.post(`stock/${this.machineId}/${this.selectedOrderInDetailsId}/${this.selectedRow?.id}/scrap`, payload, false)
			.subscribe({
				next: () => {
					this.toastMessage = this.localization.recordSavedSuccessfully;

					this.isLoading = false;
					this.closeDialogDelete();

					this.deleteToast.open = true;

					this.page = 1;
					this.perPage = 30;
					this.generateCustomURL();

					this.generateFilterQuery.emit();

					this.triggerAPICall();
				},
				error: err => {
					this.errorMessage = err?.error?.message;
					this.errorDialog.elementRef.nativeElement.open = true;
					this.isLoading = false;
					this.closeDialogDelete();
				},
			});
	}

	columns: any[] = [
		{
			Header: $localize`Type`,
			accessor: "item.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;
				const type = BackendModelTypeClass.getStateTranslate(rowData.stockable_type) as any;

				if (rowData.stockable_type == BackendModelType.PRODORDERPOSOPERATION) {
					return $localize`Work In Process`;
				} else if (type?.text) {
					return type?.text;
				}

				return "";
			},
		},
		{
			Header: $localize`Id`,
			accessor: "item.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Left",
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;
				let custom_id = "";

				switch (rowData.stockable_type) {
					case BackendModelType.PRODORDERPOSOPERATION:
						custom_id = rowData.stockable?.prodOrderPos?.item?.custom_id
							? rowData.stockable?.prodOrderPos?.item?.custom_id +
								" - " +
								rowData.stockable?.pos
							: rowData.item?.custom_id + " - " + rowData.stockable?.pos;

						break;
					case BackendModelType.ITEMPLANT:
						custom_id = rowData.stockable?.item?.custom_id;
						break;
					case BackendModelType.ITEM:
						custom_id = rowData.item?.custom_id || rowData.stockable?.item?.custom_id;
						break;
					case BackendModelType.HANDLINGUNIT:
						custom_id = rowData.stockable?.custom_id;
						break;
					case BackendModelType.Equipment:
						custom_id = rowData.stockable?.custom_id;
						break;

					default:
						custom_id = rowData.stockable?.custom_id;
						break;
				}

				return custom_id;
			},
		},
		{
			Header: $localize`Batch`,
			accessor: "batch",
			disableFilters: true,
			disableGroupBy: true,
			isSelected: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Item State Id`,
			accessor: "item_state.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Left",
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;

				switch (rowData.stockable_type) {
					case BackendModelType.ITEMPLANT:
						return rowData?.item_state?.custom_id ?? "";
					case BackendModelType.Equipment:
						return rowData?.item_state?.custom_id ?? "";

					case BackendModelType.HANDLINGUNIT:
						return ProdOrderPosOperationHandlingUnitTypeClass.getStateTranslate(rowData?.state_type?.type) ?? "";

					default:
						return ""
				}
			}
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: true,
			disableGroupBy: true,
			isSelected: true,
			disableSortBy: true,
			hAlign: "Right",
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;
				const quantity = formatNumber(rowData.quantity);

				return (
					<React.StrictMode>
						<FlexBox
							className={`w-full h-full flex justify-end items-center ${
								rowData.quantity > 0 ? "bg-transparent" : "bg-red-500"
							}`}>
							<div className="w-full h-full flex justify-end items-center pr-2">{quantity}</div>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`UoM`,
			accessor: "unitOfMeasure.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			isSelected: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			minWidth: 200,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							{this.isQuantityExit || this.isQuantityEntry ? (
								<FlexBox>
									{row.depth == 0 ? (
										<Button
											design="Transparent"
											icon="broken-link"
											tooltip={$localize`Unlink and Print Component`}
											onClick={() => {
												this.clickOnUnlinkEntryButton.emit(rowData);
											}}></Button>
									) : (
										<></>
									)}
								</FlexBox>
							) : (
								<></>
							)}

							{this.isFromQuantity &&
							this.isQuantityEntry &&
							row.depth == 0 &&
							this.authService.isPermissionValid(
								"MACHINEBOARD_PSA_CREATE_SCRAP_PARTIAL_QUANTITY_OF_COMPONENT"
							) ? (
								<Button
									design="Transparent"
									icon="edit"
									tooltip={$localize`Partially Scrap Component`}
									onClick={() => this.editPartialScrap(rowData)}></Button>
							) : (
								<></>
							)}

							{((this.isFromQuantity &&
								(this.isQuantityEntry || this.isQuantityExit)) ||
								!this.isFromQuantity) &&
							row.depth == 0 ? (
								<Button
									design="Transparent"
									icon="shipping-status"
									tooltip={$localize`Create Transport Order, Unlink and Print Component`}
									onClick={() => this.createTransportOrder(rowData)}></Button>
							) : (
								<></>
							)}

							{this.isFromQuantity &&
							this.isQuantityEntry &&
							row.depth == 0 &&
							this.authService.isPermissionValid(
								"MACHINEBOARD_PSA_CREATE_SCRAP_FULL_ROW_OF_COMPONENT"
							) ? (
								<Button
									design="Transparent"
									icon="delete"
									tooltip={$localize`Total Scrap component`}
									onClick={() => this.deleteScrapComponent(rowData)}></Button>
							) : (
								<></>
							)}

							{!this.isFromQuantity &&
							this.authService.isPermissionValid(
								"MACHINEBOARD_PSA_REMOVE_QUANTITY_FROM_PSA"
							) ? (
								<Button design="Transparent" icon="cancel"></Button>
							) : (
								<></>
							)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	generateCustomURL() {
		if (this.stagingAreaTable) {
			this.stockCustomUrl = `/stock/${this.currentMachine?.id}/production-supply-area`;
			this.stagingAreaTable.customUrl =
				this.stockCustomUrl +
				`?${this.filterQueryPSA}` +
				`&page=${this.page}&perPage=${this.perPage}`;
		}
	}

	triggerAPICall() {
		this.stagingAreaTable?.onFilterAndSorting();
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
			if (this.currentMachine && !this.isFromQuantity) {
				this.stockCustomUrl = `/stock/${this.currentMachine.id}/production-supply-area?page=${this.page}&perPage=${this.perPage}`;
			}
		});
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	onScanButtonClicked() {
		this.clickOnScanButton.emit();
	}

	onLoadMoreForPSA() {
		if (!this.isStopApiCalling) {
			this.page++;

			this.generateCustomURL();
			this.stagingAreaTable?.onPagination();
		}
	}

	onProcessData(data: any) {
		this.isStopApiCalling = (data[1]?.length || 0) < 30;
	}

	closeErrorDialog() {
		this.errorDialog.elementRef.nativeElement.open = false;
	}
}

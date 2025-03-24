import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import {
	ProdOrderPosOperationStatus,
	ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { debounceTime, Subject, switchMap } from "rxjs";

@Component({
	selector: "app-closed-operations",
	templateUrl: "./closed-operations.component.html",
	styleUrl: "./closed-operations.component.css",
})
export class ClosedOperationsComponent {
	localization = Localization;
	globalSearchValue = "";
	selectedProdOrder = new ProdOrder().deserialize({});
	prodOrders: ProdOrder[] = [];
	initialProdOrders: ProdOrder[] = [];
	prodOrderComboboxLoading = false;
	isLoading = false;
	disableButtonDuringRequest = false;
	processedData: any[] = [];
	selectedRows: ProdOrder[] = [];
	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;

	private searchItemSubject = new Subject<string>();

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	ngOnInit(): void {
		this.batchCall();
		this.searchProdOrderAPICall();
	}

	columns: any = [
		{
			Header: $localize`Position`,
			accessor: "prodOrderPos",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Item`,
			accessor: "itemName",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["itemName", "itemCustomId"],
		},
		{
			Header: $localize`Operation`,
			accessor: "operationName",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["operationName", "operationPos"],
		},
		{
			Header: $localize`Machine`,
			accessor: "machineName",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["machineName", "machineCustomId"],
		},
		{
			Header: $localize`Start`,
			accessor: "start",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "End",
		},
		{
			Header: $localize`End`,
			accessor: "end",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "End",
		},
		{
			Header: $localize`Status`,
			accessor: "status",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
	];

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(0, "get", `\/odata\/ProdOrders?$top=300`));

		this.prodOrderComboboxLoading = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.prodOrders = response.responses[0].body.value.map((data: ProdOrder) =>
					new ProdOrder().deserialize(data)
				);
				this.initialProdOrders = this.prodOrders;
				this.prodOrderComboboxLoading = false;
			},
			error: e => {},
		});
	}

	updateOperations() {
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];

		this.selectedRows?.forEach((row: any, i: number) => {
			const request = new ODataBatchCall(
				++i,
				"patch",
				`\/odata\/ProdOrderPosOperations(${row?.operationId})`
			);
			request.body = {
				status: ProdOrderPosOperationStatus.SUSPENDED,
				status_plan: ProdOrderPosOperationStatus.SUSPENDED,
			};
			requests.push(request);
		});

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				if (this.selectedProdOrder?.id) {
					this.loadProdOrderPosOperations();
				}

				this.globalSearchValue = "";
				this.selectedRows = [];

				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.closeDialog();
			},
			error: e => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
			},
		});
	}

	onRowSelectionChange(e: any) {
		this.selectedRows = [];
		e.detail?.selectedFlatRows?.forEach((row: any) => {
			if (row.depth > 0) {
				this.selectedRows.push(row?.original);
			}
		});
	}

	onGlobalSearch(e: any) {
		this.selectedRows = [];
		// Trim and convert the search value to lowercase
		this.globalSearchValue = e.target.typedInValue;
		const trimmedValue = this.globalSearchValue.trim().toLowerCase();

		// If there is a search term, filter the data
		const filteredValues = trimmedValue
			? (this.processedData
					.map((prodOrderPos: any) => {
						// Convert the hallName to lowercase and check if it matches the search term
						const isParentMatch =
							prodOrderPos.prodOrderPos.toLowerCase().includes(trimmedValue) ||
							prodOrderPos.itemName.toLowerCase().includes(trimmedValue) ||
							prodOrderPos.itemCustomId.toLowerCase().includes(trimmedValue);

						// Filter subRows based on the search term, converting to lowercase for comparison
						const filteredSubRows = prodOrderPos.subRows.filter(
							(subRow: any) =>
								subRow.operationPos.toLowerCase().includes(trimmedValue) ||
								subRow.operationName.toLowerCase().includes(trimmedValue)
						);

						// If the parent matches, include all subRows; otherwise, include only the matching subRows
						if (isParentMatch || filteredSubRows.length > 0) {
							return {
								...prodOrderPos,
								subRows: isParentMatch ? prodOrderPos.subRows : filteredSubRows,
							};
						}

						// If nothing matches, return null
						return null;
					})
					.filter((hall: any) => hall !== null) as any[])
			: this.processedData; // If no search term, return all data

		if (this.childComponent) {
			this.childComponent.data = filteredValues;

			this.childComponent.render();
		}
	}

	onChangeProdOrder(e: any) {
		this.selectedProdOrder = new ProdOrder().deserialize({
			custom_id: (e.target as any).value || "",
			id: parseInt((e.detail as any).item.id) || 0,
		});

		if (this.selectedProdOrder?.id) {
			this.loadProdOrderPosOperations();
		}
	}

	onAfterChangeProdOrder(e: any) {
		const value = (e.target as any).value;

		if (value) {
			const existedData = this.prodOrders.find(prodOrder =>
				prodOrder.custom_id?.includes(value)
			);

			if (existedData) this.selectedProdOrder = existedData;
		}

		if (this.selectedProdOrder?.id) {
			this.loadProdOrderPosOperations();
		}
	}

	loadProdOrderPosOperations() {
		if (this.childComponent) {
			this.childComponent.isBusy = true;
			this.childComponent.render();
		}

		this.commonService
			.get(
				`ProdOrderPos?$expand=item($select=id,custom_id,name),prodOrderPosOperations($select=id,prod_order_pos_id,machine_id,pos,name,start,end,status;$expand=machine($select=id,custom_id,name);$filter=status eq '${ProdOrderPosOperationStatus.CLOSED}' and status_plan eq '${ProdOrderPosOperationStatus.CLOSED}')&$filter=prod_order_id eq ${this.selectedProdOrder?.id}&$select=id,prod_order_id,item_id,pos,start,end`
			)
			.subscribe({
				next: (response: any) => {
					this.processedData = [];
					this.selectedRows = [];

					response.value.forEach((prodOrderPos: ProdOrderPos) => {
						if (prodOrderPos.prodOrderPosOperations?.length) {
							const parent = {
								posId: prodOrderPos.id,
								prodOrderPos: prodOrderPos.pos,
								itemId: prodOrderPos?.item?.id,
								itemCustomId: prodOrderPos?.item?.custom_id,
								itemName: prodOrderPos?.item?.name,
								operationId: "",
								operationPos: "",
								operationName: "",
								machineId: "",
								machineCustomId: "",
								machineName: "",
								start: "",
								end: "",
								status: "",
								subRows: [] as any,
							};

							prodOrderPos.prodOrderPosOperations.forEach(
								(operation: ProdOrderPosOperation) => {
									const child = {
										posId: prodOrderPos.id,
										prodOrderPos: "",
										itemId: prodOrderPos?.item?.id,
										itemCustomId: "",
										itemName: "",
										operationId: operation.id,
										operationPos: operation.pos,
										operationName: operation.name,
										machineId: operation?.machine?.id,
										machineCustomId: operation?.machine?.custom_id,
										machineName: operation?.machine?.name,
										start: formatDate(operation.start || ""),
										end: formatDate(operation.end || ""),
										status: this.prodOrderPosOperationStatusClass.getStateTranslate(
											operation.status
										),
									};
									parent.subRows.push(child);
								}
							);

							this.processedData.push(parent);
						}
					});

					if (this.childComponent) this.childComponent.isBusy = false;

					if (this.childComponent) {
						this.childComponent.data = this.processedData;
						this.childComponent.render();
					}
				},
				error: e => {},
			});
	}

	onProdOrderInputChange(e: any) {
		const value = e.target.value;

		if (value) {
			this.searchItemSubject.next(value);
		} else {
			this.prodOrders = this.initialProdOrders;

			this.selectedProdOrder = new ProdOrder().deserialize({
				id: null,
				name: "",
			});
		}
	}

	searchProdOrderAPICall() {
		this.searchItemSubject
			.pipe(
				debounceTime(800),
				switchMap(value => {
					this.prodOrderComboboxLoading = true;

					return this.commonService.get(
						`ProdOrders?$filter=contains(tolower(custom_id), '${value?.toLowerCase()}')`
					);
				})
			)
			.subscribe({
				next: (response: any) => {
					this.prodOrderComboboxLoading = false;
					this.prodOrders = response?.value || [];

					if (response?.value?.length == 1) {
						this.selectedProdOrder = response?.value[0];

						this.loadProdOrderPosOperations();
					}
				},
				error: err => {
					this.prodOrders = this.initialProdOrders;
				},
				complete: () => {},
			});
	}

	onSuspendClick() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	closeDialog() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	onSettingClick() {
		this.childComponent?.toggleSettingDialog();
	}
}

import { Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import React from "react";
import {
	ComboBox,
	DateTimePicker,
	Input as UI5Input,
	Icon,
	FlexBox,
	Text,
} from "@ui5/webcomponents-react";
import { convertSeconds } from "@app/shared/utils/duration-to-hour";
import { DatePicker } from "@ui5/webcomponents-react";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import moment from "moment";
import { firstValueFrom } from "rxjs";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { Item } from "@app/shared/models/item.model";
import { ValueHelperType } from "@app/modules/planvisu/gantt/enums/ValueHelperType";
import Input from "@ui5/webcomponents/dist/Input";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import { environment } from "@app/environments/environment";

@Component({
	selector: "app-order-view-tree",
	templateUrl: "./order-view-tree.component.html",
	styleUrl: "./order-view-tree.component.css",
})
export class OrderViewTreeComponent {
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}
	ngOnInit() {
		this.getAllComboBoxData();
	}
	@ViewChild("orderGrid", { static: false }) prodOrderGrid: CustomReactGridTable | undefined;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("hallRef") hallRef: any;
	@ViewChild("machineGroupRef") machineGroupRef: any;
	halls: Hall[] = [];
	machineGroups: MachineGroup[] = [];
	prodOrdes: ProdOrder[] = [];
	items: Item[] = [];
	selectedHalls: number[] = [];
	selectItems: any[] = [];
	selectItemIds: any[] = [];
	selectedMachineGroups: number[] = [];
	selectProdOrders: any[] = [];
	selectProdOrderIds: any[] = [];
	processedData: any[] = [];
	valueForItem: string = "";
	valueHelperType = ValueHelperType;
	valueHelperUrl: string = "";
	selectedValueHelperType: string = "";
	isValueHelpDialog: boolean = false;
	isDialogEditable: boolean = true;
	isDialogOpen: boolean = false;
	saveButtonEnable: boolean = true;
	isBusy: boolean = false;
	isLoading: boolean = false;
	dialogTitle: string = "";
	valueHelperTitle?: string = "";
	valueHelperSortBy?: string = "";
	valueHelperSortType?: string = "";
	valueForProdOrder: string = "";
	valueHelperAdditionalFilterQuery: string = "";
	expandedQuery: string = "";
	customUrl = true;
	momentInstance = moment;
	start = moment().subtract(0, "days").toISOString();
	end = moment().add(7, "days").toISOString();
	segmentButtonItems = [
		{ id: "1", name: $localize`Active Orders` },
		{ id: "2", name: $localize`Closed Orders` },
	];
	isShowOperationPopupField: any = {
		'customer': true,
		'item': true,
		'prod_order': true,
		'due_date': true,
		'release_date': true,
		'constraint_type': true,
		'alt_machine': true
	}
	url = "";
	filterQuery = ``;
	expandQuery = "";
	finalData:any = []
	operationFilter = `((status ne '${ProdOrderPosOperationStatus.CLOSED}' and status ne '${ProdOrderPosOperationStatus.DELETED}') or (status_plan ne '${ProdOrderPosOperationStatus.CLOSED}' and status_plan ne '${ProdOrderPosOperationStatus.DELETED}'))`;
	columns = [
		{
			Header: $localize`Order Name`,
			accessor: "prodOrder.custom_id",
			width: 180,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			dataType: GridTableColumnDataType.Number,
			width: 90,
			isSelected: true,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{row.depth == 0
									? rowData.quantity
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Item Nr.`,
			accessor: "item.custom_id",
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			width: 180,
		},
		{
			Header: $localize`Item Name.`,
			accessor: "item.name",
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			width: 180,
		},
		{
			Header: $localize`Due Date`,
			accessor: "due_date",
			dataType: GridTableColumnDataType.Date,
			width: 150,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{rowData.due_date
									? moment(rowData.due_date).format("DD.MM.YYYY")
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Position`,
			accessor: "pos",
			width: 120,
			isSelected: true,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{row.depth > 0
									? rowData.pos
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Machine Nr.`,
			accessor: "machine.custom_id",
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			width: 180,
		},
		{
			Header: $localize`Machine Name.`,
			accessor: "machine.name",
			dataType: GridTableColumnDataType.NestedString,
			width: 180,
			isSelected: true,
		},
		{
			Header: $localize`Machine Group`,
			accessor: "machine.machineGroup.name",
			dataType: GridTableColumnDataType.NestedString,
			width: 180,
			isSelected: true,
		},
		{
			Header: $localize`Start Date`,
			accessor: "start",
			dataType: GridTableColumnDataType.Date,
			width: 180,
			hAlign: "End",
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{rowData.start
									? moment(rowData.start).format("DD.MM.YYYY HH:mm")
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`End Date`,
			accessor: "end",
			dataType: GridTableColumnDataType.Date,
			width: 150,
			hAlign: "End",
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{rowData.end
									? moment(rowData.end).format("DD.MM.YYYY HH:mm")
									: null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Tool Nr.`,
			accessor: "tool.custom_id",
			dataType: GridTableColumnDataType.NestedString,
			width: 120,
			isSelected: false,
		},
		{
			Header: $localize`Tool Name`,
			accessor: "tool.name",
			dataType: GridTableColumnDataType.NestedString,
			width: 180,
			isSelected: false,
		},
		{
			Header: $localize`TE`,
			accessor: "te",
			dataType: GridTableColumnDataType.Number,
			width: 70,
			isSelected: false,
			hAlign: "End",
		},
		{
			Header: $localize`Cavity`,
			accessor: "cavity",
			dataType: GridTableColumnDataType.Number,
			width: 70,
			isSelected: false,
			hAlign: "End",
		},
		{
			Header: $localize`Duration`,
			accessor: "lead_time_days",
			dataType: GridTableColumnDataType.Number,
			width: 100,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems="End">
							<Text>
								{row.depth > 0 ? convertSeconds(
									new ProdOrderPosOperation()
										.deserialize(rowData)
										.calculateDuration(),
									true
								): null}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},

	];

	valueHelperColumns: any = [
		{
			Header: $localize`ID`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Start",
			width: 200,
		},
		{
			Header: "",
			accessor: "order_type",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 200,
		},
	];
	selectedOperation: any = new ProdOrderPosOperation().deserialize({
		prodOrderPos: { quantity: 0, prodOrder: { custom_id: "" } },
	});
	operationStart: string = "";
	operationEnd: string = "";
	selecteItem: string = "";
	isEndBusy: boolean = false;
	opearationStatus: number = 1;
	opeartionMachines: any[] = [];
	clientName = environment.clientName;
	top: number = 200;
	skip: number = 0;
	apiUrl: string = `/get-orders?halls=${JSON.parse(localStorage.getItem("Hall") || "[]")}&$inIt=${JSON.parse(localStorage.getItem("Hall") || "[]").length ? "" : 1}&start=${this.start}&end=${this.end}&status=1&top=${this.top}&skip=${this.skip}`;
	@ViewChild("orderDetailsDialog") orderDetailsDialog?: any;

  public selectedOrderId?: number | undefined = undefined;
  actionButtons = [
    {
			id: "schedule",
			icon: "past",
			hide: (rowData:any)=>{
				if(rowData.depth > 0){
					return true;
				}else{
					return false;
				}
			},
			disable: () => false,
			onClick: (rowData: any) => {
				const data = rowData.original;
				this.openOrderReSchedule(data);
			},
		},
  ];
 
	openOrderReSchedule = (data: any) => {
		this.selectedOrderId = data.prodOrder.id;
	}

	closeOrderReSchedule = () => {
		this.selectedOrderId = undefined; 
	}

	onSaveOrderReSchedule = () => {
		this.onGo();
		this.closeOrderReSchedule();
	}
	
	ngAfterViewInit(): void {
		this.getAllComboBoxData().then(() => {
			this.prodOrderGrid!.customUrl = `/get-orders?halls=${JSON.parse(localStorage.getItem("Hall") || "[]")}&start=${this.start}&end=${this.end}&status=1&top=${this.top}&skip=${this.skip}`;
		});
	}
	
	handleSegmentSelectionChange(event: any) {
		this.top = 200;
		this.skip = 0;
		let segmentType = event.detail.selectedItems[0].getAttribute("data-value");
		if (segmentType == "active") {
			this.opearationStatus = 1;
			this.prodOrderGrid!.customUrl = `/get-orders?halls=${this.selectedHalls}&start=${this.start}&end=${this.end}&prodOrders=${this.selectProdOrderIds}&items=${this.selectItemIds}&machineGroups=${this.selectedMachineGroups}&status=${this.opearationStatus}&top=${this.top}&skip=${this.skip}`;
		} else {
			this.opearationStatus = 0;
			this.prodOrderGrid!.customUrl = `/get-orders?halls=${this.selectedHalls}&start=${this.start}&end=${this.end}&prodOrders=${this.selectProdOrderIds}&items=${this.selectItemIds}&machineGroups=${this.selectedMachineGroups}&status=${this.opearationStatus}&top=${this.top}&skip=${this.skip}`;
		}
		this.prodOrderGrid!.render();
		this.prodOrderGrid!.onPagination(true, true);
	}
	getAllComboBoxData() {
		return new Promise((resolve, reject) => {
			let requests: ODataBatchCall[] = [];
			requests.push(
				new ODataBatchCall(
					0,
					"get",
					`\/odata\/Halls?$filter=is_active eq true and is_enabled_plan_visu eq true`
				)
			);

			requests.push(
				new ODataBatchCall(1, "get", `\/odata\/MachineGroups?$filter=is_active eq true`)
			);
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.halls = response.responses[0].body.value.map((data: Hall) => {
						const hall = new Hall().deserialize(data);
						hall.isSelected = false;
						return hall;
					});

					if (this.halls.length > 0) {
						const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
						if (cachedHall.length) {
							this.halls.forEach(hall => {
								hall.isSelected = cachedHall.includes(hall.id);
							});
							this.selectedHalls = cachedHall;
						} else {
							this.selectedHalls = [this.halls[0].id!];
							localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
							setTimeout(() => {
								this.hallRef.elementRef.nativeElement.items[0].selected = true;
							});
						}
					}
					this.machineGroups = response.responses[1].body.value.map(
						(data: MachineGroup) => new MachineGroup().deserialize(data)
					);

					resolve(true);
				},
				error: e => {},
			});
		});
	}
	selectHall(event: any) {
		this.selectedHalls = event.detail.items.map((item: any) => parseInt(item.id));
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
	}
	selectMachineGroup(event: any) {
		this.selectedMachineGroups = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}
	onChangeItem(event: any) {
		const inputValArr = (event.target as any).value.split(", ");
		this.selectItems = this.selectItems.filter((item: any) =>
			inputValArr.includes(item.original.custom_id)
		);
		this.selectItemIds = this.selectItems.map((item: any) => item.original.id);
		this.valueForItem = this.selectItems.map((item: any) => item.original.custom_id).join(", ");
		this.clearProdOrders();
	}
	valueHelperIconClick(type: any) {
		if (type === this.valueHelperType.PRODORDER) {
			this.valueHelperUrl = "/ProdOrders";
			this.selectedValueHelperType = this.valueHelperType.PRODORDER;
			this.valueHelperColumns[1].accessor = "order_type";
			this.valueHelperColumns[1].Header = $localize`Order Type`;
			this.filterHandler();
			this.valueHelperTitle = $localize`Prod Orders`;
			this.valueHelperSortBy = "id";
			this.valueHelperSortType = "desc";
			this.valueHelperAdditionalFilterQuery = "is_closed eq false";
		} else {
			this.selectedValueHelperType = this.valueHelperType.ITEM;
			this.valueHelperColumns[1].accessor = "name";
			this.valueHelperColumns[1].Header = $localize`Name`;
			this.valueHelperUrl = "/Items";
			this.filterHandler();
			this.valueHelperTitle = $localize`Items`;
			this.valueHelperSortBy = "custom_id";
			this.valueHelperSortType = "asc";
			this.valueHelperAdditionalFilterQuery = "";
		}
		this.isValueHelpDialog = true;
	}
	onSearchClick(inputValue: string): void {
		this.prodOrderGrid!.globalSearchFieldValue = inputValue;
		this.prodOrderGrid?.searchFromServer(this.prodOrderGrid!.globalSearchFieldValue);
		// Perform your desired logic here, like search or filter
	}
	onChangeProdOrderStatus() {
		this.onGo();
	}
	rowClick(event: any) {
		const selectedFlatRows = event.detail.selectedFlatRows;
		if (this.selectedValueHelperType === this.valueHelperType.PRODORDER) {
			this.selectProdOrders = selectedFlatRows;
		} else {
			this.selectItems = selectedFlatRows;
		}
	}
	onChangeProdOrder(event: any) {
		const inputValArr = (event.target as any).value.split(", ");
		this.selectProdOrders = this.selectProdOrders.filter((prodOrder: any) =>
			inputValArr.includes(prodOrder.original.custom_id)
		);
		this.selectProdOrderIds = this.selectProdOrders.map(
			(prodOrder: any) => prodOrder.original.id
		);
		this.valueForProdOrder = this.selectProdOrders
			.map((prodOrder: any) => prodOrder.original.custom_id)
			.join(", ");
		this.clearItems();
	}
	changeDate(event: any) {
		const dates = event.detail.value.split(" - ");

		if (dates.length > 1) {
			this.start = moment.utc(dates[0], "DD/MM/YYYY").local().toISOString();
			this.end = moment.utc(dates[1], "DD/MM/YYYY").local().toISOString();
		}
	}
	async onGo() {
		this.allOrders = [];
		this.top = 200;
		this.skip = 0;
		const prodOrderValue = (document.getElementById("prodOrderInput") as Input).value;
		const itemValue = (document.getElementById("itemInput") as Input).value;
		if (prodOrderValue.length) {
			const prodOrder = prodOrderValue.split(",");
			this.selectProdOrderIds = this.selectProdOrderIds.concat(prodOrder);
		}

		if (itemValue.length) {
			const item = itemValue.split(",");
			this.selectItemIds = this.selectItemIds.concat(item);
		}
		this.prodOrderGrid!.customUrl = `/get-orders?halls=${this.selectedHalls}&start=${this.start}&end=${this.end}&prodOrders=${this.selectProdOrderIds}&items=${this.selectItemIds}&machineGroups=${this.selectedMachineGroups}&status=${this.opearationStatus}&top=${this.top}&skip=${this.skip}`;

		this.prodOrderGrid!.render();
		this.prodOrderGrid!.onPagination(true, true);
	}
	onSettingClick() {
		this.prodOrderGrid?.toggleSettingDialog();
	}
	onReset() {
		this.selectProdOrderIds = [];
		this.valueForProdOrder = "";
		this.selectItemIds = [];
		(document.getElementById("prodOrderInput") as Input).value = "";
		(document.getElementById("itemInput") as Input).value = "";

		this.hallRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];

		this.selectedHalls = this.halls.length > 0 ? [this.halls[0].id!] : [];

		if (this.hallRef.elementRef.nativeElement.children.length > 0) {
			this.hallRef.elementRef.nativeElement.children[0].selected = true;
		}

		this.machineGroupRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
		this.onGo();
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}
	onSaveValueHelpDialog() {
		this.isValueHelpDialog = false;
		if (this.selectedValueHelperType === this.valueHelperType.PRODORDER) {
			const newArray = this.selectProdOrders
				.filter((item: any) => item?.original?.id)
				.map((item: any) => item?.original?.custom_id ?? "");

			this.selectProdOrderIds = this.selectProdOrders
				.filter((item: any) => item?.original?.id)
				.map((item: any) => item?.original?.id ?? "");
			this.valueForProdOrder = newArray.join(", ");
			this.clearItems();
		} else {
			const newArray = this.selectItems.map((item: any) => item.original.custom_id);
			this.selectItemIds = this.selectItems.map((item: any) => item.original.id);
			this.valueForItem = newArray.join(", ");
			this.clearProdOrders();
		}

		this.clearHallSelection();
		this.clearMachineGroup();
	}
	clearItems() {
		this.selectItemIds = [];
		this.valueForItem = "";
		(document.getElementById("itemInput") as Input).value = "";
	}
	clearProdOrders() {
		this.selectProdOrders = [];
		this.valueForProdOrder = "";
		this.selectProdOrderIds = [];
		(document.getElementById("prodOrderInput") as Input).value = "";
	}
	clearHallSelection() {
		this.selectedHalls = [];
		this.hallRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
	}
	clearMachineGroup() {
		this.selectedMachineGroups = [];
	}

	setSelectedTableData(selectedIds: any) {
		const selectedIdsIndex: number[] = [];
		const dynamicObject: boolean[] = [];
		selectedIds.forEach((prod: any) => {
			const index: number = this.childComponent?.data.findIndex(
				(item: any) => item.id == prod
			);
			selectedIdsIndex.push(index);
		});
		selectedIdsIndex.forEach(key => {
			dynamicObject[key] = true;
		});

		this.childComponent!.selectedRowsId = dynamicObject;
	}

	public allOrders: any[] = [];

	processMainData(data:any){
		// const result: any = {};

		// data[1].forEach((operation: any) => {
		// 	const { prodOrderPos } = operation;
		// 	const { prodOrder } = prodOrderPos;
	
		// 	if (!result[prodOrder.id]) {
		// 		result[prodOrder.id] = {
		// 			...prodOrder,
		// 			...prodOrderPos,
		// 			operations: []
		// 		};
		// 	}
	
		// 	result[prodOrder.id].operations.push(operation);
		// });

		data[1].forEach((op: any) => {
			const id = op?.prodOrderPos?.prodOrder?.id;
			const index = this.allOrders.findIndex((o: any) => o.prodOrder.id === id);
			if (index < 0) {
				this.allOrders.push(op?.prodOrderPos);
			}
		})
	
		// const transformedData = Object.values(result);
		
		// this.finalData.push(...transformedData);
		data[1].forEach((op: any) => {
			const id = op?.prodOrderPos?.prodOrder?.id;
			const index = this.allOrders.findIndex((o: any) => o.prodOrder.id === id);
			if (index > -1) {
				if (!this.allOrders[index].subRows) {
					this.allOrders[index]['subRows'] = []
				}
				const inx = this.allOrders[index].subRows.findIndex((o: any) => o.id === op.id);
				if (inx < 0) {
					this.allOrders[index].subRows.push(op);
				}
			}
		})
		this.prodOrderGrid!.data = this.allOrders;
		this.prodOrderGrid?.render();
	}
	processData(data: any) {
		let selectedIds: number[] = [];
		selectedIds = (
			this.selectedValueHelperType === this.valueHelperType.PRODORDER
				? this.selectProdOrderIds
				: this.selectItemIds
		) as number[];
		this.selectedValueHelperType === this.valueHelperType.PRODORDER
			? this.selectProdOrderIds
			: this.selectItemIds;

		if (this.childComponent?.data.length && selectedIds.length) {
			this.setSelectedTableData(selectedIds);
		}
	}
	closeValueHelpDialog() {
		this.isValueHelpDialog = false;
	}

	async onSaveOrderViewDialog() {
		this.isBusy = true;
		this.saveButtonEnable = true;
		this.isLoading = true;
		const payload = {
			plan_machine_id: this.selectedOperation.plan_machine_id,
			machine_id: this.selectedOperation.machine?.id,
			status: this.selectedOperation.status,
			status_plan: this.selectedOperation.status,
			te: this.selectedOperation.te.toString().replace(/,/g, "."),
			plan_te: this.selectedOperation.te,
			tool_id: this.selectedOperation.tool?.id,
			tool_reference_nr: this.selectedOperation.tool_reference_nr,
			start: moment(this.operationStart, "DD.MM.YYYY, HH:mm").local().toISOString(),
			plan_start: moment(this.operationStart, "DD.MM.YYYY, HH:mm").local().toISOString(),
			end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			plan_end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			is_changed: true,
			cavity: this.selectedOperation.cavity,
			tr: this.selectedOperation.tr,
			teardown_time: this.selectedOperation.teardown_time,
			operation_code: this.selectedOperation.operation_code,
			operation_code_plan: this.selectedOperation.operation_code,
		};
		await Promise.all([this.calculateEnd(), this.saveOperation(payload)])
			.then(() => {
				this.prodOrderGrid!.onFilterAndSorting("", "", "contains");
				this.prodOrderGrid!.render();
				this.isDialogOpen = false;
				this.saveButtonEnable = true;
				this.isBusy = false;
				this.isLoading = false;
			})
			.catch(() => {
				this.isBusy = false;
				this.saveButtonEnable = false;
				this.isLoading = false;
			});
	}

	changeTE(value: any) {
		this.selectedOperation.te = value;
		this.calculateEnd();
	}

	calculateEnd() {
		this.isEndBusy = true;
		const quantity = this.selectedOperation.prodOrderPos!.quantity ?? 0;

		const te: number = (this.selectedOperation.te ?? 0).toString().replace(/,/g, ".");
		const tr: number = this.selectedOperation.tr ?? 0;

		const start = moment.utc(this.selectedOperation.start).toISOString();
		const cavity = this.selectedOperation.cavity ?? 1;

		const usageFactor = this.selectedOperation.machine.usage_factor;
		const teardown = this.selectedOperation.teardown_time;
		const duration = this.getOrderDuration({
			te: te,
			tr: tr,
			cavity: cavity,
			quantity: quantity,
			usageFactor: usageFactor,
			teardownTime: teardown,
		});

		return new Promise<void>(resolve => {
			this.commonService
				.get(
					`capacity-plan/machine/${this.selectedOperation.machine?.id}?start=${start} & duration=${duration}`,
					false
				)
				.subscribe({
					next: (res: any) => {
						this.operationEnd = moment.utc(res.end).local().format("DD.MM.YYYY, HH:mm");
						this.isEndBusy = false;
						resolve();
					},
				});
		});
	}

	getOrderDuration({
		te,
		cavity,
		tr,
		quantity,
		usageFactor,
		teardownTime,
	}: {
		te: any;
		tr: any;
		cavity: any;
		quantity: any;
		usageFactor: any;
		teardownTime: any;
	}) {
		let usageValue = parseFloat(usageFactor.toString().split("%")[0]);
		const timePerQuantity = parseFloat(te) / parseFloat(cavity);
		let duration =
			timePerQuantity * parseFloat(quantity) +
			parseFloat(tr ?? 0) +
			parseFloat(teardownTime ?? 0);
		if (usageValue > 1) {
			usageValue = usageValue / 100;
		}
		if (usageValue > 0) {
			duration = duration / usageValue;
		}

		return duration;
	}

	saveOperation(payload: any) {
		return new Promise<void>(resolve => {
			this.commonService
				.patch(`ProdOrderPosOperations/${this.selectedOperation.id}`, payload)
				.subscribe({
					next: (res: any) => {
						const p = {
							quantity: this.selectedOperation.prodOrderPos?.quantity,
							is_production_possible:
								this.selectedOperation.prodOrderPos?.is_production_possible,
						};
						this.commonService
							.patch(`ProdOrderPos/${this.selectedOperation.prodOrderPos!.id}`, p)
							.subscribe({
								next: (res: any) => {
									resolve();
								},
							});
					},
				});
		});
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.saveButtonEnable = true;
	}

	onLoadMoreForCustomAPI() {
		this.top = 200;
		this.skip += 200;

		this.prodOrderGrid!.customUrl = `/get-orders?halls=${this.selectedHalls}&start=${this.start}&end=${this.end}&prodOrders=${this.selectProdOrderIds}&items=${this.selectItemIds}&machineGroups=${this.selectedMachineGroups}&status=${this.opearationStatus}&top=${this.top}&skip=${this.skip}`;

		this.prodOrderGrid!.render();
		this.prodOrderGrid!.onPagination(false, true);
	}

	public onDoubleClick = (rowData: any): void => {	
		this.isDialogOpen = true;
		this.saveButtonEnable = false;
		this.selectedOperation = new ProdOrderPosOperation().deserialize(rowData);
		setTimeout(() => {
			this.dialogTitle =
			this.clientName == "shopfloor"
				? `${this.orderDetailsDialog.selectedOperation.prodOrderPos.prodOrder.assembly} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos.prodOrder.custom_id} ${this.orderDetailsDialog.selectedOperation.name} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.name}`
				: `${this.orderDetailsDialog.selectedOperation.name} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.name}`;
		},);

		if (this.selectedOperation.prodOrderPos?.item && this.selectedOperation.prodOrderPos) {
			this.selecteItem = `${this.selectedOperation.prodOrderPos?.item?.custom_id} - ${this.selectedOperation.prodOrderPos?.item?.name}`;
		}

		if (this.selectedOperation?.start) {
			this.operationStart = moment
				.utc(this.selectedOperation?.start)
				.local()
				.format("DD.MM.YYYY, HH:mm");
		}

		if (this.selectedOperation?.end)
			this.operationEnd = moment
				.utc(this.selectedOperation?.end)
				.local()
				.format("DD.MM.YYYY, HH:mm");
		this.opeartionMachines = JSON.parse(
			JSON.stringify(
				this.orderDetailsDialog.selectedOperation.prodOrderPosOperationAltMachines
			)
		);
	};
}

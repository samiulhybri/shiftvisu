import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import React from "react";
import { Button, Text, FlexBox } from "@ui5/webcomponents-react";
import { CommonService } from "@app/shared/services/common.service";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Hall } from "@app/shared/models/hall.model";
import { ProdOrderPosOperationStatusClass } from "@app/shared/enums/ProdOrderPosOperationStatus";

@Component({
	selector: "app-range-overview",
	templateUrl: "./range-overview.component.html",
	styleUrl: "./range-overview.component.css",
})
export class RangeOverviewComponent {
	@ViewChild("gridTable", { static: false }) childComponent: CustomReactGridTable | undefined;

	columns: any = [
		{
			Header: $localize`Loading`,
			accessor: ".",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
	];
	dialogColumns: any = [];
	dialogData: any = [];
	selectedRow: any;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	showPopOver: boolean = false;
	top: number = 40;
	skip: number = 0;
	statusQuery: string = "";
	globalSearchValue: string = "";
	extraButtonTitle: string = $localize`Go`;
	selectHallTitle: string = $localize`Select Hall`;
	dialogTitile: string = "";
	selectedHalls: any[] = [];
	opener = "";
	tableRows = [
		{ label: "Plan", property: "qty_prod_order" },
		{ label: "Call-offs", property: "qty_call_off" },
		{ label: "Warehouse", property: "qty_stock" },
		{ label: "Range", property: "qty_backlog" },
	];
	weekViewData = {
		textAccessor: "name",
		idAccessor: "id",
		data: [
			{
				id: 7,
				name: $localize`Range overview 7 days`,
			},
			{
				id: 14,
				name: $localize`Range overview 14 days`,
			},
			{
				id: 30,
				name: $localize`Range overview 30 days`,
			},
			{
				id: 1,
				name: $localize`Range without casting order`,
			},
		],
	};

	hallMultiComboBoxData = {
		textAccessor: "name",
		idAccessor: "id",
		isSelectedAccessor: "isSelected",
		data: [],
	};
	customUrl: string = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&hall_id=${JSON.parse(localStorage.getItem("Hall") || "[]")}&$status=1&$inIt=${JSON.parse(localStorage.getItem("Hall") || "[]").length ? "" : 1}&$backlog=''`;
	rangeList: { numberOfWeek: string; value: number }[] = [];
	backlogs: any = [];
	popoverColumns: any = [
		{
			Header: $localize`Status`,
			accessor: "status",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Total Quantity`,
			accessor: "total_quantity",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "End",
		},
	];

	popoverData: any = [];
	rowData: any = [];

	@ViewChild("gridTable", { static: false }) gridTable: CustomReactGridTable | undefined;

	constructor(private commonService: CommonService) {}

	ngAfterViewInit(): void {
		const backLogs = this.setBacklogs();
		this.gridTable!.customUrl = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&hall_id=${JSON.parse(localStorage.getItem("Hall") || "[]")}&$status=1&$inIt=1&$backlog=''`;
		const comboBoxData = this.getComboBoxData();

		Promise.all([backLogs, comboBoxData]).then(x => this.renderTableColumns());
	}

	setBacklogs() {
		return new Promise((resolve, reject) => {
			this.commonService
				.get(
					`range-overview/range?$top=1&$skip=0&hall_id=&$status=&$inIt=1&$backlog=''`,
					false,
					true
				)
				.subscribe({
					next: (res: any) => {
						if (res.length) this.backlogs = res[0].backlogs;
						resolve(true);
					},
					error: err => {
						console.error(err);
						this.backlogs = [];
						reject(err);
					},
				});
		});
	}

	renderTableColumns() {
		let backlogs = this.backlogs ?? [];
		if (this.columns.length === 1) {
			this.columns = [
				{
					Header: $localize`Items`,
					accessor: "item.name",
					isSelected: true,
					disableFilters: true,
					disableGroupBy: true,
					disableSortBy: true,
				},
				{
					Header: $localize`ID`,
					accessor: "item.custom_id",
					isSelected: true,
					disableFilters: true,
					disableGroupBy: true,
					disableSortBy: true,
				},
				...backlogs.map((backlog: any, i: number) => ({
					Header:
						i === 0
							? `< ${backlogs[1].week} - ${backlogs[1].year}`
							: `${backlog.week} - ${backlog.year}`,
					accessor: `backlogs[${i}].qty_backlog`,
					isSelected: true,
					hAlign: "End",
					disableFilters: true,
					disableGroupBy: true,
					disableSortBy: true,
					Cell: ({ row }: { row: any }) => {
						let qty_backlog: any = Math.round(row.original.backlogs[i].qty_backlog);
						const currentLanguage = localStorage.getItem("CurrentLanguage") || "en";
						qty_backlog =
							currentLanguage !== "en"
								? new Intl.NumberFormat("de-DE").format(qty_backlog)
								: qty_backlog.toLocaleString("en-US");
						return (
							<React.StrictMode>
								<FlexBox>
									<Text
										style={
											qty_backlog.replace(/[.,]/g, "") < 0
												? { color: "red", fontWeight: "bold" }
												: {}
										}>
										{qty_backlog}
									</Text>
								</FlexBox>
							</React.StrictMode>
						);
					},
				})),
			];
		} else if (this.columns.length === 1) {
			this.columns[0].Header = "";
		}

		if (this.childComponent) {
			this.childComponent.columns = this.columns;
			this.childComponent.ngOnChanges();
			this.childComponent.render();
		}
	}

	onSearchForCustomAPI(searchValue: string) {
		this.top = 40;
		this.skip = 0;
		this.globalSearchValue = searchValue;
		this.gridTable!.customUrl = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&$filter=${encodeURIComponent(this.globalSearchValue)}&$status=${this.statusQuery}&hall_id=${this.selectedHalls}&$backlog=''`;
		this.renderTableColumns();
		this.gridTable?.onPagination(true, true);
	}

	onLoadMoreForCustomAPI() {
		this.top = 40;
		this.skip += 40;

		this.gridTable!.customUrl = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&$status=${this.statusQuery}&$filter=${encodeURIComponent(this.globalSearchValue)}&hall_id=${this.selectedHalls}&$backlog=''`;
		this.renderTableColumns();
		this.gridTable?.onPagination(false, true);
		this.gridTable!.isBusy = false;
	}

	segmentedButtonClick(status: any) {
		this.top = 40;
		this.skip = 0;

		switch (status) {
			case "ALL":
				this.statusQuery = "";
				break;
			case "ACTIVE":
				this.statusQuery = "1"; // Critical
				break;
			case "INACTIVE":
				this.statusQuery = "0"; // Not Critical
				break;
		}
		if (this.gridTable) {
			this.gridTable.customUrl = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&$status=${this.statusQuery}&$filter=${encodeURIComponent(this.globalSearchValue)}&hall_id=${this.selectedHalls}&$backlog=''`;
			this.renderTableColumns();
			this.gridTable?.onPagination(true, true);
		}
	}

	comboBoxSelectionChanged(event: any) {
		const selectedId = event.detail.item.id;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	getComboBoxData() {
		return new Promise((resolve, reject) => {
			let requests: ODataBatchCall[] = [];
			requests.push(
				new ODataBatchCall(
					0,
					"get",
					`\/odata\/Halls?$filter=is_active eq true and is_enabled_plan_visu eq true`
				)
			);
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.hallMultiComboBoxData.data = response.responses[0].body.value.map(
						(data: Hall) => {
							const hall = new Hall().deserialize(data);
							hall.isSelected = false;
							return hall;
						}
					);
					const halls: Hall[] = this.hallMultiComboBoxData.data;
					if (halls) {
						const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
						if (cachedHall.length) {
							halls.forEach((hall: any) => {
								hall.name = hall.custom_id + " - " + hall.name;
								hall.isSelected = cachedHall.includes(hall.id);
							});
							this.selectedHalls = cachedHall;
						} else {
							this.selectedHalls = [halls[0].id];
							(this.hallMultiComboBoxData.data[0] as any).isSelected = true;
							localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
						}
					}

					resolve(true);
				},
				error: e => {},
			});
		});
	}

	handleExtraButtonClick() {
		this.top = 40;
		this.skip = 0;
		if (this.gridTable) {
			this.gridTable.customUrl = `/range-overview/range?$top=${this.top}&$skip=${this.skip}&$status=${this.statusQuery}&$filter=${encodeURIComponent(this.globalSearchValue)}&hall_id=${this.selectedHalls}&$backlog=''`;
			this.renderTableColumns();
			this.gridTable?.onPagination(true, true);
		}
	}

	multiSelectOneSelectionChange(event: any) {
		this.selectedHalls = event.detail.items.map((item: any) => parseInt(item.id));
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
	}

	close() {
		this.showPopOver = false;
	}

	getPopoverData(genId: any) {
		const data = this.rowData.find((row: any) => row.id === parseInt(genId));
		return new Promise((resolve, reject) => {
			this.commonService
				.get(
					`range-overview/plans?year=${data.year}&week=${data.week}&itemId=${this.selectedRow?.item?.id}`,
					false,
					true
				)
				.subscribe({
					next: (res: any) => {
						if (res.length) {
							res = res.map((item: any) => {
								const currentLanguage =
									localStorage.getItem("CurrentLanguage") || "en";
								item.total_quantity =
									currentLanguage !== "en"
										? new Intl.NumberFormat("de-DE").format(item.total_quantity)
										: item.total_quantity.toLocaleString("en-US");
								item.status = ProdOrderPosOperationStatusClass.getStateTranslate(
									item.status
								);
								return item;
							});
							this.popoverData = res;
						} else {
							this.popoverData = [];
						}
						resolve(res);
					},
					error: err => {
						console.error(err);
						reject(err);
					},
				});
		});
	}

	public onDoubleClick = (rowData: any): void => {
		this.selectedRow = rowData;
		this.dialogTitile = `${this.selectedRow.item.name ?? ""} (${this.selectedRow.item.custom_id ?? ""})`;
		this.rowData = [];
		console.log(this.selectedRow); //TODO: remove later

		let backlogs = this.selectedRow.backlogs;
		let rangeList: { numberOfWeek: string; value: number }[] = [];
		backlogs = backlogs.map((bl: any) => {
			bl.qty_stock = Math.round(bl.qty_stock) < 0 ? 0 : Math.round(bl.qty_stock);
			bl.qty_prod_order = Math.round(bl.qty_prod_order);
			bl.qty_call_off = Math.round(bl.qty_call_off);
			bl.qty_backlog = Math.round(bl.qty_backlog);
			return bl;
		});
		// barchart data prepare
		if (backlogs.length) {
			backlogs.forEach((backlog: any) =>
				rangeList.push({
					numberOfWeek: `${backlog.year}-${backlog.week}`,
					value: backlog.qty_backlog,
				})
			);
		}

		this.rangeList = rangeList;

		// KW table data prepare
		this.dialogColumns = [
			{
				Header: $localize`KW`,
				accessor: "kw",
				isSelected: true,
				disableGroupBy: true,
				disableResizing: true,
				disableSortBy: true,
				disableFilters: true,
			},
		];
		if (backlogs.length) {
			for (let i = 0; i < backlogs.length; i++) {
				let headerText =
					i === 0
						? `< ${backlogs[1].week} - ${backlogs[1].year}`
						: `${backlogs[i].week} - ${backlogs[i].year}`;
				this.dialogColumns.push({
					Header: headerText,
					accessor: `backlogs[${i}]`,
					isSelected: true,
					hAlign: "End",
					disableGroupBy: true,
					disableResizing: true,
					disableSortBy: true,
					disableFilters: true,
					Cell: (instance: { row: any }) => {
						const { row } = instance;
						const value = row.original.backlogs[i];
						const index = row.index;

						if (index === 0 && i != 0) {
							const genId = JSON.stringify(Math.floor(Math.random() * 10000));
							this.rowData.push({
								week: backlogs[i].week,
								year: backlogs[i].year,
								id: parseInt(genId),
							});
							return (
								<React.StrictMode>
									<FlexBox
										id={genId}
										style={{
											cursor: "pointer",
											width: "100%",
											height: "100%",
											display: "flex",
											justifyContent: "end",
											alignItems: "center",
										}}
										onClick={() => {
											this.showPopOver = false;
											this.opener = genId;

											this.getPopoverData(genId).then((res: any) => {
												this.showPopOver = true;
											});
										}}>
										<Text
											style={
												value.replace(/[.,]/g, "") < 0
													? { color: "red", fontWeight: "bold" }
													: {}
											}>
											{value}
										</Text>
									</FlexBox>
								</React.StrictMode>
							);
						} else {
							return (
								<React.StrictMode>
									<FlexBox>
										<Text
											style={
												value.replace(/[.,]/g, "") < 0
													? { color: "red", fontWeight: "bold" }
													: {}
											}>
											{value}
										</Text>
									</FlexBox>
								</React.StrictMode>
							);
						}
					},
				});
			}
		}

		let tableData: { kw: any; backlogs: any }[] = [];
		const currentLanguage = localStorage.getItem("CurrentLanguage") || "en";
		const numberFormat = currentLanguage !== "en" ? new Intl.NumberFormat("de-DE") : null;

		this.tableRows.forEach((row: any) => {
			const bl = backlogs.map((b: any) =>
				numberFormat
					? numberFormat.format(b[row.property])
					: b[row.property].toLocaleString("en-US")
			);
			tableData.push({
				kw: row.label,
				backlogs: bl,
			});
		});

		this.dialogData = tableData;
		this.isDialogOpen = true;
	};
}

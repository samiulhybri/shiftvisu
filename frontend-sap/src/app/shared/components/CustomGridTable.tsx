import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation} from "@angular/core";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import {
	ThemeProvider,
	AnalyticalTable,
	FlexBox,
	Button,
	Icon,
	Input as ReactInput,
	SegmentedButton,
	SegmentedButtonItem,
	Switch,
	AnalyticalTableColumnDefinition,
	ColorPalette,
	ColorPaletteItem,
	Text,
	MultiComboBox,
	MultiComboBoxItem,
	DatePicker,
	DateRangePicker,
	Label,
	AnalyticalTableHooks,
	CheckBox as UI5Checkbox,
	ComboBox,
	ComboBoxItem,
	TextArea
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import { CommonService } from "@app/shared/services/common.service";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import { Toolbar, ToolbarSpacer } from "@ui5/webcomponents-react-compat";
import {BrowserCodeReader, BrowserMultiFormatReader, BarcodeFormat, IScannerControls } from '@zxing/browser';
import {ButtonConfig} from "@app/shared/interfaces/ButtonConfig";
import { ICustomButton } from "../interfaces/custom-button.interface";
import moment from "moment";

const containerElementRef = "CustomObjectPageLayout";

@Component({
	selector: "app-grid-table",
	templateUrl: "./custom-table/grid-modal.html",
	encapsulation: ViewEncapsulation.None,
})
export class CustomReactGridTable implements OnChanges, OnDestroy, AfterViewInit, OnInit {
	private root: Root | null = null;
	@ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;
	@Input() public headerTitle: any = "";
	@Input() public productionPlanDefaultButtonText: any = "";
	@Input() public addButtonText: any = "";
	@Input() public refButtonText: any = "";
	@Input() public extraButtonText: any = "";
	@Input() public deleteButtonText: any = "";
	@Input() public defaultButtonText: any = "";
	@Input() public button1Text: any = "";
	@Input() public button2Text: any = "";
	@Input() public button3Text: any = "";
	@Input() public showRowDataCount: boolean = false;
	@Input() public showTripButtons: any = false;
	@Input() public showAction: any = true;
	@Input() public showSearch: any = true;
	@Input() public showSearchScanner: any = false;
	@Input() public showDownload: any = true;
	@Input() public disableDownloadButton: any = true;
	@Input() public showNewButton: any = true;
	@Input() public showRefreshButton: any = false;
	@Input() public showExtraButton: any = false;
	@Input() public datePickerPlaceholder: string = "";
	@Input() public dateRangePickerPlaceholder: string = "";
	@Input() public showDatePicker: any = false;
	@Input() public showDateRangePicker: any = false;
	@Input() public datePickerFormat: string = "";
	@Input() public datePickerValue: string = "";
	@Input() public showTableSettingBtn: any = true;
	@Input() public editPermission: any = true;
	@Input() public showActiveButton: any = false;
	@Input() public selectionMode: any = "Multiple";
	@Input() public showValueHelp: any = false;
	@Input() public columns: any = [];
	@Input() public url: string = "";
	@Input() public customUrl: string = "";
	@Input() public expandQuery?: string = "";
	@Input() public additionalFilterQuery: string = "";
	@Input() public filterQuery: string = "";
	@Input() public model?: any;
	@Input() public isGlobalSearchVisible: boolean = true;
	@Input() public isBusy: boolean = false;
	@Input() public isBaseVisu: boolean = false;
	@Input() public isCustomApiCall: boolean = false;
	@Input() public rowHeight: number | undefined;
	@Input() public headerRowHeight: number | undefined;
	@Input() customData = false;
	@Input() isTreeTable = false;
	@Input() isTreeTableHookEnable = true;
	@Input() isServerSideSorting:boolean | undefined;
	@Input() data: any = [];
	@Input() limit = 40;
	@Input() selectedRowsId = {};
	@Input() globalFilterValue = "";
	@Input() enableServerSideFiltering: boolean = false;
	@Input() useOdataStyles: boolean = true;
	@Input() isCozy: boolean = false;
	@Input() isComboBoxOneActive: boolean = false;
	@Input() isComboBoxTwoActive: boolean = false;
	@Input() comboBoxOneLabelText: string = "";
	@Input() comboBoxTwoLabelText: string = "";
	@Input() isMultiSelectOneActive: boolean = false;
	@Input() isMultiSelectTwoActive: boolean = false;
	@Input() isMultiSelectThreeActive: boolean = false;
	@Input() isMultiSelectFourActive: boolean = false;
	@Input() multiSelectOneLabelText: string = "";
	@Input() multiSelectTwoLabelText: string = "";
	@Input() multiSelectThreeLabelText: string = "";
	@Input() multiSelectFourLabelText: string = "";
	@Input() multiSelectOnePlaceholder: string = "";
	@Input() multiSelectTwoPlaceholder: string = "";
	@Input() multiSelectThreePlaceholder: string = "";
	@Input() multiSelectFourPlaceholder: string = "";
	@Input() isMultiSelectOneSelectAllFlag: boolean = true;
	@Input() onDoubleClick?: (rowData: any) => void;

	@Input() keyForCacheCustomDataTableColumns: string = "";
	@Input() comboBoxOneData?: { textAccessor: string; idAccessor: string; data: any[] };
	@Input() comboBoxTwoData?: { textAccessor: string; idAccessor: string; data: any[] };
	@Input() multiSelectOneData?: {
		textAccessor: string;
		idAccessor: string;
		isSelectedAccessor?: string;
		data: any[];
	};
	@Input() multiSelectTwoData?: { textAccessor: string; idAccessor: string; data: any[] };
	@Input() multiSelectThreeData?: { textAccessor: string; idAccessor: string; data: any[] };
	@Input() multiSelectFourData?: { textAccessor: string; idAccessor: string; data: any[] };
	@Input() segmentButtonItems: { id: string; name: string; defaultSelect?: boolean }[] = [];
	@Input() showEditButton = true;
	@Input() showDeleteButton = true;
	@Input() showDeleteButtonInHeader = false;
	@Input() addButtonDisable = false;
	@Input() extraButtonDisable: boolean | undefined = false;
	@Input() isButtonDisabled: boolean = false;
	@Input() customActionButtons: any[] = [];
	@Input() customSecondaryToolbarButtons: ICustomButton[] = [];
	@Input() withRowHighlight = false;
	@Input() multipleButtons: ButtonConfig[] = [];
	@Input() disableColumnRule: ((value: any) => boolean) | null = null;
	@Output() public valueHelperButtonClick = new EventEmitter<any>();
	@Output() comboBoxOneSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() comboBoxTwoSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() multiSelectOneSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() multiSelectTwoSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() multiSelectThreeSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() multiSelectFourSelectionChanged: EventEmitter<any> = new EventEmitter();
	@Output() public editClick = new EventEmitter<object>();
	@Output() public deleteClick = new EventEmitter<object>();
	@Output() public deleteClickNew = new EventEmitter<object>();
	@Output() public rowClick = new EventEmitter<Event>();
	@Output() public newButtonClick = new EventEmitter<any>();
	@Output() public refreshButtonClick = new EventEmitter<any>();
	@Output() public onSearchForCustomAPI = new EventEmitter<any>();
	@Output() public onSearchOnKeyUp = new EventEmitter<any>();
	@Output() public onLoadMoreForCustomAPI = new EventEmitter<any>();
	@Output() public extraButtonClick = new EventEmitter<any>();
	@Output() public deleteButtonClick = new EventEmitter<any>();
	@Output() public defaultButtonClick = new EventEmitter<any>();
	@Output() public changeDatePicker = new EventEmitter<any>();
	@Output() public changeRangeDatePicker = new EventEmitter<any>();
	@Output() public segmentedButtonClick = new EventEmitter<any>();
	@Output() public clearButtonClick = new EventEmitter<any>();
	@Output() public settingsButtonClick = new EventEmitter<any>();
	@Output() public downloadButtonClick = new EventEmitter<any>();
	@Output() public productionPlanDefaultButton = new EventEmitter<any>();
	@Output() public productionPlanButton = new EventEmitter<any>();
	@Output() public searchClick = new EventEmitter<any>();
	@Output() public multipleButtonEmitter = new EventEmitter<any>();
	@Output() processData = new EventEmitter<any>();
	@Output() segmentButtonChange = new EventEmitter<any>();
	@Output() columnReorder = new EventEmitter<any>();
	public planningView = "Planning View";
	public clearTrip = $localize`Clear Trip`;

	public top: number = this.limit;
	public skip: number = 0;
	@Input() sortBy: string | undefined;
	@Input() customSortType: string | undefined = "asc";
	public sortType: string | undefined;
	public fieldName: string = "";
	public searchText: any;
	public filterOperator: string = LogicalOperator.CONTAINS;
	public buttonEnabled: "ACTIVE" | "INACTIVE" | "ALL" = "ACTIVE";
	public isNoDataSelected = true;
	public isViewSettingsOpen = false;
	public cachedColumn: AnalyticalTableColumnDefinition[] = [];
	public selectedItems: any = [];
	public globalSearchFieldValue = "";
	public scannerControls: IScannerControls | undefined;
	public videoInputDevices: MediaDeviceInfo[] = [];
	public tabChanged: boolean = false;
	public settingChanged: boolean = false;
	public selectAlLClicked: boolean = false;
	public filteredDataCount: number = 0;

	public analyticalTableRef: any = undefined;
	private clickCount = 0;
	private singleClickTimeout: any;
	private clickTimeout: any;

	@ViewChild("resetConfirmDialog", { static: false }) resetConfirmDialog: any;
	@ViewChild("codeScannerDialog", { static: false }) codeScannerDialog: any;
	@ViewChild("viewSettingListDialog", { static: false }) viewSettingListDialog: any;
	@Input() plantId?: number;

	actionColumn = {
		Cell: (instance: any) => {
			const { row, webComponentsReactProperties } = instance;
			const isOverlay = webComponentsReactProperties.showOverlay;

			if (this.customActionButtons && this.customActionButtons.length > 0) {
				return (
					<FlexBox style={{ gap: "5px" }}>
						{this.customActionButtons.map((button: ICustomButton) => (
							<Button
								id={button.id}
								key={button.id}
								disabled={button.disable != null ? button.disable(row) : false}
								hidden={button.hide != null ? button.hide(row) : false}
								onClick={() => button.onClick(row)}
								icon={button.icon}
								design={button.design ?? "Default"}
								style={{ border: "none" }}>
								{button.text}
							</Button>
						))}
					</FlexBox>
				);
			}

			return (
				<FlexBox style={{ gap: "5px" }}>
					{this.showEditButton ? (
						<Button
							id="editButton"
							onClick={() => this.handleEditClick(row.original)}
							icon="edit"
							style={{ border: "none" }}
						/>
					) : null}
					{this.showDeleteButton ? (
						<Button
							id="deleteButton"
							onClick={() => {
								this.handleDeleteClick(row.original, row);
							}}
							icon="delete"
							disabled={isOverlay}
							style={{ border: "none" }}
						/>
					) : null}
				</FlexBox>
			);
		},
		Header: $localize`Action`,
		accessor: ".",
		disableFilters: true,
		hAlign: "Center",
		disableGroupBy: true,
		disableResizing: true,
		disableSortBy: true,
		id: "actions",
		width: 100,
	};

	constructor(private apiService: CommonService) {
		this.handleEditClick = this.handleEditClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleNewButtonClick = this.handleNewButtonClick.bind(this);
		this.handleRefreshButtonClick = this.handleRefreshButtonClick.bind(this);
		this.handleExtraButtonClick = this.handleExtraButtonClick.bind(this);
		this.handleValueHelperButtonClick = this.handleValueHelperButtonClick.bind(this);
		this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
		this.onChangeDatePicker = this.onChangeDatePicker.bind(this);
		this.onChangeRangeDatePicker = this.onChangeRangeDatePicker.bind(this);
		this.handleSegmentedButtonClick = this.handleSegmentedButtonClick.bind(this);
		this.handleRowClick = this.handleRowClick.bind(this);
	}

	ngOnInit() {
		this.sortType = this.customSortType;
		this.top = this.limit;
		this.showActiveButton
			? this.handleSegmentedButtonClick(this.buttonEnabled)
			: this.onPagination();

		if (
			(this.customActionButtons && this.customActionButtons.length > 2) ||
			this.customActionButtons.some(b => b.text)
		) {
			let lengthArray: number[] = this.customActionButtons.map((button: ICustomButton) => {
				return button.text ? 120 : 40;
			});
			this.actionColumn.width = lengthArray.reduce((p, c) => p + c);
		}
	}

	public onFilterAndSorting = (
		fieldName: string = "",
		searchText: any = "",
		filterOperator: string = LogicalOperator.CONTAINS
	) => {
		this.top = this.limit;
		this.skip = 0;
		this.fieldName = fieldName;
		this.searchText = searchText;
		this.filterOperator = filterOperator;

		if (this.showActiveButton) {
			this.handleSegmentedButtonClick(this.buttonEnabled);
		} else {
			if (this.globalSearchFieldValue) {
				this.searchFromServer(this.globalSearchFieldValue);
			} else this.onColumnFiltering();
		}
	};

	public onFilterAndSortingForEdit = (originalItem: any, value: any) => {
		if (value) {
			this.updateRow(value);
		} else {
			const dataIndex = this.data?.findIndex((data: any) => data.id === originalItem);

			if (dataIndex > -1) {
				for (let i = dataIndex; i < this.data.length - 1; i++) {
					this.data[i] = this.data[i + 1];
				}
				this.data.length -= 1;

				if (this.showRowDataCount) {
					this.filteredDataCount -= 1; 
				}
			}

		}
		this.render();
	};

	public updateRow = (value: any) => {
		this.data = this.data.map((data: any) => (data.id === value.id ? value : data));

		if (this.buttonEnabled === "ACTIVE") {
			this.data = this.data.filter(
				(data: any) => data.is_active === true || data.is_active === undefined
			);
		} else if (this.buttonEnabled === "INACTIVE") {
			this.data = this.data.filter(
				(data: any) => data.is_active === false || data.is_active === undefined
			);
		}

		this.render();
	};

	public convertToUTCString(localDateTime: string): string {
		try {
			// Split the date and time
			const [datePart, timePart] = localDateTime.split(" ");
			const [day, month, year] = datePart.split(".").map(Number); // Extract day, month, year

			let hours = new Date().getHours(),
				minutes = new Date().getMinutes();

			if (timePart) {
				hours = parseInt(timePart.split(":")[0]);
				minutes = parseInt(timePart.split(":")[1]);
			}

			// Create a Date object in local time
			const localDate = new Date(year, month - 1, day, hours, minutes);

			// Convert to UTC components
			const utcYear = localDate.getUTCFullYear();
			const utcMonth = String(localDate.getUTCMonth() + 1).padStart(2, "0");
			const utcDay = String(localDate.getUTCDate()).padStart(2, "0");
			const utcHours = String(localDate.getUTCHours()).padStart(2, "0");
			const utcMinutes = String(localDate.getUTCMinutes()).padStart(2, "0");

			// Format as YYYY-MM-DD HH:mm:ss
			return timePart
				? `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}`
				: `${utcYear}-${utcMonth}-${utcDay}`;
		} catch (error) {
			return "";
		}
	}

	public async onColumnFiltering(addQuery: string = "") {
		try {
			if (addQuery) {
				this.additionalFilterQuery = addQuery;
			} else {
				let query =
					this.showActiveButton && this.fieldName
						? `&$filter=${this.fieldName} ${this.filterOperator} ${this.searchText}`
						: `&$filter=`;

				let conditions: string[] = [];

				this.cachedColumn.forEach((column: any) => {
					let value = column.filterValue;
					let condition = "";

					if (typeof value != "undefined" && column.isSelected) {
						switch (column.dataType ?? GridTableColumnDataType.String) {
							case GridTableColumnDataType.Boolean:
								if (column.accessor.includes(".")) {
									const [firstPart, secPart] = column.accessor.split(".");

									condition = ["true", "false"].includes(value.toString())
										? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${value})`
										: "";
								} else {
									condition = ["true", "false"].includes(value.toString())
										? `${column.accessor} ${LogicalOperator.EQ} ${value}`
										: "";
								}
								break;

							case GridTableColumnDataType.Number:
								const number = parseFloat(value);

								if (column.accessor.includes(".")) {
									const [firstPart, secPart] = column.accessor.split(".");

									condition = !isNaN(number)
										? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${number})`
										: ``;
								} else {
									condition = !isNaN(number)
										? `(${column.accessor} ${LogicalOperator.EQ} ${number})`
										: ``;
								}
								break;

							case GridTableColumnDataType.TimeStamp:
								if (!value) return;
								const timeStamp = this.convertToUTCString(value);

								if (timeStamp.includes(" ")) {
									condition = `(${column.accessor} ${LogicalOperator.GE} '${timeStamp + ":00"}' and ${column.accessor} ${LogicalOperator.LE} '${timeStamp + ":59"}')`;
								} else {
									condition = `(${column.accessor} ${LogicalOperator.GE} '${timeStamp + " 00:00:00"}' and ${column.accessor} ${LogicalOperator.LE} '${timeStamp + " 23:59:59"}')`; // When time is not provided
								}

								break;
							case GridTableColumnDataType.MultipleDate:
								if (value.length > 0) {
									let conditions = value.map((date: any) => {
										let [day, month, year] = date.split("-");
										let formattedDate = `${year}-${month}-${day}`;
										return `${column.accessor} ${LogicalOperator.GE} '${moment(`${formattedDate} 00:00:00`).toISOString()}' 
												AND ${column.accessor} ${LogicalOperator.LE} '${moment(`${formattedDate} 23:59:59`).toISOString()}'`;
									});
									condition =
										conditions.length == 1
											? conditions[0]
											: `(${conditions.join(" OR ")})`;
								}
								break;
							case GridTableColumnDataType.Time:
								const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
								if (!timeRegex.test(value)) break;

								if (column.accessor.includes(".")) {
									const [firstPart, secPart] = column.accessor.split(".");

									condition = `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${value})`;
								} else {
									condition = `(${column.accessor} ${LogicalOperator.EQ} ${value})`;
								}
								break;

							case GridTableColumnDataType.NestedString:
								if(!value) break;

								if (!Array.isArray(value)) value = [value];

								let arrayValueQuery = value?.map((val: string) => {
									if (column.accessorArray?.length == 2) {
										const [first, second] = column.accessorArray;
										const splittedAccessorFirst = first.split(".");
										const splittedAccessorSec = second.split(".");

										condition = `(${splittedAccessorFirst[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessorFirst[1]}), '${val.toLowerCase()}'))) or (${splittedAccessorSec[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessorSec[1]}), '${val.toLowerCase()}')))`;
									} else {
										const splittedAccessor = column.accessor.split(".");
										condition = `(${splittedAccessor[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessor[1]}), '${val.toLowerCase()}')))`;
									}

									return condition;
								});

								condition =
									arrayValueQuery.length > 1
										? `(${arrayValueQuery.join(" or ")})`
										: arrayValueQuery.join(" or ");
								break;

							case GridTableColumnDataType.Date:
								const regexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
								const regexYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;
								let dateValue = "";

								if (regexYYYYMMDD.test(value)) {
									// If the date is already in yyyy-mm-dd format, return it as is
									dateValue = value;
								} else if (regexDDMMYYYY.test(value)) {
									// If the date is in dd.mm.yyyy format, convert it to yyyy-mm-dd
									const [day, month, year] = value.split(".");
									dateValue = `${year}-${month}-${day}`;
								}

								if (column.accessor.includes(".")) {
									const [firstPart, secPart] = column.accessor.split(".");
									condition = dateValue
										? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${dateValue})`
										: ``;
								} else {
									condition = dateValue
										? `(${column.accessor} ${LogicalOperator.EQ} '${dateValue}')`
										: ``;
								}

								break;
							default:
								value = value.toString();
								if (value.startsWith("+")) {
									value = value.split("+")[1]?.trim();
								}

								let stringValueQuery =
									typeof value === "string"
										? `(${LogicalOperator.CONTAINS}(tolower(${column.accessor}),'${value.toLowerCase()}'))`
										: value?.map(
												(val: string) =>
													`(${LogicalOperator.CONTAINS}(tolower(${column.accessor}),'${val.toLowerCase()}'))`
											);
								condition =
									typeof value === "string"
										? stringValueQuery
										: stringValueQuery.length > 1
											? `(${stringValueQuery.join(" or ")})`
											: stringValueQuery.join(" or ");
						}

						if (condition) {
							conditions.push(condition);
						}
					}
				});

				if (conditions.length > 0) {
					const filterQueries = conditions.join(" and ");
					query += query.includes("is_active")
						? ` and (${filterQueries})`
						: filterQueries;
				} else {
					query = ""; // No valid conditions, clear the query
				}

				this.additionalFilterQuery = query;
			}

			this.top = this.limit;
			this.skip = 0;
			this.onPagination(true);
		} catch (error) {
			console.log(error);
		}
	}

	public onSorting = (event: any) => {
		this.top = this.limit;
		this.skip = 0;
		this.sortType =
			event.detail.sortDirection == "clear"
				? this.customSortType
				: event.detail.sortDirection;
		this.sortBy = event.detail.column?.id;

		this.onColumnFiltering();
	};

	public onPagination = (isReset = false, isBusy = true) => {
		if (this.customData) {
			this.isBusy = false;
			this.render();
			return;
		}

		this.isBusy = true;
		this.render(); // this one is for busy indicator

		let fullFilterQuery = this.filterQuery;

		if (this.additionalFilterQuery && fullFilterQuery) {
			if (fullFilterQuery.includes("$filter")) {
				fullFilterQuery += " and " + this.additionalFilterQuery;
			} else {
				fullFilterQuery = this.additionalFilterQuery + " and " + fullFilterQuery;
			}
		} else {
			fullFilterQuery += this.additionalFilterQuery;
		}

		if (this.plantId) {
			fullFilterQuery += !fullFilterQuery
				? `plant_id eq ${this.plantId}`
				: ` and plant_id eq ${this.plantId}`;
		}

		this.apiService
			.paginateCustomTableData(
				this.top,
				this.skip,
				this.sortBy,
				this.sortType,
				this.fieldName,
				this.searchText,
				this.customUrl ? this.customUrl : this.url,
				this.expandQuery,
				this.filterOperator,
				this.customUrl ? true : false,
				this.useOdataStyles ? true : false,
				fullFilterQuery,
				this.showRowDataCount ? true : false
			)
			.subscribe(
				result => {
					let tableData;
					const value = !this.useOdataStyles ? result : result.value;
					if (this.model) {
						tableData =
							value.map((item: any) =>
								new this.model().deserialize({ ...item, isSelected: false })
							) || [];
					} else {
						tableData = value || [];
					}

					if (isReset) {
						this.data = tableData;
					} else if (Array.isArray(tableData)) {
						this.data = [...this.data, ...tableData];
					}

					if (this.showRowDataCount && this.useOdataStyles) {
						this.filteredDataCount = result["@count"] || 0;
					}

					this.processData.emit([this.data, tableData]);
					this.isBusy = false;
					this.render();
				},
				error => {
					this.isBusy = false;
					this.processData.emit([]);
					this.render();
				}
			);

		this.skip += this.limit;
	};

	public onColumnsReorder(event: any) {
		this.columnReorder.emit(event);
	}

	public handleEditClick = (value: object) => {
		if (this.editClick) {
			this.editClick.emit(value);
			this.render();
		}
	};

	public handleDeleteClick = (value: object, fullRowValue: any) => {
		if (this.deleteClick) {
			this.deleteClick.emit(value);
			this.deleteClickNew.emit(fullRowValue);
			this.render();
		}
	};

	public handleRowClick = (e: Event) => {
		this.clickCount++;
		if (this.clickTimeout) {
			clearTimeout(this.clickTimeout);
		}
		this.clickTimeout = setTimeout(() => {
			const rowData = (e as any).detail?.row?.original;
			if (this.clickCount === 1) {
				this.SingleClick(e);
			} else if (this.clickCount === 2) {
				if (this.onDoubleClick) {
					this.onDoubleClick(rowData);
				} else if (this.editPermission && this.showAction) {
					this.handleEditClick(rowData);
				}
			}
			this.clickCount = 0;
		}, 200);
	};

	public SingleClick(e: Event) {
		if ((e as any).detail && (e as any).detail.selectedFlatRows) {
		}
		if (this.rowClick) {
			this.rowClick.emit(e);
			this.isNoDataSelected = (e as any).detail.selectedFlatRows.length === 0;
			this.render();
		}
	}

	public handleSettingsButtonClick = () => {
		if (this.settingsButtonClick) {
			this.settingsButtonClick.emit();
			this.render();
		}
	};

	public handleDownloadButtonClick = () => {
		if (this.downloadButtonClick) {
			this.downloadButtonClick.emit();
			this.render();
		}
	};

	public handleProductionPlanDefaultButton = () => {
		if (this.productionPlanDefaultButton) {
			this.productionPlanDefaultButton.emit();
			this.render();
		}
	};
	public handleProductionPlantButton = () => {
		if (this.productionPlanButton) {
			this.productionPlanButton.emit();
			this.render();
		}
	};

	public handleNewButtonClick = () => {
		if (this.newButtonClick) {
			this.newButtonClick.emit();
			this.render();
		}
	};

	public handleRefreshButtonClick = () => {
		if (this.refreshButtonClick) {
			this.refreshButtonClick.emit();
			this.render();
		}
	};

	public handleOnSearchForCustomAPI = (value: string) => {
		if (this.onSearchForCustomAPI) {
			this.onSearchForCustomAPI.emit(value);
			this.render();
		}
	};

	public handleOnSearchOnKeyUp = (value: string) => {
		if (this.onSearchOnKeyUp) {
			this.onSearchOnKeyUp.emit(value);
			this.render();
		}
	};

	public handleOnLoadMoreForCustomAPI = () => {
		if (this.onLoadMoreForCustomAPI) {
			this.onLoadMoreForCustomAPI.emit();
			this.render();
		}
	};

	public handleExtraButtonClick = () => {
		if (this.extraButtonClick) {
			this.extraButtonClick.emit();
			this.render();
		}
	};

	public handleValueHelperButtonClick = () => {
		if (this.valueHelperButtonClick) {
			this.valueHelperButtonClick.emit();
			this.render();
		}
	};

	public handleDeleteButtonClick = () => {
		if (this.deleteButtonClick) {
			this.deleteButtonClick.emit();
			this.render();
		}
	};

	public onChangeDatePicker = (value: object) => {
		if (this.changeDatePicker) {
			this.changeDatePicker.emit(value);
			this.render();
		}
	};

	public onChangeRangeDatePicker = (value: object) => {
		if (this.changeRangeDatePicker) {
			this.changeRangeDatePicker.emit(value);
			this.render();
		}
	};

	public handleSegmentedButtonClick = (selectedSeg: "ACTIVE" | "INACTIVE" | "ALL" = "ACTIVE") => {
		if (this.segmentedButtonClick) {
			this.segmentedButtonClick.emit(selectedSeg);
			this.render();

			this.buttonEnabled = selectedSeg;
			this.filterOperator = selectedSeg == "ACTIVE" ? LogicalOperator.EQ : LogicalOperator.NE;
			this.fieldName = selectedSeg == "ALL" ? "" : "is_active";
			this.searchText = selectedSeg == "ALL" ? "" : true;
			this.skip = 0;
			this.tabChanged = true;

			if (this.globalSearchFieldValue) {
				this.searchFromServer(this.globalSearchFieldValue);
			} else {
				this.onColumnFiltering();
			}
		}
	};

	public handleClearButtonClick = () => {
		if (this.clearButtonClick) {
			this.clearButtonClick.emit();
			this.render();
		}
	};

	public handleGlobalSearch = (event: any) => {
		this.globalSearchFieldValue = event.target.value;

		if (!this.enableServerSideFiltering) {
			this.globalFilterValue = this.globalSearchFieldValue || "";
		}
		this.render();
	};

	applyChanges() {
		if (this.settingChanged) {
			this.columns.forEach((column: AnalyticalTableColumnDefinition, i: number) => {
				const index = this.selectedItems?.findIndex((item: any) => item.id == i);
				this.cachedColumn[i]["isSelected"] = index != -1;
			});

			localStorage.setItem(
				this.keyForCacheCustomDataTableColumns || this.url,
				JSON.stringify(this.cachedColumn)
			);

			this.settingChanged = false;
		}
		this.selectAlLClicked = false;

		this.toggleSettingDialog();
		this.onFilterAndSorting();
	}

	ngOnChanges(changes?: any): void {
		if (!this.root) {
			this.root = createRoot(this.containerRef.nativeElement!);
		}

		if (this.isBaseVisu || this.keyForCacheCustomDataTableColumns) {
			const localStorageColumns = localStorage.getItem(
				this.keyForCacheCustomDataTableColumns || this.url
			);
			let cacheColumnHash: string = '';
			let columnHash: string = '';

			if (localStorageColumns) {
				const parsedStorageColumn = JSON.parse(localStorageColumns) as any[];

				for (let i = 0; i < parsedStorageColumn.length; i++) {
					const column = parsedStorageColumn[i];
					cacheColumnHash = `${cacheColumnHash}.${column.accessor}`
				}
			}
			
			for (let i = 0; i < this.columns.length; ++i) {
				const column = this.columns[i];
				columnHash = `${columnHash}.${column.accessor}`
			}

			// Remove Cache for specific column if new column is added
			if (
				!localStorageColumns ||
				(localStorageColumns && cacheColumnHash !== columnHash)
			) {
				this.cachedColumn = JSON.parse(JSON.stringify(this.columns));
				this.mergeColumns();
				this.handleCustomColumn();

				localStorage.setItem(
					this.keyForCacheCustomDataTableColumns || this.url,
					JSON.stringify(this.columns)
				);
			} else {
				this.cachedColumn = structuredClone(JSON.parse(localStorageColumns));
				this.mergeColumns();
				this.handleCustomColumn();
			}
		}

		if (changes?.data?.currentValue) {
			setTimeout(() => {
				this.render();
			}, 200);
		} else this.render();
	}

	handleCustomColumn() {
		this.cachedColumn = this.cachedColumn.map((column: any, index: number) => {
			if (
				column["dataType"] == GridTableColumnDataType.Boolean &&
				!this.columns[index].Cell
			) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { cell, row, webComponentsReactProperties } = instance;
						const rowData = row.original;
						const accessor = column.accessor;

						return (
							<React.StrictMode>
								<FlexBox>
									<Icon name={rowData[`${accessor}`] ? "accept" : "decline"} />
								</FlexBox>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.IconText) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { cell, row, webComponentsReactProperties } = instance;
						const rowData = row.original;
						const accessor = column.accessor;

						return (
							<React.StrictMode>
								<FlexBox style={{ gap: "5px" }}>
									<Icon name={rowData[`icon`]} />
									<Text
										style={{
											textOverflow: "ellipsis",
											overflowX: "hidden",
											whiteSpace: "nowrap",
										}}>
										{rowData[`${accessor}`]}
									</Text>
								</FlexBox>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.Color) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;
						const accessor = column.accessor;
						return (
							<React.StrictMode>
								<FlexBox id="colorCol" style={{ alignItems: "center" }}>
									<ColorPalette id="colorPalId">
										<ColorPaletteItem
											id="colorPalItem"
											value={`#${rowData[`${accessor}`]}`}
										/>
									</ColorPalette>
									<Text>{rowData[`${accessor}`]}</Text>
								</FlexBox>
							</React.StrictMode>
						);
					},
				};
			} else if (
				(column["dataType"] == GridTableColumnDataType.NestedString ||
					column["dataType"] == GridTableColumnDataType.MultipleString) &&
				column["accessorArray"]?.length > 1
			) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;
						const [firstAccessor, secAccessor] = column["accessorArray"];
						const [parentFirst, childFirst] = firstAccessor.split(".");
						const [parentSec, childSec] = secAccessor.split(".");
						return (
							<React.StrictMode>
								<FlexBox
									id="nestedValueColumn"
									style={{
										//class is not working
										display: "flex",
										justifyContent: "space-between",
										width: "100%",
									}}>
									<Text>
										{rowData?.[parentFirst]?.[childFirst] ||
											rowData?.[firstAccessor] ||
											""}
									</Text>
									<Text>
										{rowData?.[parentSec]?.[childSec] ||
											rowData?.[secAccessor] ||
											""}
									</Text>
								</FlexBox>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.Checkbox) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;

						return (
							<React.StrictMode>
								<UI5Checkbox
									checked={rowData[column["accessor"]]}
									disabled={rowData[column["isDisabled"]] ?? false}
									onChange={(e: any) => {
										let newValue = e.target.checked;

										if (rowData[column["accessor"]] != undefined) {
											rowData[column["accessor"]] = newValue;
										}

										if (column["afterValueChange"]) {
											column["afterValueChange"](rowData);
										}
									}}
								/>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.InputField) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;
						const rowIndex = row.index;
						return (
							<React.StrictMode>
								<ReactInput
									style={{ width: "100%" }}
									value={rowData[column["accessor"]] ?? ""}
									disabled={column["isDisabled"] ?? false}
									onKeyDown={(e: any) => e.stopPropagation()}
									onInput={(e: any) => {
										let newValue = e.target.value;
										rowData[column["accessor"]] = newValue;

										if (column["afterValueChange"]) {
											column["afterValueChange"](rowData);
										}
									}}
									placeholder={column["placeholder"]} // Add a placeholder
								/>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.InputArea) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;
						const rowIndex = row.index;
						return (
							<React.StrictMode>
								<TextArea
									style={{ width: "100%" }}
									value={rowData[column["accessor"]] ?? ""}
									disabled={column["isDisabled"] ?? false}
									rows={column["numberOfRows"] ?? 3}
									onKeyDown={(e: any) => e.stopPropagation()}
									onInput={(e: any) => {
										let newValue = e.target.value;
										rowData[column["accessor"]] = newValue;

										if (column["afterValueChange"]) {
											column["afterValueChange"](rowData);
										}
									}}
									placeholder={column["placeholder"]} // Add a placeholder
								/>
							</React.StrictMode>
						);
					},
				};
			} else if (column["dataType"] == GridTableColumnDataType.DropdownSingle) {
				column = {
					...column,
					Cell: (instance: {
						cell: any;
						row: any;
						webComponentsReactProperties: any;
					}) => {
						const { row } = instance;
						const rowData = row.original;
						const comboboxValues = this.columns.find(
							(c: any) => c["accessor"] == column["accessor"]
						).comboBoxValues;

						let value =
							column["comboBoxValues"]?.find(
								(d: { value: any; text: any }) =>
									d.value == rowData[column["accessor"]]
							)?.text ?? "";

						let placeholder = "";

						if (typeof column["placeholder"] == "string") {
							placeholder = column["placeholder"];
						} else if (column["placeholder"] instanceof Function) {
							placeholder = column["placeholder"](row);
						}

						return (
							<React.StrictMode>
								<ComboBox
									style={{ width: "100%" }}
									value={value}
									valueState={value ? "None" : "Negative"}
									disabled={column["isDisabled"] ?? false}
									showClearIcon={column["showClearIcon"] ?? false}
									noTypeahead={column["showClearIcon"] ?? false}
									onKeyDown={(e: any) => e.stopPropagation()}
									onInput={e => {
										if (column["onInput"]) {
											column["onInput"](row);
										}
									}}
									onSelectionChange={e => {
										let newValue = e.detail.item.id;
										rowData[column["accessor"]] = newValue;

										if (column["onSelectChange"]) {
											column["onSelectChange"](row);
										}

										if (column["afterValueChange"]) {
											column["afterValueChange"](rowData);
										}
									}}
									placeholder={placeholder ?? ""} // Add a placeholder
								>
									{comboboxValues?.map((item: { value: any; text: any }) => (
										<ComboBoxItem
											key={item.value}
											text={item.text}
											id={item.value}
										/>
									))}
								</ComboBox>
							</React.StrictMode>
						);
					},
				};
			}

			return column;
		});
	}

	ngAfterViewInit() {
		this.render();
	}

	ngOnDestroy() {
		this.root?.unmount();
	}

	searchFromServer(value: string) {
		this.searchClick.emit();

		if (!this.enableServerSideFiltering) {
			return;
		}

		if (!value) {
			this.additionalFilterQuery = "";
			this.onColumnFiltering();
			return;
		}

		let query =
			this.showActiveButton && this.fieldName
				? `&$filter=(${this.fieldName} ${this.filterOperator} ${this.searchText}`
				: `&$filter=(`;
		let conditions: string[] = [];

		this.cachedColumn.forEach((column: any, i: number) => {
			let condition = "";

			this.cachedColumn[i]["filterValue"] = undefined;

			if (typeof value != "undefined" && column.isSelected) {
				switch (column.dataType ?? GridTableColumnDataType.String) {
					case GridTableColumnDataType.Boolean:
						if (column.accessor.includes(".")) {
							const [firstPart, secPart] = column.accessor.split(".");

							condition = ["true", "false"].includes(value.toString())
								? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${value})`
								: "";
						} else {
							condition = ["true", "false"].includes(value.toString())
								? `${column.accessor} ${LogicalOperator.EQ} ${value}`
								: "";
						}

						break;

					case GridTableColumnDataType.Number:
						const number = parseFloat(value);

						if (column.accessor.includes(".")) {
							const [firstPart, secPart] = column.accessor.split(".");

							condition = !isNaN(number)
								? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${number})`
								: ``;
						} else {
							condition = !isNaN(number)
								? `(${column.accessor} ${LogicalOperator.EQ} ${number})`
								: ``;
						}

						break;

					case GridTableColumnDataType.TimeStamp:
						if (!value) return;
						const timeStamp = this.convertToUTCString(value);

						if (column.accessor.includes(".")) {
							const [firstPart, secPart] = column.accessor.split(".");

							if (timeStamp.includes(" ")) {
								condition = `${firstPart}/any(a:a/${secPart} ${LogicalOperator.GE} '${timeStamp + ":00"}' and ${firstPart}/any(a:a/${secPart} ${LogicalOperator.LE} '${timeStamp + ":59"}')`;
							} else {
								condition = `${firstPart}/any(a:a/${secPart} ${LogicalOperator.GE} '${timeStamp + " 00:00:00"}' and ${firstPart}/any(a:a/${secPart} ${LogicalOperator.LE} '${timeStamp + " 23:59:59"}')`;
							}
						} else {
							if (timeStamp.includes(" ")) {
								condition = `(${column.accessor} ${LogicalOperator.GE} '${timeStamp + ":00"}' and ${column.accessor} ${LogicalOperator.LE} '${timeStamp + ":59"}')`;
							} else {
								condition = `(${column.accessor} ${LogicalOperator.GE} '${timeStamp + " 00:00:00"}' and ${column.accessor} ${LogicalOperator.LE} '${timeStamp + " 23:59:59"}')`; // When time is not provided
							}
						}

						break;

					case GridTableColumnDataType.Time:
						const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Test if the time matches the regex
						if (!timeRegex.test(value)) break;

						if (column.accessor.includes(".")) {
							const [firstPart, secPart] = column.accessor.split(".");

							condition = `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${value})`;
						} else {
							condition = `(${column.accessor} ${LogicalOperator.EQ} ${value})`;
						}
						break;

					case GridTableColumnDataType.Date:
						const regexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
						const regexYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;
						let dateValue = "";

						if (regexYYYYMMDD.test(value)) {
							// If the date is already in yyyy-mm-dd format, return it as is
							dateValue = value;
						} else if (regexDDMMYYYY.test(value)) {
							// If the date is in dd.mm.yyyy format, convert it to yyyy-mm-dd
							const [day, month, year] = value.split(".");
							dateValue = `${year}-${month}-${day}`;
						}

						if (column.accessor.includes(".")) {
							const [firstPart, secPart] = column.accessor.split(".");
							condition = dateValue
								? `${firstPart}/any(a:a/${secPart} ${LogicalOperator.EQ} ${dateValue})`
								: ``;
						} else {
							condition = dateValue
								? `(${column.accessor} ${LogicalOperator.EQ} '${dateValue}')`
								: ``;
						}
						break;

					case GridTableColumnDataType.NestedString:
						if (column.accessorArray?.length == 2) {
							const [first, second] = column.accessorArray;
							const splittedAccessorFirst = first.split(".");
							const splittedAccessorSec = second.split(".");

							condition = `(${splittedAccessorFirst[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessorFirst[1]}), '${value.toLowerCase()}'))) or (${splittedAccessorSec[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessorSec[1]}), '${value.toLowerCase()}')))`;
						} else {
							const splittedAccessor = column.accessor.split(".");
							condition = `(${splittedAccessor[0]}/any(a:${LogicalOperator.CONTAINS}(tolower(a/${splittedAccessor[1]}), '${value.toLowerCase()}')))`;
						}
						break;

					case GridTableColumnDataType.MultipleString:
						if (column.accessorArray?.length) {
							condition = column.accessorArray
								.map((accessor: string) =>
									isNaN(+value)
										? `(${LogicalOperator.CONTAINS}(tolower(${accessor}), '${value.toLowerCase()}'))`
										: `(${accessor} eq ${value})`
								)
								.join(" or ");
						} else {
							condition = isNaN(+value)
								? `(${LogicalOperator.CONTAINS}(tolower(${column.accessor}), '${value.toLowerCase()}'))`
								: `(${column.accessor} eq ${value})`;
						}
						break;

					default:
						value = value.toString();
						if (value.startsWith("+")) {
							value = value.split("+")[1]?.trim();
						}

						condition = !column.accessor?.includes(".")
							? `(${LogicalOperator.CONTAINS}(tolower(${column.accessor}), '${value.toLowerCase()}'))`
							: "";
				}

				if (condition) {
					conditions.push(condition);
				}
			}
		});

		if (conditions.length > 0) {
			const filterQueries = conditions.join(" or ");
			query += query.includes("is_active") ? ` and (${filterQueries})` : filterQueries;
		} else {
			query = ""; // No valid conditions, clear the query
		}

		this.additionalFilterQuery = query + ")";

		this.top = this.limit;
		this.skip = 0;

		this.onPagination(true);
	}

	renderColumnFilters() {
		if (!this.enableServerSideFiltering) {
			return;
		}

		this.cachedColumn.forEach((column: any, index: number) => {
			switch (column.dataType ?? GridTableColumnDataType.String) {
				case GridTableColumnDataType.Boolean:
					column.Filter = (data: any) => {
						return (
							<React.StrictMode>
								<Switch
									onChange={(event: any) => {
										const value = event.target.checked;
										this.cachedColumn[index] = {
											...this.cachedColumn[index],
											filterValue: value,
										};
										this.doFilter(
											value.toString(),
											column,
											`&$filter=${column.accessor} ${LogicalOperator.EQ} ${value}`
										);

										data.column.setFilter(`${value}`);
									}}
									checked={this.cachedColumn[index]["filterValue"]}></Switch>
								<div style={{ width: "10px" }}></div>
								<Button
									design="Transparent"
									icon="decline"
									onClick={() => {
										this.cachedColumn[index] = {
											...this.cachedColumn[index],
											filterValue: undefined,
										};
										this.doFilter("", column, ``);
										data.column.setFilter(``);
									}}></Button>
							</React.StrictMode>
						);
					};
					break;
				case GridTableColumnDataType.Number:
					column.Filter = (data: any) => {
						return (
							<React.StrictMode>
								<ReactInput
									onKeyDown={event => {
										const value = (event.target as any).value;
										if (event.key == "Enter") {
											this.cachedColumn[index] = {
												...this.cachedColumn[index],
												filterValue: value,
											};
											this.doFilter(
												value,
												column,
												`&$filter=${column.accessor} ${LogicalOperator.EQ} ${value}`
											);
										}
										data.column.setFilter(value);
									}}
									onChange={event => {
										const value = (event.target as any).value;
										this.cachedColumn[index] = {
											...this.cachedColumn[index],
											filterValue: value,
										};
										this.doFilter(
											value,
											column,
											`&$filter=${column.accessor} ${LogicalOperator.EQ} ${value}`
										);

										data.column.setFilter(value);
										data.popoverRef.current?.close();
									}}
									value={this.cachedColumn[index]["filterValue"]}
									showClearIcon={true}></ReactInput>
							</React.StrictMode>
						);
					};
					break;

				default:
					column.Filter = (data: any) => {
						const comboBoxValues = this.columns[index].comboBoxValues;

						return (
							<React.StrictMode>
								{comboBoxValues ? (
									<MultiComboBox
										onSelectionChange={(e: any) => {
											const items = e?.target?.selectedValues || [];
											const selectedIds: string[] = [];

											items.forEach((item: any) => {
												selectedIds.push(item.id);
											});

											this.cachedColumn[index] = {
												...this.cachedColumn[index],
												filterValue: selectedIds,
											};

											this.onColumnFiltering();

											data.column.setFilter(selectedIds);
										}}
										showSelectAll={true}
										valueState="None">
										{comboBoxValues.map((item: any) =>
											item.isUsed !== false ? (
												item.custom_id || item.text ? (
													<MultiComboBoxItem
														key={item.custom_id || item.value}
														id={item.custom_id || item.value}
														additionalText={item.custom_id || ""}
														text={item.name || item.text}
														selected={
															this.cachedColumn[index][
																"filterValue"
															]?.includes(
																item.custom_id || item.value
															)
																? true
																: false
														}
													/>
												) : (
													<MultiComboBoxItem
														key={item}
														id={item}
														text={item}
														selected={
															this.cachedColumn[index][
																"filterValue"
															]?.includes(item)
																? true
																: false
														}
													/>
												)
											) : (
												<></>
											)
										)}
									</MultiComboBox>
								) : (
									<ReactInput
										onChange={event => {
											const value = (event.target as any).value;
											const splittedAccessor = column.accessor.split(".");
											const dataType = column.dataType;

											this.cachedColumn[index] = {
												...this.cachedColumn[index],
												filterValue: value,
											};

											this.doFilter(
												value,
												column,
												dataType === GridTableColumnDataType.NestedString
													? `&$filter=(${splittedAccessor[0]}/any(a:contains(a/${splittedAccessor[1]}, '${value}')))`
													: `&$filter=contains(${column.accessor},'${value}')`
											);

											data.column.setFilter(value);
										}}
										onKeyDown={event => {
											const value = (event.target as any).value;
											if (event.key == "Enter") {
												const splittedAccessor = column.accessor.split(".");
												const dataType = column.dataType;

												this.cachedColumn[index] = {
													...this.cachedColumn[index],
													filterValue: value,
												};

												this.doFilter(
													value,
													column,
													dataType ===
														GridTableColumnDataType.NestedString
														? `&$filter=(${splittedAccessor[0]}/any(a:contains(a/${splittedAccessor[1]}, '${value}')))`
														: `&$filter=contains(${column.accessor},'${value}')`
												);
											}

											data.column.setFilter(value);
										}}
										value={this.cachedColumn[index]["filterValue"]}
										onInput={e => {
											const value = (e.target as any).value;
											if (value === "") {
												const splittedAccessor = column.accessor.split(".");
												const dataType = column.dataType;

												this.cachedColumn[index] = {
													...this.cachedColumn[index],
													filterValue: value,
												};
												this.doFilter(
													value,
													column,
													dataType ===
														GridTableColumnDataType.NestedString
														? `&$filter=(${splittedAccessor[0]}/any(a:contains(a/${splittedAccessor[1]}, '${value}')))`
														: `&$filter=contains(${column.accessor},'${value}')`
												);
												data.column.setFilter(value);
											}
										}}
										showClearIcon={true}></ReactInput>
								)}
							</React.StrictMode>
						);
					};
			}
		});
	}

	private mergeColumns(): void {
		// Update existing cached columns with the new information from this.columns
		this.cachedColumn = this.cachedColumn.map((cachedColumn: any) => {
			const existingColumn = this.columns.find(
				(column: any) =>
					column.accessor == cachedColumn.accessor || column.Header == cachedColumn.Header
			);

			if (existingColumn) {
				// Create a shallow copy of existingColumn
				const newColumn = {
					...existingColumn,
					isSelected: cachedColumn.isSelected,
					width: cachedColumn.width,
				};
				return newColumn;
			} else {
				// Create a shallow copy of cachedColumn
				return { ...cachedColumn };
			}
		});

		this.renderColumnFilters();
	}

	doFilter(value: string, column: any, filterString: string) {
		column.filterValue = value;

		if (this.enableServerSideFiltering) this.globalSearchFieldValue = "";
		this.render();

		this.onColumnFiltering();
		(document.getElementsByTagName("ui5-popover") as any)[0]?.open
			? ((document.getElementsByTagName("ui5-popover") as any)[0].open = false)
			: null;
	}

	resetConfirmationSubmit() {
		this.cachedColumn = JSON.parse(JSON.stringify(this.columns));
		localStorage.setItem(
			this.keyForCacheCustomDataTableColumns || this.url,
			JSON.stringify(this.columns)
		);
		this.toggleSettingDialog();

		this.mergeColumns();
		this.handleCustomColumn();

		this.onFilterAndSorting();
	}

	reset() {
		if (this?.resetConfirmDialog?.elementRef.nativeElement)
			this.resetConfirmDialog.elementRef.nativeElement.open = true;
	}

	closeResetDialog() {
		if (this?.resetConfirmDialog?.elementRef.nativeElement)
			this.resetConfirmDialog.elementRef.nativeElement.open = false;
	}

	openCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.codeScannerDialog.elementRef.nativeElement.open = true;
			this.startCodeScanning();
		}
	}
	closeCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.scannerControls?.stop();
			this.codeScannerDialog.elementRef.nativeElement.open = false;
		}
	}

	selectionChange(event: any) {
		this.selectedItems = event.detail.selectedItems || [];
		this.settingChanged = true;
	}

	selectAllBtn() {
		this.cachedColumn.forEach((column: AnalyticalTableColumnDefinition, i: number) => {
			if (!this.cachedColumn[i]["isSelected"]) {
				this.selectAlLClicked = true;
				this.settingChanged = true;
				this.cachedColumn[i]["isSelected"] = true;
			}
		});

		this.selectedItems =
			this.viewSettingListDialog?.elementRef?.nativeElement?._state?.items || [];
	}

	toggleSettingDialog(fromCancelClicked: boolean = false) {
		this.selectedItems = [];
		this.isViewSettingsOpen = !this.isViewSettingsOpen;

		if (fromCancelClicked && this.selectAlLClicked) {
			this.ngOnChanges();
			this.selectAlLClicked = false;
		}

		this.closeResetDialog();
	}

	render() {
		let {
			headerTitle,
			showAction,
			actionColumn,
			data,
			isTreeTable,
			isTreeTableHookEnable,
			showSearch,
			showSearchScanner,
			showValueHelp,
			showDownload,
			showNewButton,
			showRefreshButton,
			showExtraButton,
			showDatePicker,
			showDateRangePicker,
			editPermission,
			showActiveButton,
			selectionMode,
			addButtonText,
			refButtonText,
			extraButtonText,
			defaultButtonText,
			button1Text,
			button2Text,
			button3Text,
			isBaseVisu,
			showTableSettingBtn,
			selectedRowsId,
			onPagination,
			onSorting,
			handleGlobalSearch,
			handleRowClick,
			onChangeDatePicker,
			onChangeRangeDatePicker,
			handleNewButtonClick,
			handleRefreshButtonClick,
			handleOnSearchForCustomAPI,
			handleOnLoadMoreForCustomAPI,
			handleOnSearchOnKeyUp,
			handleExtraButtonClick,
			handleDeleteButtonClick,
			handleSegmentedButtonClick,
		} = this;

		if (!this.analyticalTableRef) {
			this.analyticalTableRef = React.createRef();
		}

		let columns =
			!isBaseVisu && !this.keyForCacheCustomDataTableColumns
				? this.columns?.filter((column: any) =>
						"isSelected" in column ? column.isSelected : true
					)
				: this.cachedColumn?.filter((column: any) =>
						"isSelected" in column ? column.isSelected : true
					);

		if (showAction && editPermission) {
			const isExist = columns?.find(
				(column: { id: string }) => column.id === actionColumn.id
			);

			if (columns?.length && !isExist) columns.push(actionColumn);
		}

		const handleColumnResize = (e: any) => {
			if (e.columnWidth) {
				this.cachedColumn = this.cachedColumn.map((column: any) => {
					if (column.Header == e.header?.Header) {
						column.width = e.columnWidth;
					}

					return column;
				});

				localStorage.setItem(
					this.keyForCacheCustomDataTableColumns || this.url,
					JSON.stringify(this.cachedColumn)
				);
			}
		};

		const getTableHooks = () => {
			let hookItems: any[] = [
				AnalyticalTableHooks.useOnColumnResize(handleColumnResize, {
					liveUpdate: false,
					wait: 100,
				}),
			];

			if (this.disableColumnRule) {
				hookItems = [
					...hookItems,
					AnalyticalTableHooks.useRowDisableSelection(row => {
						return this.disableColumnRule ? this.disableColumnRule(row) : false;
					}),
				];
			}

			if (isTreeTable && isTreeTableHookEnable && selectionMode == "Multiple") {
				hookItems = [...hookItems, AnalyticalTableHooks.useIndeterminateRowSelection()];
			}

			return hookItems;
		};

		try {
			this.root?.render(
				<React.StrictMode>
					<ThemeProvider>
						<div
							className="tableContainer"
							style={{ maxWidth: "100%", height: "100%" }}>
							<Toolbar
								design="Auto"
								onClick={function _a() {}}
								onOverflowChange={function _a() {}}
								toolbarStyle="Standard"
								style={
									headerTitle
										? {
												backgroundColor: "white",
												borderTopRightRadius: "10px",
												borderTopLeftRadius: "10px",
												height: "50px",
											}
										: { height: "0px" }
								}>
								<h3 style={{ marginLeft: "16px", whiteSpace: "nowrap" }}>
									{headerTitle}{" "}
									{this.showRowDataCount ? `(${this.filteredDataCount})` : ""}
								</h3>
								<ToolbarSpacer />

								{showSearch ? (
									<ReactInput
										icon={
											<div
												style={{
													display: "flex",
													gap: "12px",
													marginRight: "12px",
												}}>
												<Icon
													name="search"
													onClick={() => {
														this.isCustomApiCall
															? handleOnSearchForCustomAPI(
																	this.globalSearchFieldValue ||
																		""
																)
															: this.searchFromServer(
																	this.globalSearchFieldValue ||
																		""
																);
													}}
												/>
												{showSearchScanner && (
													<Icon
														name="qr-code"
														onClick={() => this.openCodeScannerDialog()}
													/>
												)}
											</div>
										}
										onInput={e => {
											if ((e.target as any).value === "") {
												this.globalSearchFieldValue = (
													e.target as any
												).value;
												this.isCustomApiCall
													? handleOnSearchForCustomAPI(
															this.globalSearchFieldValue || ""
														)
													: this.searchFromServer(
															this.globalSearchFieldValue || ""
														);
											}
											handleGlobalSearch(e);
										}}
										onKeyUp={event => {
											handleOnSearchOnKeyUp(
												(event.target as any).value || ""
											);
										}}
										value={this.globalSearchFieldValue}
										onKeyDown={event => {
											if (event.key == "Enter") {
												event.preventDefault();
												this.globalSearchFieldValue = (
													event.target as any
												).value;
												this.isCustomApiCall
													? handleOnSearchForCustomAPI(
															this.globalSearchFieldValue || ""
														)
													: this.searchFromServer(
															this.globalSearchFieldValue || ""
														);
											}
										}}
										onChange={event => {
											this.globalSearchFieldValue = (
												event.target as any
											).value;
											this.isCustomApiCall
												? handleOnSearchForCustomAPI(
														this.globalSearchFieldValue || ""
													)
												: this.searchFromServer(
														this.globalSearchFieldValue || ""
													);
										}}
										style={
											showSearch
												? this.isCozy
													? {}
													: { height: "30px" }
												: { height: "0px" }
										}
										showClearIcon={true}
										placeholder={$localize`Search`}
									/>
								) : (
									<></>
								)}

								{showValueHelp ? (
									<ReactInput
										icon={<Icon name="value-help" />}
										onClick={() => this.handleValueHelperButtonClick()}
										style={this.isCozy ? {} : { height: "30px" }}
										placeholder={$localize`Select item`}
									/>
								) : null}

								{this.isMultiSelectOneActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.multiSelectOneLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.multiSelectOneLabelText}
											</Label>
										) : null}
										<MultiComboBox
											placeholder={this.multiSelectOnePlaceholder}
											showSelectAll={this.isMultiSelectOneSelectAllFlag}
											onSelectionChange={e =>
												this.multiSelectOneSelectionChanged.emit(e)
											}>
											{this.multiSelectOneData?.data.map(value => (
												<MultiComboBoxItem
													text={
														value[
															`${this.multiSelectOneData?.textAccessor}`
														]
													}
													id={
														value[
															`${this.multiSelectOneData?.idAccessor}`
														]
													}
													selected={
														value[
															`${this.multiSelectOneData?.isSelectedAccessor}`
														]
													}
												/>
											))}
										</MultiComboBox>
									</div>
								) : null}

								{this.isMultiSelectTwoActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.multiSelectTwoLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.multiSelectTwoLabelText}
											</Label>
										) : null}
										<MultiComboBox
											placeholder={this.multiSelectTwoPlaceholder}
											showSelectAll={true}
											onSelectionChange={e =>
												this.multiSelectTwoSelectionChanged.emit(e)
											}>
											{this.multiSelectTwoData?.data.map(value => (
												<MultiComboBoxItem
													text={
														value[
															`${this.multiSelectTwoData?.textAccessor}`
														]
													}
													id={
														value[
															`${this.multiSelectTwoData?.idAccessor}`
														]
													}
												/>
											))}
										</MultiComboBox>
									</div>
								) : null}

								{this.isMultiSelectThreeActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.multiSelectThreeLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.multiSelectThreeLabelText}
											</Label>
										) : null}
										<MultiComboBox
											placeholder={this.multiSelectThreePlaceholder}
											showSelectAll={true}
											onSelectionChange={e =>
												this.multiSelectThreeSelectionChanged.emit(e)
											}>
											{this.multiSelectThreeData?.data.map(value => (
												<MultiComboBoxItem
													text={
														value[
															`${this.multiSelectThreeData?.textAccessor}`
														]
													}
													id={
														value[
															`${this.multiSelectThreeData?.idAccessor}`
														]
													}
												/>
											))}
										</MultiComboBox>
									</div>
								) : null}

								{this.isMultiSelectFourActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.multiSelectFourLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.multiSelectFourLabelText}
											</Label>
										) : null}
										<MultiComboBox
											placeholder={this.multiSelectFourPlaceholder}
											showSelectAll={true}
											onSelectionChange={e =>
												this.multiSelectFourSelectionChanged.emit(e)
											}>
											{this.multiSelectFourData?.data.map(value => (
												<MultiComboBoxItem
													text={
														value[
															`${this.multiSelectFourData?.textAccessor}`
														]
													}
													id={
														value[
															`${this.multiSelectFourData?.idAccessor}`
														]
													}
												/>
											))}
										</MultiComboBox>
									</div>
								) : null}

								{this.isComboBoxOneActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.comboBoxOneLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.comboBoxOneLabelText}
											</Label>
										) : null}
										<ComboBox
											value={
												this.comboBoxOneData?.data?.[0]?.[
													`${this.comboBoxOneData?.textAccessor}`
												] || ""
											}
											onSelectionChange={e =>
												this.comboBoxOneSelectionChanged.emit(e)
											}>
											{this.comboBoxOneData?.data.map(value => (
												<ComboBoxItem
													text={
														value[
															`${this.comboBoxOneData?.textAccessor}`
														]
													}
													id={
														value[`${this.comboBoxOneData?.idAccessor}`]
													}
												/>
											))}
										</ComboBox>
									</div>
								) : null}

								{this.isComboBoxTwoActive ? (
									<div style={{ marginRight: "10px" }}>
										{this.comboBoxTwoLabelText ? (
											<Label showColon style={{ marginRight: "10px" }}>
												{this.comboBoxTwoLabelText}
											</Label>
										) : null}
										<ComboBox
											value={
												this.comboBoxTwoData?.data?.[0]?.[
													`${this.comboBoxTwoData?.textAccessor}`
												] || ""
											}
											onSelectionChange={e =>
												this.comboBoxTwoSelectionChanged.emit(e)
											}>
											{this.comboBoxTwoData?.data.map(value => (
												<ComboBoxItem
													text={
														value[
															`${this.comboBoxTwoData?.textAccessor}`
														]
													}
													id={
														value[`${this.comboBoxTwoData?.idAccessor}`]
													}
												/>
											))}
										</ComboBox>
									</div>
								) : null}

								{showDatePicker ? (
									<DatePicker
										id="datePicker"
										value={this.datePickerValue ?? ""}
										placeholder={this.datePickerPlaceholder || this.datePickerFormat || ""}
										onChange={e => onChangeDatePicker(e)}
										formatPattern={this.datePickerFormat ?? "YYYY-MM-dd"}
										valueState="None"
									/>
								) : (
									<></>
								)}

								{showDateRangePicker ? (
									<DateRangePicker
										id="dateRangePicker"
										placeholder={this.dateRangePickerPlaceholder}
										className="grid-table-date-picker-width"
										onChange={e => onChangeRangeDatePicker(e)}
										formatPattern="dd/MM/YYYY"
										valueState="None"
									/>
								) : (
									<></>
								)}

								{showExtraButton && editPermission ? (
									<Button
										onClick={() => handleExtraButtonClick()}
										id="extraButton"
										disabled={this.extraButtonDisable}
										style={
											showExtraButton && editPermission
												? { height: "25px" }
												: { display: "None" }
										}
										design="Emphasized">
										{extraButtonText}
									</Button>
								) : (
									<></>
								)}
								{showNewButton && editPermission ? (
									<Button
										onClick={() => handleNewButtonClick()}
										id="newButton"
										style={
											showNewButton && editPermission
												? {
														height: "25px",
														display: "grid",
														justifyContent: "center",
													}
												: { display: "None" }
										}
										design="Emphasized"
										disabled={
											this.addButtonDisable
												? true
												: this.isNoDataSelected &&
													  $localize`Add Trip` == addButtonText
													? true
													: false
										}>
										{addButtonText}
									</Button>
								) : (
									<></>
								)}
								{showRefreshButton && editPermission ? (
									<Button
										onClick={() => handleRefreshButtonClick()}
										id="refButton"
										style={
											showRefreshButton && editPermission
												? {
														height: "25px",
														display: "grid",
														justifyContent: "center",
													}
												: { display: "None" }
										}
										design="Emphasized">
										{refButtonText}
									</Button>
								) : (
									<></>
								)}

								{this.showDeleteButtonInHeader && editPermission ? (
									<Button
										onClick={() => handleDeleteButtonClick()}
										id="newButton"
										style={
											this.showDeleteButtonInHeader
												? { height: "25px" }
												: { display: "None" }
										}
										disabled={this.isNoDataSelected ? true : false}
										design="Negative">
										{this.deleteButtonText}
									</Button>
								) : (
									<></>
								)}
								{this.productionPlanDefaultButtonText ? (
									<Button
										onClick={() => this.handleProductionPlanDefaultButton()}
										style={
											this.productionPlanDefaultButtonText
												? {}
												: { display: "None" }
										}
										disabled={this.isButtonDisabled}
										design="Emphasized">
										{this.productionPlanDefaultButtonText}
									</Button>
								) : (
									<></>
								)}

								{this.customSecondaryToolbarButtons.map(secondaryButton => (
									<Button
										id={secondaryButton.id}
										disabled={
											secondaryButton.disable != null
												? secondaryButton.disable()
												: false
										}
										onClick={e => {
											secondaryButton.onClick();
										}}>
										{secondaryButton.text ?? ""}
									</Button>
								))}

								{this.showTripButtons ? (
									<Button
										onClick={() => this.handleClearButtonClick()}
										style={
											this.showTripButtons
												? { height: "25px" }
												: { display: "None" }
										}
										design="Default"
										disabled={this.isNoDataSelected ? true : false}>
										{this.clearTrip}
									</Button>
								) : null}

								{isBaseVisu && showTableSettingBtn ? (
									<Button
										onClick={() => this.toggleSettingDialog()}
										icon="action-settings"
										style={
											isBaseVisu ? { height: "30px" } : { display: "none" }
										}
										design="Transparent"></Button>
								) : (
									<></>
								)}

								{showTableSettingBtn &&
								this.settingsButtonClick.observers.length ? (
									<Button
										onClick={() => this.handleSettingsButtonClick()}
										style={
											showDownload ? { height: "30px" } : { display: "None" }
										}
										design="Transparent">
										<Icon name="action-settings" />
									</Button>
								) : null}

								{showDownload ? (
									<Button
										disabled={this.disableDownloadButton}
										onClick={() => this.handleDownloadButtonClick()}
										style={
											showDownload ? { height: "30px" } : { display: "None" }
										}
										design="Transparent">
										<Icon name="download" style={{ color: "#0064D9" }} />
									</Button>
								) : null}

								<SegmentedButton
									id="segmentGroupButton"
									onSelectionChange={e => {
										handleSegmentedButtonClick(
											e.detail.selectedItems[0].getAttribute(
												"data-value"
											)! as any
										);
									}}
									style={
										showActiveButton ? { height: "25px" } : { display: "None" }
									}>
									<React.Fragment key=".0">
										<SegmentedButtonItem
											id="allSegmentButton"
											data-value={"ALL"}>
											{button1Text}
										</SegmentedButtonItem>
										<SegmentedButtonItem
											selected
											id="activeSegmentButton"
											data-value={"ACTIVE"}>
											{button3Text}
										</SegmentedButtonItem>
										<SegmentedButtonItem
											id="inactiveSegmentButton"
											data-value={"INACTIVE"}>
											{button2Text}
										</SegmentedButtonItem>
									</React.Fragment>
								</SegmentedButton>

								{this.segmentButtonItems.length ? (
									<SegmentedButton
										selectionMode="Single"
										onSelectionChange={e => this.segmentButtonChange.emit(e)}>
										<React.Fragment>
											{this.segmentButtonItems.map(value => value?.defaultSelect ? (
												<SegmentedButtonItem id={value.id} selected>
													{value.name}
												</SegmentedButtonItem>
											) : (
												<SegmentedButtonItem id={value.id}>
													{value.name}
												</SegmentedButtonItem>
											))}
										</React.Fragment>
									</SegmentedButton>
								) : (
									<></>
								)}

								{this.multipleButtons && this.multipleButtons.length > 0
									? this.multipleButtons.map(
											(button: ButtonConfig, index: number) =>
												button.display !== false ? ( // Render if `display` is true or undefined
													<Button
														key={index}
														onClick={() => button.callback()}
														design={button.design ?? "Default"}
														disabled={button.disabled ?? false}>
														{button.title}
													</Button>
												) : null
										)
									: ""}
							</Toolbar>
							<div
								id="analyticalTable"
								style={
									headerTitle
										? { height: "calc(100% - 52px)" }
										: { height: "100%" }
								}>
								<AnalyticalTable
									ref={this.analyticalTableRef || ""}
									style={{ backgroundColor: "white", minHeight: "100%" }}
									columns={columns}
									data={data || []}
									filterable
									groupBy={[]}
									groupable
									sortable
									highlightField="status"
									infiniteScroll
									isTreeTable={isTreeTable}
									onColumnsReorder={(e: any) => this.onColumnsReorder(e)}
									onGroup={function _a() {}}
									onLoadMore={() =>
										!this.customData && this.useOdataStyles
											? onPagination()
											: handleOnLoadMoreForCustomAPI()
									}
									onRowExpandChange={function _a() {}}
									onRowSelect={(e: any) => {
										handleRowClick(e);
									}}
									onSort={(e: any) =>
										this.enableServerSideFiltering && this.isServerSideSorting !== false && onSorting(e)
									}
									onTableScroll={function _a() {}}
									visibleRowCountMode="AutoWithEmptyRows"
									visibleRows={10}
									minRows={3}
									rowHeight={this.rowHeight}
									headerRowHeight={this.headerRowHeight ?? 32}
									selectionMode={selectionMode}
									selectedRowIds={selectedRowsId}
									reactTableOptions={{
										manualSortBy: this.isServerSideSorting ?? this.enableServerSideFiltering,
										manualFilters: this.enableServerSideFiltering,
										manualGroupBy: this.enableServerSideFiltering,
										selectSubRows:
											isTreeTable && selectionMode == "Multiple"
												? true
												: false,
									}}
									loading={this.isBusy}
									globalFilterValue={this.globalFilterValue}
									withRowHighlight={this.withRowHighlight}
									tableHooks={getTableHooks()}
								/>
							</div>
						</div>
					</ThemeProvider>
				</React.StrictMode>
			);
		} catch (e) {
			this.root?.unmount();
		}
	}

	private async startCodeScanning() {
		const codeReader = new BrowserMultiFormatReader();
		codeReader.possibleFormats = [
			BarcodeFormat.AZTEC,
			BarcodeFormat.CODABAR,
			BarcodeFormat.CODE_39,
			BarcodeFormat.CODE_93,
			BarcodeFormat.CODE_128,
			BarcodeFormat.DATA_MATRIX,
			BarcodeFormat.EAN_8,
			BarcodeFormat.EAN_13,
			BarcodeFormat.ITF,
			BarcodeFormat.MAXICODE,
			BarcodeFormat.PDF_417,
			BarcodeFormat.QR_CODE,
			BarcodeFormat.RSS_14,
			BarcodeFormat.RSS_EXPANDED,
			BarcodeFormat.UPC_A,
			BarcodeFormat.UPC_E,
			BarcodeFormat.UPC_EAN_EXTENSION,
		];

		this.videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
		if (this.videoInputDevices.length === 0) {
			return;
		}
		const backCamera = this.videoInputDevices.find(camera =>
			/back|rear|environment/i.test(camera.label)
		);
		const selectedDeviceId = backCamera
			? backCamera.deviceId
			: this.videoInputDevices[0].deviceId;

		const previewElem: HTMLVideoElement = document.querySelector(
			"#codeScannerDialog > video"
		) as HTMLVideoElement;
		this.scannerControls = await codeReader.decodeFromVideoDevice(
			selectedDeviceId,
			previewElem,
			(result, _) => {
				if (result && result.getText()) {
					this.globalSearchFieldValue = result.getText();
					this.scannerControls?.stop();

					this.closeCodeScannerDialog();
					if (!this.enableServerSideFiltering) {
						this.globalFilterValue = this.globalSearchFieldValue || "";
					}
					this.render();
				}
			}
		);
	}
}

export enum GridTableColumnDataType {
	String,
	Date,
	Number,
	Boolean,
	NestedString,
	NestedArray,
	Color,
	Time,
	IconText,
	MultipleString,
	MultipleDate,
	Checkbox,
	InputField,
	InputArea,
	DropdownSingle,
	TimeStamp,
}

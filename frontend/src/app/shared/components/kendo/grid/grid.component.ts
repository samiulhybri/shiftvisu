import { Component, Input, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentRef, ViewEncapsulation, TemplateRef, ContentChild, SimpleChanges, OnInit } from '@angular/core';
import { AggregateDescriptor, AggregateResult, State, aggregateBy, process } from '@progress/kendo-data-query';
import {
	CellClickEvent,
	ColumnMenuSettings,
	ColumnReorderEvent,
	ColumnVisibilityChangeEvent,
	DataStateChangeEvent, EditEvent, PageChangeEvent, RemoveEvent, RowClassFn
} from "@progress/kendo-angular-grid";
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ToolbarConfig } from 'src/app/shared/models/toolbar-config';
import { CommonService } from 'src/app/shared/services/common.service';
import { Notification } from 'src/app/shared/services/notification.service';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/modules/absence-manager/services/request.service';

@Component({
	selector: 'kendo-grid-component',
	templateUrl: './grid.component.html',
	encapsulation: ViewEncapsulation.None,
	styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
	public editDataItem: any = undefined;
	public isNew: boolean = false;
	public windowCustomTitle?: string; // add window custom title
	public detailsWindowCustomTitle?: string; // details window custom title
	public cmpRef!: ComponentRef<any>;
	public closeGridWindow: boolean = false;
	public isWindowLoaderEnabled: boolean = false;
	public buttonCount = 10;
	public pageSizes = [50, 100, 500];
	public gridSearchKey: string = '';
	public fullGridSearchQuery: string = '';
	public gridRelationalFilterKey: string = '';
	public gridRelationalColumn: string = '';
	public gridEnumFilterKey: string = '';
	public filterBtnCustomMenu: any;
	public customFilterColumn: any;
	public gridData: any

	@Input() gridItems: any;
	@Input() isPageable: boolean = false;
	@Input() isReorderable: boolean = true;
	@Input() isSortable: boolean = false;
	@Input() isResizable: boolean = true;
	@Input() isFilterable: boolean = false;
	@Input() columnMenu: ColumnMenuSettings = { filter: true };
	@Input() isGroupable: boolean = false;
	@Input() filterTerm: number = 10;
	@Input() columns: any;
	@Input() hiddenColumns: string[] = [];
	@Input() state!: State;
	@Input() isLoadedEnabled: boolean = false;
	@Input() editView: any;
	@Input() toolbarConfig!: ToolbarConfig;
	@Input() set addWindowEvent(data: Event) {

		if (data == undefined) return;
		this.addHandler(data)

		this.isNew = true;
	};
	@Input() moduleName: string = '';
	@Input() isActionSticky: boolean = false;
	@Input() initialSelection: number[] = [0];
	@Input() isEditDisabled: boolean = false;
	@Input() isDeleteDisabled: boolean = false;
	@Input() rowCallback: RowClassFn = () => '';

	@ContentChild('toolBarBeforeSearchContent', { static: true }) toolBarBeforeSearchContent!: TemplateRef<any>;
	@ContentChild('toolBarAfterSearchContent', { static: true }) toolBarAfterSearchContent!: TemplateRef<any>;
	@ContentChild('gridColumnContent', { static: true }) gridColumnContent!: TemplateRef<any>;
	@ContentChild('actionColumnContent', { static: true }) actionColumnContent!: TemplateRef<any>;
	@ContentChild('actionColumnAfterCommonContent', { static: true }) actionColumnAfterCommonContent!: TemplateRef<any>;

	@Output() emitData = new EventEmitter<{ skip: number, take: number }>();
	@Output() componentRefEvent = new EventEmitter<ComponentRef<any>>();
	@Output() emitState = new EventEmitter<State>();
	@Output() filterState = new EventEmitter<any>();
	@Output() deleteDataItem = new EventEmitter<any>();
	@Output() gridRefersh = new EventEmitter<any>();
	@Output() gridRowSelection = new EventEmitter<any>();
	@Output() gridCellClicked = new EventEmitter<any>();
	@Output() emitSelectedItem = new EventEmitter<any>();
	@Output() dblClick = new EventEmitter<any>();

	@ViewChild('modalBody', { read: ViewContainerRef }) modalBody!: ViewContainerRef;

	constructor(
		public dialogService: DialogService,
		protected _commonService: CommonService,
		public _notification: Notification,
		private router: Router,
		private requestService: RequestService
	) {
		this.loadGridItems();
		this.gridData = { ...this.gridItems }
	}

	public sumation !: any;
	public aggregateResult!: AggregateResult;
	@Input() aggregates!: AggregateDescriptor[];
	public aggregateFields: Array<any> = [];

	ngOnChanges(changes: SimpleChanges) {
		if (changes['gridItems'] && changes['gridItems'].currentValue) {
			let newEvents: any = changes['gridItems'].currentValue
			this.aggregateResult = aggregateBy(newEvents.data ? newEvents.data : newEvents, this.aggregates);
			let sumation: any = {};
			if (this.aggregates) {
				this.aggregates.map((item) => {
					this.aggregateFields.push(item.field);
					if (this.aggregateResult[item.field]) {
						sumation[item.field] = typeof this.aggregateResult[item.field].sum == 'number' ? this.aggregateResult[item.field].sum : 0
						if (sumation[item.field].toString().includes('.')) {
							sumation[item.field] = parseFloat(sumation[item.field].toFixed(2))
						}
					}
				})
				this.sumation = sumation
			}
		}
	}

	ngOnInit(): void {
		this.checkHideGirdColumns()
		this.checkReorderColumns()
	}

	checkHideGirdColumns() {
		let storageData = this.getHideGirdColumns();
		if (storageData) {
			let getKeyFromUrl = this.getKeyFromUrl();
			if (storageData?.[getKeyFromUrl[0]]?.hasOwnProperty([getKeyFromUrl[1]])) {
				this.hiddenColumns = storageData[getKeyFromUrl[0]][getKeyFromUrl[1]]
			}
		} else {
			this.setHideGirdColumns({})
		}
	}

	checkReorderColumns() {
		let storageData = this.getOrderGridColumns();
		if (storageData) {
			let getKeyFromUrl = this.getKeyFromUrl();
			if (storageData?.[getKeyFromUrl[0]]?.hasOwnProperty([getKeyFromUrl[1]])) {
				this.columns = storageData[getKeyFromUrl[0]][getKeyFromUrl[1]]
			}
		} else {
			this.setOrderColumns({})
		}
	}

	public handleSortChange(descriptor: any[]): void {
		this.loadGridItems();
	}

	public addHandler(data: any): void {
		this.editDataItem = data
		this.isNew = true;
		this.windowCustomTitle = this.editView.windowCustomTitle
		if (this.cmpRef) this.cmpRef.destroy()
		this.cmpRef = this.modalBody.createComponent(this.editView.modalTemplate);
	}

	public removeHandler(args: RemoveEvent): void {
		const dialog: DialogRef = this.dialogService.open({
			title: $localize`Warning`,
			content: $localize`Are you sure you want to delete?`,
			actions: [{ text: $localize`No`, action: 'canceled' }, { text: $localize`Yes`, themeColor: "primary", action: 'next' }],
			width: 450,
			height: 200,
			minWidth: 250
		});

		dialog.result.subscribe((result: any) => {
			if (result.action == 'next') this.deleteDataItem.emit(args.dataItem)
		});
	}

	public selectionHandler(args: any): void {
		this.gridRowSelection.emit(args);
	}

	public editHandler(args: EditEvent): void {
		this.editDataItem = args.dataItem;
		this.isNew = false;
		this.detailsWindowCustomTitle = this.editView.detailsWindowCustomTitle
		if (this.cmpRef) this.cmpRef.destroy()
		this.cmpRef = this.modalBody.createComponent(this.editView.modalTemplate);
		this.cmpRef.setInput('data', JSON.parse(JSON.stringify(this.editDataItem)));
	}

	private loadGridItems(): void { }

	public saveHandler(event?: PointerEvent) {
		const eventType = this.isNew ? "onAdd" : "onUpdate";
		if (this.cmpRef.instance[eventType]) {
			this.closeGridWindow = false;
			if (this.isNew) delete this.cmpRef.instance.form?.value.id;
			if (this.editView.isCustomizedHandler) this.cmpRef.instance[eventType](event, this)
			else {
				this.isWindowLoaderEnabled = true;
				this.cmpRef.instance[eventType](event, this).
					subscribe({
						next: (res: any) => {
							this.isWindowLoaderEnabled = false;
							this.closeGridWindow = true;
							this.gridRefersh.emit();
							if (this.isNew) this._notification.showSuccess($localize`Data created successfully`);
							else this._notification.showSuccess($localize`Data updated successfully`);
						},
						error: (e: any) => {
							this.isWindowLoaderEnabled = false
							this._notification.showError(e ?? $localize`Something went wrong`);
						}
					})
			}
		}
	}

	public async cancelHandler() {
		let detectValueChange = this.cmpRef.instance?.previousFormData ? await this._notification.formValueChangeDetect(this.cmpRef.instance.data, this.cmpRef.instance.previousFormData, []) : false
		if (this.cmpRef.instance.onCancel) this.cmpRef.instance.onCancel(this.editDataItem);
		if (detectValueChange) this.saveHandler()
		else this.editDataItem = undefined;
	}
	/**
	 * Catch state change and  emit state to parent component (changeState function)
	 * @param state 
	 */
	public dataStateChange(state: any): void {
		this.isLoadedEnabled = true;
		let filtersArr: any[] = [];
		state.filter?.filters.map((elm: any) => {
			if (elm?.filters) {
				elm?.filters?.map((el: any) => {
					filtersArr.push(el)
				});
			} else filtersArr.push(elm)
		});
		state.filter.filters = filtersArr;

		let emitdata: any = {
			state: state
		};
		if (this.gridSearchKey != '') {
			emitdata.query = this.fullGridSearchQuery;
			emitdata.type = 'fullGridSearch'
		}

		if (!this.gridEnumFilterKey || this.gridEnumFilterKey == '') this.filterState.emit(emitdata);
		if (this.gridEnumFilterKey) this.gridEnumFilterKey = '';
		if (this.gridRelationalFilterKey) this.gridRelationalFilterKey = '';
		this.isLoadedEnabled = false;
	}

	ngOnDestroy() {
		if (this.cmpRef) this.cmpRef.destroy();
	}
	
	public pageChange(event: PageChangeEvent): void {
		this.emitData.emit(event)
	}

	onGridSearchChange(event: any) {
		if (event === '') this.onFilter(null, true);
	}

	public onFilter(event: any, isButton: boolean = false): void {
		if ((event && event.keyCode == 13) || isButton == true) {
			this.isLoadedEnabled = true;
			let query: string = '';

			if (this.gridSearchKey) {
				let gridSearchKey = this.gridSearchKey.trim().toLocaleLowerCase()
				this.columns.forEach((column: any) => {
					let tempFilter: string = '';
					if (column.filterable && column.filterType != 'enum') {
						if (column.isRelation != 'undefined' && column.isRelation) {
							var col = column.name.split(".")[0];
							if (column.sub_field) {
								var entity = column.sub_field;
								tempFilter = `(${col}/any(a:contains(a/${entity}, '${gridSearchKey}')))`;
							} else {
								column.key.forEach((elm: any) => {
									var entity = elm;
									let tFil = `(${col}/any(a:contains(a/${entity}, '${gridSearchKey}')))`;
									tempFilter = tempFilter == '' ? tFil : tempFilter + ` or ${tFil}`;
								});
							}
						} else if (!column.name.includes('.')) {
							tempFilter = `(contains(${column.name},'${gridSearchKey}'))`;
						} else {
							var col = column.name.split(".")[0];
							var entity = column.name.split(".")[1];
							tempFilter = `(${col}/any(a:contains(a/${entity}, '${gridSearchKey}')))`;
						}
					} else if (column.filterable && column.filterType == 'enum') {
						column.dropdownList.forEach((elm: any) => {
							if (elm.text.toLowerCase().includes(`${gridSearchKey}`) || elm.value.toLowerCase().includes(`${gridSearchKey}`))
								tempFilter += tempFilter == '' ? `(contains(${column.name},'${elm.value}'))` : ` or (contains(${column.name},'${elm.value}'))`;
						});
					}
					if (query == '' && tempFilter != '') query = tempFilter;
					else if (tempFilter != '') query += ` or ${tempFilter}`
				})
				this.state.skip = 0;
			}

			this.fullGridSearchQuery = query ? `(${query})` : '';
			this.filterState.emit({
				query: this.fullGridSearchQuery,
				type: 'fullGridSearch'
			});
			this.isLoadedEnabled = false;
		}
	}
	onPageFilter(value: Event): void {
		if (!this.gridData.length) this.gridData = JSON.parse(JSON.stringify(this.gridItems))
		let filterFields: any = [];
		this.columns.map((column: any) => {
			let filter = {
				field: column.name,
				operator: "contains",
				value: this.gridSearchKey,
			}
			filterFields.push(filter)
		})
		this.gridItems = process(this.gridData, {
			filter: {
				logic: "or",
				filters: [
					...filterFields
				],
			},
		}).data;

		this.state.skip = 0;
	}
	handleEnumFilter(data: any, column: any) {
		this.isLoadedEnabled = true;
		let query: any = {
			field: column,
			operator: 'eq',
			value: data
		};

		const index: any = this.state.filter?.filters.findIndex((elm: any) => elm.field === query.field);
		if (index !== -1) this.state.filter!.filters[index] = query;
		else this.state.filter!.filters.push(query);

		this.filterState.emit({
			type: 'enum',
			state: this.state
		});
		this.isLoadedEnabled = false;

		let columnMenu: any = document.querySelector('.k-grid-columnmenu-popup');
		columnMenu.style.display = 'none';

		if (this.gridSearchKey) this.gridSearchKey = '';
	}

	enumFilterChange(data: any, col: any) {
		return col.dropdownFilterableList = col.dropdownList.filter(
			(s: any) => s.value.toLowerCase().indexOf(data.toLowerCase()) !== -1 || s.text.toLowerCase().indexOf(data.toLowerCase()) !== -1
		);
	}

	ngAfterViewInit() {
		const elements = document.querySelectorAll(".k-i-more-vertical.k-icon");
		elements.forEach((element) => {
			element.addEventListener("click", () => {
				setTimeout(() => {
					let filterMenu: any = document.querySelector('kendo-grid-columnmenu-filter');
					let filterButton: any = filterMenu.querySelector('.k-actions');
					this.filterBtnCustomMenu = filterButton.querySelector("button[type=submit]");
					this.filterBtnCustomMenu.removeAttribute('disabled');
					this.filterBtnCustomMenu?.addEventListener('click', () => {
						if (this.customFilterColumn && this.customFilterColumn.filterType) {
							if (this.customFilterColumn.filterType == 'multiLayer')
								this.filterCustomColumns(this.gridRelationalFilterKey, this.customFilterColumn.name);
							else if (this.customFilterColumn.filterType == 'enum')
								this.handleEnumFilter(this.gridEnumFilterKey, this.customFilterColumn.name);
						}
					});
				}, 1)
			});
		});
	}

	onFilterRelationalData(field: string) {
		const filterMenu: any = document.querySelector('kendo-grid-columnmenu-filter');
		const filterButton: any = filterMenu.querySelector('.k-actions');
		this.filterBtnCustomMenu = filterButton.querySelector("button[type=submit]");
		this.filterBtnCustomMenu.removeAttribute('disabled');
		this.customFilterColumn = field;
		if (this.gridSearchKey) this.gridSearchKey = '';
	}

	filterCustomColumns(event: any, field: string) {
		this.isLoadedEnabled = true;
		var search = event;
		var column = field.split(".")[0];
		var entity = field.split(".")[1];
		var filter: any = `(${column}/any(a:contains(a/${entity}, '${search}')))`;
		this.filterState.emit({
			query: filter,
			type: 'relational-data'
		});
		let columnMenu: any = document.querySelector('.k-grid-columnmenu-popup');
		columnMenu.style.display = 'none';
	}

	columnMenuChangeEvent(event: ColumnVisibilityChangeEvent) {
		let columns = [...event.columns]
		columns.filter((field: any) => {
			if (field.hidden) this.hiddenColumns.push(field.title);
			else this.hiddenColumns.splice(this.hiddenColumns.indexOf(field.title), 1);
		});
		let getKeyFromUrl = this.getKeyFromUrl();
		let storageData = this.getHideGirdColumns() ?? {};
		if (!storageData.hasOwnProperty([getKeyFromUrl[0]])) storageData[getKeyFromUrl[0]] = {}
		if (getKeyFromUrl.length > 1) storageData[getKeyFromUrl[0]][getKeyFromUrl[1]] = this.hiddenColumns;
		else storageData[getKeyFromUrl[0]] = this.hiddenColumns;

		this.setHideGirdColumns(storageData);
	}

	columnMenuReorderEvent(event: ColumnReorderEvent) {
		let columns = [...this.columns]
		this.columns[event.newIndex] = this.columns[event.oldIndex]
		if (event.newIndex < event.oldIndex) {
			columns.forEach((column: any, index: number) => {
				if (index > event.newIndex && index <= event.oldIndex) this.columns[index] = columns[index - 1];
			})
		} else {
			columns.forEach((column: any, index: number) => {
				if (index < event.newIndex && index >= event.oldIndex) this.columns[index] = columns[index + 1]
			})
		}
		let getKeyFromUrl = this.getKeyFromUrl();
		let storageData = this.getOrderGridColumns() ?? {};
		if (!storageData.hasOwnProperty([getKeyFromUrl[0]])) storageData[getKeyFromUrl[0]] = {}
		if (getKeyFromUrl.length > 1) storageData[getKeyFromUrl[0]][getKeyFromUrl[1]] = this.columns;
		else storageData[getKeyFromUrl[0]] = this.columns;
		this.setOrderColumns(storageData)
	}

	getHideGirdColumns() {
		return localStorage.getItem('hide_gird_columns') ? JSON.parse(localStorage.getItem('hide_gird_columns') ?? '') : null;
	}

	setHideGirdColumns(data: any) {
		let str = JSON.stringify(data);
		localStorage.removeItem('hide_gird_columns');
		localStorage.setItem('hide_gird_columns', str);
	}

	getKeyFromUrl() {
		return this.router.url.replace('/', '').replaceAll('-', '_').split('/');
	}

	getOrderGridColumns() {
		return localStorage.getItem('reorder_gird_columns') ? JSON.parse(localStorage.getItem('reorder_gird_columns') ?? '') : null;
	}

	setOrderColumns(data: any) {
		let str = JSON.stringify(data);
		localStorage.removeItem('reorder_gird_columns');
		localStorage.setItem('reorder_gird_columns', str);
	}
	createKey() {
		let key: any = {};
		let getKeyFromUrl = this.getKeyFromUrl();
		if (getKeyFromUrl.length >= 1) {
			key[getKeyFromUrl[0]] = {};
			key[getKeyFromUrl[0]][getKeyFromUrl[1]] = []
		};
		return key;
	}

	onClickEditItem(route: string, itemId: number) {
		this._commonService.saveGridState(this.state, this.moduleName);
		if (route) this.router.navigate([route, itemId]);
		else this.emitSelectedItem.emit(itemId);
	}
	public dataItem: any

	cellClickHandler(event: CellClickEvent) {
		this.gridCellClicked.emit(event);
		this.dataItem = event;
	}

	public dblClickHandler(e: any) {
		if (!e.target.classList.contains('k-touch-action-auto') && !e.target.classList.contains('badge')) return;
		this.dblClick.emit(this.dataItem);
		if (this._commonService.gridRowdblClick) {
			this.editHandler(this.dataItem);
		}
	}
}
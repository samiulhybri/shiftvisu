import { AuthService } from "@app/shared/services/auth.service";
import { debounceTime } from "rxjs/operators";
import {
	AfterViewInit,
	Component,
	EventEmitter,
	Output,
	Input as CoreInput,
	ViewChild,
	ViewEncapsulation,
} from "@angular/core";
import {
	BryntumSchedulerProComponent,
	BryntumSchedulerProProjectModelComponent,
} from "@bryntum/schedulerpro-angular-thin";
import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import {
	AssignmentStore,
	CalendarModelConfig,
	DependenciesConfig,
	ProjectModel,
	SchedulerPro,
} from "@bryntum/schedulerpro-thin";
import { Assignment } from "@app/modules/planvisu/user-scheduler/lib/Assignments";
import { Resource } from "@app/modules/planvisu/user-scheduler/lib/Resource";
import moment from "moment";
import { Tools } from "@app/shared/models/tools.model";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { Item } from "@app/shared/models/item.model";
import { Localization } from "@app/shared/utils/common-localize";
import { ValueHelperType } from "@app/modules/planvisu/gantt/enums/ValueHelperType";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";

import { CalendarModel, ResourceModel } from "@bryntum/schedulerpro-thin";
import {
	BryntumSchedulerProProjectModelProps,
	BryntumSchedulerProProps,
} from "@bryntum/schedulerpro-angular-thin";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import {
	ProdOrderPosOperationStatus,
	ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";
import { NgForm } from "@angular/forms";
import { lastValueFrom, Subject } from "rxjs";
import { ProdOrderPosOperationAltMachine } from "@app/shared/models/prod-order-pos-operation-alt-machine.model";
import { ToastComponent } from "@ui5/webcomponents-ngx";
import presets from "./lib/Presets";
import { environment } from "@app/environments/environment";
import { DateHelper, Popup, Widget } from "@bryntum/core-thin";
import { BryntumGridComponent } from "@bryntum/grid-angular-thin";
import { ToolRepairStatus } from "@app/modules/tool-visu/enums/ToolRepairStatus";
import Text from "@ui5/webcomponents/dist/Text";
import Input from "@ui5/webcomponents/dist/Input";
import { round } from "@amcharts/amcharts5/.internal/core/util/Time";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { MachineConstraintTypeClass } from "@app/shared/enums/MachineConstraintType";
import { Setting } from "@app/shared/models/setting.model";
import { ColorSchemeSorting } from "@app/shared/models/color-scheme-sorting.model";
import { PlanVisuWorkingDaysSettings } from "@app/shared/models/plan_visu_working_days_settings.model";
@Component({
	selector: "app-gantt",
	templateUrl: "./gantt.component.html",
	styleUrl: "./gantt.component.scss",
	encapsulation: ViewEncapsulation.None,
})
export class GanttComponent implements AfterViewInit {
	schedulerProProps = schedulerProProps;
	isEverythingLoaded = false;
	isBusy = false;
	plannedOperations: any = [];
	isDialogOpen: boolean = false;
	isValueHelpDialog: boolean = false;
	isValueHelperLoading: boolean = false;
	isLoading: boolean = false;
	isSaveButton: boolean = false;
	isShowProposedData: boolean = false;
	isDialogEditable: boolean = false;
	machines: any[] = [];
	opeartionMachines: any[] = [];
	selectedOperation: any = new ProdOrderPosOperation().deserialize({
		prodOrderPos: { quantity: 0, prodOrder: { custom_id: "" } },
	});

	assignments: any = [];
	halls: Hall[] = [];
	machineGroups: MachineGroup[] = [];
	prodOrdes: ProdOrder[] = [];
	prodOrderPosOperationStatusData?: any = [];
	items: Item[] = [];
	operationStart?: string = "";
	operationEnd?: string = "";
	selecteItem?: string = "";
	dialogTitle?: string = "";
	selectedHallValue: string = "";
	operations: any[] = [];
	projectProps = projectProps;
	hallCapacity: any[] = [];
	selectedMachine?: string = "";
	valueHelperData: any[] = [];
	valueHelperTitle?: string = "";
	valueHelperUrl: string = "";
	valueHelperSortBy: string = "custom_id";
	valueHelperSortType: string = "asc";
	valueHelperAdditionalFilterQuery: string = "";
	cachedQuantities = [];
	private schedulerPro!: SchedulerPro;
	private project!: ProjectModel;
	private gridSkip = 0;
	private gridLimit = 50;
	private drag?: any;
	start = this.getStartDate();
	end = this.getEndDate();
	timeAxisChange$ = new Subject<any>();
	calculateEnd$ = new Subject<any>();
	saveChanges$ = new Subject<any>();
	setDependencies$ = new Subject<any>();
	selectedHalls: number[] = [];
	selectItems: any[] = [];
	selectItemIds: number[] = [];
	selectCustomerIds: any[] = [];
	selectMachineGroups: number[] = [];
	selectCustomers: number[] = [];
	selectProdOrders: any[] = [];
	selectProdOrderIds: any[] = [];
	localization = Localization;
	valueHelperType = ValueHelperType;
	selectedValueHelperType: string = "";
	valueForProdOrder: string = "";
	valueForItem: string = "";
	valueForCustomer: string = "";
	expandedQuery: string = "";
	isExportBusy = false;
	toastMessage = "";
	isOperationReadyRealease = false;
	isPlanOrderExportDialogOpen = false;
	isOnGoWithOperationSelected = false;
	presets = presets;
	showPopOver = false;
	currentTasks = [];
	opener = "";
	clientName = environment.clientName;
	eventMenuFeature: any = {
		processItems: ({ eventRecord, items }: any) => {
			if (
				!this.authService.isPermissionValid(PermissionEnum.PLANVISU_GANTT_CHART_PAGE_DELETE)
			) {
				return items;
			}

			const operation = this.operations.find((o: any) => o.id == eventRecord.id);

			if (
				operation?.status == ProdOrderPosOperationStatus.IN_PRODUCTION ||
				operation?.status == ProdOrderPosOperationStatus.IN_SETUP
			) {
				return items;
			}

			if (
				this.clientName == "volaplast" &&
				operation?.status == ProdOrderPosOperationStatus.PLANNED
			) {
				return items;
			}

			if (this.clientName == "ict") {
				return;
			}

			items.other = {
				text: $localize`Close Operation`,
				onItem: ({ eventRecord, resourceRecord }: any): void => eventRecord.remove(),
			};
		},
		items: {
			machineSchedule: {
				text: $localize`Machine Schedule`,
				onItem: ({ resourceRecord }: any) => {
					this.selectedMachineId = resourceRecord.id;
				},
			},
			showPlanOperation: {
				text: $localize`Show Operation Plan`,
				onItem: ({ eventRecord }: any) => {
					this.showOperationPlan(eventRecord.id);
				},
			},
			showConnections: {
				text: $localize`Show/Hide Connections`,
				onItem: ({ eventRecord }: any) => {
					const op = this.operations.find((op: any) => op.id == eventRecord.id);
					const posId = op && op.prod_order_pos_id ? op.prod_order_pos_id : undefined;

					if (this.lastDependencyPosId == posId) {
						this.setDependencies$.next(undefined);
						this.lastDependencyPosId = undefined;
					} else {
						this.setDependencies$.next(posId);
						this.lastDependencyPosId = posId;
					}

				}
			},
			showConflicts: {
				text: $localize`Show Conflicts`,
				onItem: ({ eventRecord }: any) => {
					console.log(eventRecord);
				},
			},
			editEvent: false,
			copyEvent: false,
			cutEvent: false,
			splitEvent: false,
			deleteEvent: false,
		},
	};
	lastDependencyPosId: number | undefined;
	@CoreInput() set viewPresetfromUserScheduler(dataItem: string) {
		if (dataItem) (this.schedulerPro.viewPreset as any) = dataItem;
	}
	isPlanVisuGanttRestrictionRemove = environment?.isPlanVisuGanttRestrictionRemove;
	calendars: CalendarModelConfig[] = [
		{
			id: "workweek",
			name: "Work week",
			intervals: [
				{
					recurrentStartDate: this.clientName == "shopfloor" ? "on Fri" : "on Sat",
					recurrentEndDate: this.clientName == "shopfloor" ? "on Sun" : "on Mon",
					isWorking: false,
				},
			],
		},
	];

	public selectedMachineId?: number;
	momentInstance = moment;

	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;
	isStatusChanged = false;
	isEndBusy = false;
	isToolPreparedForRelease = false;
	dependenciesFeatures: DependenciesConfig = {
		allowCreate: false,
		highlightDependenciesOnEventHover: true,
	};
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("hallRef") hallRef: any;
	@ViewChild("machineRef") machineRef: any;
	@ViewChild("machineGroupRef") machineGroupRef: any;
	@ViewChild("toast") toast?: ToastComponent;
	@ViewChild("teInput") teInput?: any;
	@ViewChild("machineOrdersDialog", { static: false }) machineOrdersDialog: any;
	@ViewChild("orderDetailsDialog") orderDetailsDialog?: any;
	valueHelperColumns: any = [
		{
			Header: $localize`Custom ID`,
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

	@ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
	@ViewChild(BryntumGridComponent) gridComponent!: BryntumGridComponent;
	@ViewChild(BryntumSchedulerProProjectModelComponent)
	projectComponent!: BryntumSchedulerProProjectModelComponent;
	isToolChanged: boolean = false;
	planvisuGeneralSection: Setting[] = [];
	isCustomer?: boolean;
	public isShowHall?: boolean;
	public isShowMachineGroup?: boolean;
	public isShowMachine?: boolean;
	public isShowItem?: boolean;
	public isShowProdOrder?: boolean;
	public colorSchemeList: ColorSchemeSorting[] = [];
	public weekDaysList: PlanVisuWorkingDaysSettings[] = [];
	public isShowOperationPopupField: any = {
		'customer': true,
		'item': true,
		'prod_order': true,
		'due_date': true,
		'release_date': true,
		'constraint_type': true,
		'alt_machine': true
	}

	constructor(
		private commonService: CommonService,
		private authService: AuthService
	) { }

	async loadWeekDays() {
		this.commonService.get(`/PlanVisuWorkingDaysSettings`).subscribe({
			next: async (res: any) => {
				res.value.map((data: any) => {
					this.weekDaysList.push(new PlanVisuWorkingDaysSettings().deserialize(data))
				});
				await this.generateCalendarsFromWeekdays();
			},
			error: err => {
				console.error(err);
			},
		});
	}

	async generateCalendarsFromWeekdays() {
		const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const weekends = this.weekDaysList
			.filter(day => !day.is_working_day)
			.map(day => day.day)
			.sort((a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b));

		if (weekends) {
			const startDay = weekends[0];
			const lastWeekendDay = weekends[weekends.length - 1];

			let lastIndex = weekdayOrder.indexOf(lastWeekendDay);
			const nextDayIndex = (lastIndex + 1) % 7;
			const nextDay = weekdayOrder[nextDayIndex];

			const recurrentStartDate = startDay ? `on ${startDay?.slice(0, 3)}` : 'on Sat';
			const recurrentEndDate = nextDay ? `on ${nextDay?.slice(0, 3)}` : 'on Mon';

			this.calendars = [
				{
					id: "workweek",
					name: "Work week",
					intervals: [
						{
							recurrentStartDate: recurrentStartDate,
							recurrentEndDate: recurrentEndDate,
							isWorking: false,
						},
					],
				},
			];
			this.project.calendars = this.calendars;
		}
	}

	getStartDate() {
		if (environment.clientName != "ict") {
			return moment().subtract(0, "days").toISOString();
		}

		const dateStrings = localStorage.getItem("gantt-dates");
		console.log(dateStrings);

		if (!dateStrings) {
			return moment().subtract(0, "days").toISOString();
		} else {
			return JSON.parse(dateStrings).start
		}
	}

	getEndDate() {
		if (environment.clientName != "ict") {
			return moment().add(1, "months").toISOString();
		}

		const dateStrings = localStorage.getItem("gantt-dates")

		if (!dateStrings) {
			return moment().add(2, "months").toISOString();
		} else {
			return JSON.parse(dateStrings).end
		}
	}
	async setAllData() {
		await this.getAllColorSchemeSorting();
		await this.getAllComboBoxData();
		await this.setmachineData();
		await this.getHallMachine();
		await this.setCurrentTaskData();

		this.prodOrderPosOperationStatusData =
			ProdOrderPosOperationStatusClass.getEnumArray().filter(
				(v: any) =>
					v.value == "PROPOSED" ||
					v.value == "PLANNED" ||
					v.value == "TERMINATED" ||
					v.value == "IN_PRODUCTION"
			);

		await this.setAllOperations();

		this.isEverythingLoaded = true;

		this.cacheHalls();

		const data: any = {};
		data.start_date = this.start;
		data.end_date = this.end;
		data.isBusy = true;
		setTimeout(() => this.dataFilterEmmiter.emit(data), 100);
	}

	async getAllColorSchemeSorting() {
		this.colorSchemeList = [];
		this.commonService.get('PlanVisuColorSchemeSortings?$expand=colorScheme($select=id,custom_id)', true).subscribe({
			next: (res: any) => {
				this.colorSchemeList = res.value;
			},
			error: (err) => {
				console.log(err);
			}
		});
	}

	formatColor(base: any, type: string): string {
		switch (type) {
			case 'background':
				if (!base.color) return '#CCCCCC';
				return base.color.startsWith('#') ? base.color : `#${base.color}`;
			case 'border':
				if (!base.has_border) return 'none';
				return base.border_color.startsWith('#') ? `2px solid ${base.border_color}` : `2px solid #${base.border_color}`;
			default:
				return '';
		}
	}

	setCurrentTaskData() {
		return new Promise<void>((resolve) => {
			if (this.clientName == 'shopfloor') {
				this.commonService.get('plan_visu/running_tasks', false).subscribe({
					next: (res: any) => {
						this.currentTasks = res;
						resolve();
					},
					error: (err) => {
						console.log(err);
						resolve();
					}
				});
			} else {
				resolve();
			}
		});
	}

	cacheHalls() {
		const cachedHalls = JSON.parse(localStorage.getItem("Hall") || "[]");
		if (!cachedHalls.length) {
			localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
		}
	}

	async setAllOperations(clearDate = false, recalculateQuantity = true) {
		this.gridSkip = 0;
		await this.setOpertions(clearDate, recalculateQuantity);

		this.schedulerPro.events = [...this.plannedOperations];
		this.schedulerPro.assignments = this.assignments;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	onCellDoubleClick(event: any) {
		const machine = event.record.originalData;
		this.selectedMachineId = machine.id;
	}

	onSaveReScheduleOrderDialog = () => {
		this.onGo(false);
		this.onCloseReScheduleOrderDialog();
	};

	onCloseReScheduleOrderDialog = () => {
		this.selectedMachineId = undefined;
	};

	handleCustomerData(data: Setting[]) {
		this.planvisuGeneralSection = data;
		this.isCustomer = this.planvisuGeneralSection[0].show_customer;
		this.isShowHall = this.planvisuGeneralSection[0].show_filter_hall;
		this.isShowMachineGroup = this.planvisuGeneralSection[0].show_filter_machine_group;
		this.isShowMachine = this.planvisuGeneralSection[0].show_filter_machine;
		this.isShowItem = this.planvisuGeneralSection[0].show_filter_item;
		this.isShowProdOrder = this.planvisuGeneralSection[0].show_filter_prod_order;
		this.isShowOperationPopupField = {
			'customer': this.planvisuGeneralSection[0].show_op_customer,
			'item': this.planvisuGeneralSection[0].show_op_item,
			'prod_order': this.planvisuGeneralSection[0].show_op_prod_order,
			'due_date': this.planvisuGeneralSection[0].show_op_due_date,
			'release_date': this.planvisuGeneralSection[0].show_op_release_date,
			'constraint_type': this.planvisuGeneralSection[0].show_op_constraint_type,
			'alt_machine': this.planvisuGeneralSection[0].show_op_alt_machine
		}
	}

	async ngAfterViewInit() {
		await this.loadWeekDays();
		// Save grid, scheduler and project instances to this object
		this.schedulerPro = this.schedulerProComponent.instance;
		this.project = this.projectComponent.instance;

		// Create a chained version of the event store as our store.
		// It will be filtered to only display events that lack of assignments.
		// Config for grouping requiredRole in ascending mode while webpage loads initially.

		// When assignments change, update our chained store to reflect the changes.
		this.project.assignmentStore.on({
			change: () => {
				if (!this.isEverythingLoaded) {
					this.project.assignmentStore.commit();
					return;
				}

				this.saveChanges();
			},
		});

		// project's listener
		this.project.on({
			change: (event: any) => {
				if (event.action == "dataset") {
					return;
				}
				this.saveChanges$.next(event);
			},
			thisObj: this.project,
		});

		this.project.calendars = this.calendars;
		this.project.calendar = "workweek";

		this.setAllData().then(() => { });

		this.timeAxisChange$.pipe(debounceTime(500)).subscribe(event => {
			this.dateChange(event);
		});

		this.calculateEnd$.pipe(debounceTime(500)).subscribe(event => {
			this.calculateEnd();
		});

		this.saveChanges$.pipe(debounceTime(500)).subscribe(event => {
			this.saveChangesForEventStore(event);
		});

		this.setDependencies$.pipe(debounceTime(100)).subscribe(event => {
			this.setDependencies(event);
		});

		if (this.start && this.end) {
			this.schedulerPro.timeAxis.setTimeSpan(
				moment.utc(this.start).local().toDate(),
				moment.utc(this.end).local().toDate()
			);
		}
	}

	showOperationPlan(operationId: number) {
		const operation = this.operations.find(op => op.id == operationId);
		const order = operation.prodOrderPos.prodOrder;
		this.valueForProdOrder = order.custom_id;
		this.clearItems();
		this.selectProdOrderIds = [order.id];
		this.onGo(true, true);
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	async saveChangesForEventStore(event: any) {
		if (!this.isEverythingLoaded) {
			this.schedulerPro.eventStore.commit();
			return;
		}

		if (event.action != "update" && event.action != "remove") {
			return;
		}

		let requests: ODataBatchCall[] = [];
		let modifiedEvent: any;
		let res: any;

		if (event.action == "update") {
			const record = event.record;

			let requestData = new ODataBatchCall(
				0,
				"patch",
				`/odata/ProdOrderPosOperations/${record.id}`
			);

			const op = this.operations.find(o => o.id == record.id);
			const machine = record.resource;

			const quantity = op.prodOrderPos!.quantity ?? 0;
			const te: number = (op.te ?? 0).toString().replace(/,/g, ".");
			const start = moment(record.startDate).local().toISOString();
			const cavity = op.cavity ?? 1;
			const tr = op.tr;
			const usageFactor = machine.usage_factor;
			const teardown = op.teardown_time;
			const duration = this.getOrderDuration({
				te: te,
				tr: tr,
				cavity: cavity,
				quantity: quantity,
				usageFactor: usageFactor,
				teardownTime: teardown,
			});
			this.isBusy = true;

			res = await lastValueFrom(
				this.commonService.get(
					`capacity-plan/machine/${op.machine?.id}?start=${start} & duration=${duration}`,
					false
				)
			);

			this.isBusy = false;

			const altMachine = op.prodOrderPosOperationAltMachines.find(
				(alt: ProdOrderPosOperationAltMachine) => machine.id == alt.machine_id
			);

			const opMachineId = op.machine_id;

			requestData.body = {
				start: moment(record.startDate).toISOString(),
				plan_start: moment(record.startDate).toISOString(),
				end: res.end,
				plan_end: res.end,
				is_changed: true,
				operation_code: altMachine?.reference_nr ?? "",
				operation_code_plan: altMachine?.reference_nr ?? "",
				machine_id: machine.id,
				plan_machine_id: machine.id,
				plan_te: opMachineId == machine.id ? op.te : altMachine?.te ?? op.te ?? 0,
				te: opMachineId == machine.id ? op.te : altMachine?.te ?? op.te ?? 0,
			};

			if (op) {
				op.start = record.startDate;
				op.plan_start = record.startDate;
				op.end = moment.utc(res.end).local().toDate();
				op.plan_end = moment.utc(res.end).local().toDate();
				op.is_changed = true;
				modifiedEvent = record;
			}

			requests.push(requestData);
		}

		if (event.action == "remove") {
			let requestData = new ODataBatchCall(
				0,
				"patch",
				`/odata/ProdOrderPosOperations/${event.records[0].id}`
			);

			const index = this.operations.findIndex(o => o.id == event.records[0].id);
			if (index != -1) {
				this.operations.splice(index, 1);
			}

			requestData.body = {
				status: ProdOrderPosOperationStatus.CLOSED,
				status_plan: ProdOrderPosOperationStatus.CLOSED,
				is_changed: true,
			};

			requests.push(requestData);
		}

		if (requests.length) {
			this.isBusy = true;
			this.commonService.post(`$batch`, { requests }).subscribe({
				next: () => {
					this.project.eventStore.commit();

					requests.forEach(request => {
						const splitedUrl = request.url.split("/");

						const id = splitedUrl[splitedUrl.length - 1];

						if (this.clientName == "volaplast") {
							this.exportOperationCall(id);
						}
						this.isBusy = false;
						this.setConstraint(parseInt(id)).then(() => {
							this.onGo(false, false);
						});
					});
				},
				error: () => {
					this.isBusy = false;
				},
			});
		}
	}

	saveChanges() {
		let requests: ODataBatchCall[] = [];
		if (this.project.assignmentStore?.changes?.added?.length) {
			this.project.assignmentStore.changes.added?.forEach((d: any) => {
				let requestData = new ODataBatchCall(
					0,
					"patch",
					`/odata/ProdOrderPosOperations/${d.data.event.data.id}`
				);

				const op = this.operations.find(o => o.id == d.data.event.data.id);

				const altMachine = op.prodOrderPosOperationAltMachines.find(
					(alt: ProdOrderPosOperationAltMachine) => d.data.resourceId == alt.machine_id
				);

				requestData.body = {
					machine_id: d.data.resourceId,
					plan_machine_id: d.data.resourceId,
					start: moment(d.event.startDate).toISOString(),
					plan_start: moment(d.event.startDate).toISOString(),
					end: moment(d.event.endingDate).toISOString(),
					plan_end: moment(d.event.endingDate).toISOString(),
					is_changed: true,
					plan_te: altMachine?.te ?? op.te ?? 0,
					te: altMachine?.te ?? op.te ?? 0,
					operation_code: altMachine?.reference_nr ?? "",
					operation_code_plan: altMachine?.reference_nr ?? "",
				};

				if (op) {
					op.machine_id = d.data.resourceId;
					op.plan_machine_id = d.data.resourceId;
					op.start = d.event.startDate;
					op.plan_start = d.event.startDate;
					op.end = d.event.endingDate;
					op.plan_end = d.event.endingDate;
					op.is_changed = true;
					op.machine = this.machines.find(m => m.id == d.data.resourceId);
				}

				requests.push(requestData);
			});

			if (requests.length) {
				this.isBusy = true;
				this.commonService.post(`$batch`, { requests }).subscribe({
					next: () => {
						this.project.assignmentStore.commit();
						this.isBusy = false;
					},
					error: err => {
						this.isBusy = false;
					},
				});
			}
		}

		if (this.project.assignmentStore?.changes?.modified?.length) {
			this.project.assignmentStore.changes.modified?.forEach((d: any) => {
				let requestData = new ODataBatchCall(
					0,
					"patch",
					`/odata/ProdOrderPosOperations/${d.eventId}`
				);

				const op = this.operations.find(o => o.id == d.eventId);
				const altMachine = op.prodOrderPosOperationAltMachines.find(
					(alt: ProdOrderPosOperationAltMachine) => d.data.resourceId == alt.machine_id
				);
				requestData.body = {
					machine_id: d.data.resourceId,
					plan_machine_id: d.data.resourceId,
					start: moment(d.event.startDate).toISOString(),
					plan_start: moment(d.event.startDate).toISOString(),
					end: moment(d.event.endingDate).toISOString(),
					plan_end: moment(d.event.endingDate).toISOString(),
					is_changed: true,
					plan_te: altMachine?.te ?? op.te ?? 0,
					te: altMachine?.te ?? op.te ?? 0,
					operation_code: altMachine?.reference_nr ?? "",
					operation_code_plan: altMachine?.reference_nr ?? "",
				};

				if (op) {
					op.machine_id = d.data.resourceId;
					op.plan_machine_id = d.data.resourceId;
					op.start = d.event.startDate;
					op.plan_start = d.event.startDate;
					op.end = d.event.endingDate;
					op.plan_end = d.event.endingDate;
					op.is_changed = true;
					op.machine = this.machines.find(m => m.id == d.data.resourceId);
				}

				requests.push(requestData);
			});
		}

		if (requests.length) {
			this.commonService.post(`$batch`, { requests }).subscribe({
				next: () => {
					this.project.assignmentStore.commit();
				},
				error: () => {
					this.project.assignmentStore.removeAll();
				},
			});
		}
	}

	onExport() {
		this.isExportBusy = true;
		const config = {
			responseType: "text",
			observe: "response",
		};
		this.commonService.post("plan_visu/export_prod_orders", {}, false, config).subscribe({
			next: (res: any) => {
				this.isExportBusy = false;
				if (res.status == 200) {
					this.toastMessage = $localize`Data is Exported`;
					this.toast!.open = true;
				} else {
					this.toastMessage = $localize`Data is Not Exported Successfully`;
					this.toast!.open = true;
				}
			},
			error: err => {
				this.isExportBusy = false;
				this.toastMessage = $localize`Data is Not Exported Successfully`;
				this.toast!.open = true;
			},
		});
	}

	eventDragStart(event: any) {
		this.schedulerPro.resourceStore.removeFilter("1");

		const op = this.operations.find(o => o.id == event.eventRecords[0].id);

		const ar = this.machines.filter(
			(availableResource: any) =>
				op.prodOrderPosOperationAltMachines.filter(
					(alteredMachine: any) => alteredMachine.machine_id == availableResource.id
				).length > 0
		);
	}

	onAfterEventDrop() {
		this.schedulerPro.resourceStore.removeFilter("1");
	}

	async dateChange(event: any) {
		console.log((this.schedulerPro.viewPreset as any).data.id);
		const data: any = {};
		data.zoom = (this.schedulerPro.viewPreset as any).data.id;
		this.dataFilterEmmiter.emit(data);
	}

	changeDate(event: any) {
		const dates = event.detail.value.split(" - ");

		if (dates.length > 1) {
			this.start = moment.utc(dates[0], "DD/MM/YYYY").local().toISOString();
			this.end = moment.utc(dates[1], "DD/MM/YYYY").local().toISOString();
			if (this.clientName == "ict") {
				const dateObj = { start: this.start, end: this.end };
				localStorage.setItem("gantt-dates", JSON.stringify(dateObj));
			}
		}
	}

	eventDrag(event: any) {
		const context = event.context;
		const { schedulerPro } = this,
			{ appointments, totalDuration } = context,
			// requiredRole = appointments[0].requiredRole,
			newStartDate = schedulerPro.getDateFromCoordinate(context.newX, "round", false),
			lastAppointmentEndDate =
				newStartDate &&
				DateHelper.add(newStartDate, totalDuration, appointments[0].durationUnit),
			doctor = context.target && schedulerPro.resolveResourceRecord(context.target),
			calendar = doctor?.calendar;

		const defaultValidLogic =
			newStartDate &&
			// Ensure we don't break allowOverlap config
			(schedulerPro.allowOverlap ||
				(schedulerPro.isDateRangeAvailable(
					newStartDate,
					lastAppointmentEndDate,
					null,
					doctor
				) &&
					// Respect resource's working time
					(!calendar ||
						calendar.isWorkingTime(newStartDate, lastAppointmentEndDate, true))));

		const op = this.operations.find(o => o.id == event.eventRecords[0].id);

		const otherLogic = op
			? op.prodOrderPosOperationAltMachines?.filter(
				(alteredMachine: any) => alteredMachine.machine_id == event.newResource.id
			).length > 0 || op.machine_id == event.newResource.id
			: false;

		// Only allow drops on the timeaxis
		context.valid = otherLogic;
		if (context.valid) {
			event.context.proxyElements[0].classList.remove("b-sch-color-red");
			event.context.proxyElements[0].classList.add("b-sch-color-green");
		} else {
			event.context.proxyElements[0].classList.remove("b-sch-color-green");
			event.context.proxyElements[0].classList.add("b-sch-color-red");
		}

		const { calendarHighlight } = this.schedulerPro.features;

		const availableResources = event.context.availableResources;

		const ar = availableResources.filter(
			(availableResource: any) =>
				op.prodOrderPosOperationAltMachines.filter(
					(alteredMachine: any) => alteredMachine.machine_id == availableResource.id
				).length > 0 || op.machine_id == availableResource.id
		);

		if (ar.length > 0) {
			calendarHighlight.highlightResourceCalendars(ar);
			if (this.schedulerPro.selectedRows[0] as any) {
				this.schedulerPro.deselectRow((this.schedulerPro.selectedRows[0] as any).id);
			}
		} else {
			calendarHighlight.unhighlightCalendars();
		}
	}

	eventDrop(event: any) {
		const eventStartDate = event.context.startDate;
		const machineId = event.context.newResource.id;
		const eventId = event.context.eventRecord.id;

		const previousEvent = this.operations
			.sort((a, b) => {
				// Sort based on the absolute difference between eventStartDate and e.end
				const diffA = moment.utc(eventStartDate).diff(moment.utc(a.end), "seconds");
				const diffB = moment.utc(eventStartDate).diff(moment.utc(b.end), "seconds");
				return diffA - diffB;
			})
			.find((e: any) => {
				return (
					e.machine_id === machineId &&
					e.id != eventId &&
					Math.abs(moment.utc(eventStartDate).diff(moment.utc(e.end), "seconds")) >= 0 &&
					Math.abs(moment.utc(eventStartDate).diff(moment.utc(e.end), "seconds")) <
					this.getEventSkippingTime()
				);
			});

		const acEvent = this.schedulerPro.events.find(e => e.id == eventId);

		if (previousEvent) {
			acEvent!.endDate = moment
				.utc(previousEvent.end)
				.local()
				.add(
					Math.abs(
						moment.utc(acEvent!.endDate).diff(moment.utc(acEvent!.startDate), "seconds")
					),
					"seconds"
				)
				.toDate();

			acEvent!.startDate = moment.utc(previousEvent.end).local().toDate();
		}

	}

	getEventSkippingTime(): number {
		const viewPresetName = (this.schedulerPro.viewPreset as any).data.id;

		switch (viewPresetName) {
			case "weekAndMonth1":
				return 45000;
			case "dayAndWeek":
				return 25000;
			case "monthAndYear":
				return 900000;
			case "manyYears":
				return 20000;
			case "manyYears-80by50":
				return 160000;
			case "year-30by100":
				return 160000;
			case "year-50by100":
				return 160000;
			case "year":
				return 160000;
			case "year-200by100":
				return 160000;
			case "weekDateAndMonth":
				return 160000;
			case "weekDateAndMonth2":
				return 160000;
			case "weekAndDayLetter1":
				return 50000;
			case "weekAndDay-54by80":
				return 50000;
			case "weekAndDay-54by802":
				return 50000;
			case "weekAndDay-54by803":
				return 50000;
			case "dayAndMonth1":
				return 25000;
			case "weekAndDay1":
				return 25000;
			case "dayAndweekAndMonth1":
				return 10000;
			case "dayAndweekAndMonth12":
				return 10000;
			case "hourAndDay-64by40":
				return 10000;
			case "hourAndDay-64by4022":
				return 10000;
			case "hourAndDay-100by40":
				return 5000;
			case "hourAndDay-64by40-2":
				return 2500;
			case "minuteAndHour1":
				return 700;
			case "minuteAndHour-60by60":
				return 400;
			case "minuteAndHour-130by60":
				return 400;
			case "minuteAndHour-60by60-5":
				return 400;
			case "minuteAndHour-100by60":
				return 400;
			case "minuteAndHour-100by602":
				return 400;
			case "minuteAndHour-100by603":
				return 400;
			case "minuteAndHour-100by604":
				return 400;
			case "secondAndMinute":
				return 10;
			case "secondAndMinute-60by40":
				return 10;
			case "secondAndMinute-130by40":
				return 10;
		}
		return 43200;
	}

	onSchedulerSelectionChange() {
		const selectedRecords = this.schedulerPro.selectedRecords as any[],
			{ calendarHighlight } = this.schedulerPro.features;
		if (selectedRecords.length > 0) {
			calendarHighlight.highlightResourceCalendars(selectedRecords);
		} else {
			calendarHighlight.unhighlightCalendars();
		}
	}

	setmachineData() {
		return new Promise<void>((resolve, reject) => {
			const query = this.getMachineQuery();
			this.commonService
				.get(query, !this.isItemSelected() && !this.isOrderSelected())
				.subscribe({
					next: (data: any) => {
						this.machines = data.value
							.filter(
								(d: any) =>
									d.sectionActivatables.length > 0 &&
									d.sectionActivatables[0].is_active == true
							)
							.map((v: any) => {
								v.role = "Resource";
								v.roleIconCls = "b-icon b-fa-user-md";
								// v.calendar = v.custom_id;
								v.calendar = "workweek";
								v.image = false;
								// this.setCapacity(v);
								const m = new Machine().deserialize(v);
								if (environment.clientName == "ict") {
									m.name = `${m.custom_id} - ${m.name}`;
								}
								return m;
							});
						if (this.drag) this.drag.machines = this.machines;
						this.setResources();

						resolve();
					},
				});
		});
	}

	setResources() {
		this.schedulerPro.resources = this.machines;
	}

	getMachineQuery() {
		if (this.isItemSelected()) return this.getItemQuery();
		if (this.isOrderSelected()) return this.getProdOrderQuery();

		return this.getLodataQuery();
	}

	isOrderSelected() {
		const prodOrderValue = (document.getElementById("prodOrderInput") as Input).value;
		return prodOrderValue.length > 0 || this.selectProdOrderIds.length > 0;
	}

	isItemSelected() {
		return this.selectItemIds.length > 0;
	}

	isCustomerSelected() {
		const customerValue = (document.getElementById("customerInput") as Input).value;
		return customerValue.length > 0 || this.selectCustomerIds.length > 0;
	}

	getItemQuery() {
		return `machines/item/[${this.selectItemIds.join(",")}]`;
	}

	getProdOrderQuery() {
		if (this.selectProdOrderIds.length) {
			return `machines/order/[${this.selectProdOrderIds.map((v: any) => (typeof v === "number" ? v : `"${v.trim()}"`))}]`;
		} else return "";
	}

	getLodataQuery() {
		return `Machines?$filter=is_active eq true${this.getSelectedMachineQuery()} ${this.selectedHalls.length > 0 ? `and ${this.getHallQuery()}` : ""} ${this.selectMachineGroups.length > 0 ? `and ${this.getMachineGroupQuery()}` : ""} &$expand=machineGroup&$expand=sectionActivatables($filter=section%20eq%20%27PLANVISU%27%20and%20is_active%20eq%20true)&$top=1000&orderby=sort_order asc`;
	}

	getSelectedMachineQuery() {
		const query = this.selectedMachineIds.join(",");
		return this.selectedMachineIds.length ? ` and id in (${query})` : ""
	}

	getHallQuery() {
		return this.selectedHalls.length ? `hall_id in (${this.selectedHalls.join(",")})` : "";
	}
	getMachineGroupQuery() {
		return this.selectMachineGroups.length ? `machine_group_id in (${this.selectMachineGroups.join(',')})` : "";
	}

	setCapacity(m: Machine) {
		const capacity: CalendarModelConfig = {
			id: m.custom_id!,
			name: m.custom_id!,
			unspecifiedTimeIsWorking: true,
			treatInconsistentIntervals: "Skip",
			intervals: m.capacities.map(c => {
				return {
					startDate: moment.utc(`${c.date} ${c.start_time}`).toDate(),
					endDate: moment.utc(`${c.date} ${c.end_time}`).toDate(),
					isWorking: false,
					type: "Exception",
				};
			}),
		};
		this.calendars.push(capacity);
	}

	setAssignments() {
		this.assignments = this.operations
			.filter(operation => operation.start && operation.end && operation.machine_id)
			.map(operation => {
				return {
					id: operation.id,
					eventId: operation.id,
					resource: operation.machine_id,
				};
			});

		this.isStatusChanged = false;
	}

	onChangeItem(event: any) {
		const inputValArr = (event.target as any).value.split(", ");
		this.selectItems = this.selectItems.filter((item: any) =>
			inputValArr.includes(item.original.custom_id)
		);
		this.selectItemIds = this.selectItems.map((item: any) => item.original.id);
		this.valueForItem = this.selectItems.map((item: any) => item.original.custom_id).join(", ");
	}

	onChangeCustomer(event: any) {
		const inputValArr = (event.target as any).value.split(", ");
		this.selectCustomers = this.selectCustomers.filter((item: any) =>
			inputValArr.includes(item.original.custom_id)
		);
		this.selectCustomerIds = this.selectCustomers.map((item: any) => item.original.id);
		this.valueForCustomer = this.selectCustomers.map((item: any) => item.original.custom_id).join(", ");
	}

	clearProdOrders() {
		this.selectProdOrders = [];
		(document.getElementById("prodOrderInput") as Input).value = "";
		this.selectProdOrderIds = [];
	}
	clearItems() {
		this.selectItemIds = [];
		this.valueForItem = "";
	}

	clearCustomers() {
		this.selectCustomerIds = [];
		this.valueForCustomer = "";
	}

	clearMachineGroup() {
		this.selectMachineGroups = [];
	}

	clearHallSelection() {
		this.selectedHalls = [];
		this.hallRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
	}

	clearMachine() {
		this.selectedMachineIds = [];
		this.machineRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
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
	}

	async onEventClick(event: any) {
		this.selectedOperation = new ProdOrderPosOperation().deserialize(
			JSON.parse(
				JSON.stringify(
					this.operations.find(
						(item: any) => item.id === event.eventRecord.originalData.id
					)
				)
			)
		);
		const operation = this.selectedOperation;
		const startDateTime = (this.operationStart = moment
			.utc(operation?.start)
			.local()
			.format("DD.MM.YYYY, HH:mm"));
		const endDateTime = (this.operationStart = moment
			.utc(operation?.end)
			.local()
			.format("DD.MM.YYYY, HH:mm"));
		const status =
			operation?.status == "TERMINATED"
				? $localize`Planned`
				: operation?.status == "PLANNED"
					? $localize`Released`
					: this.prodOrderPosOperationStatusClass.getStateTranslate(operation?.status);

		const popup = new Popup({
			owner: event?.source,
			autoShow: false,
			closable: true,
			closeAction: "destroy",
			minWidth: "1000px",
			minHeight: "19em",
			align: {
				align: "t-b",
				anchor: true,
			},
			header: false,
			html: `
				<div class="flex flex-row">
					<div class="flex flex-col w-[500px] gap-3" id="startDiv">
						${this.isShowOperationPopupField.prod_order ? `
							<div class="flex flex-row">
								<ui5-label show-colon class="w-2/4">${$localize`Order Number`}</ui5-label>
								<ui5-text class="w-3/4">${operation?.prodOrderPos?.prodOrder?.custom_id ?? ""}</ui5-text>
							</div>` : ""}

						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Machine`}</ui5-label
							>
							<ui5-text class="w-3/4"
								>${operation.machine?.custom_id} - ${operation?.machine?.name ?? ""}</ui5-text
							>
						</div>

						${this.isShowOperationPopupField.item ? `
							<div class="flex flex-row">
								<ui5-label show-colon class="w-2/4">${$localize`Item`}</ui5-label>
								<ui5-text class="w-3/4">${operation.prodOrderPos?.item?.custom_id ?? ""} - (${operation.prodOrderPos?.item?.name ?? ""})</ui5-text>
							</div>` : ""}
						
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Tool`}</ui5-label
							>
							<ui5-text class="w-3/4"
								>${operation.tool?.custom_id ?? ""} - (${operation.tool?.name})</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Quantity`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.prodOrderPos!.quantity ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Produced Quantity`}</ui5-label
							>
							<ui5-text id="producteQuantity" class="w-3/4">${operation.produced_quantity ?? "0"}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`TE`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.te ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`TR`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.tr ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Batch`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.prodOrderPos?.batch ?? ""}</ui5-text>
						</div>
					</div>

					<div class="flex flex-col w-[500px] ml-3 gap-3" id="leftDiv">
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Teardown Time`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.teardown_time ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`POS`}</ui5-label
							>
							<ui5-text class="w-3/4">${operation.pos ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Start Date`}</ui5-label
							>
							<ui5-text class="w-3/4">${startDateTime ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`End Date`}</ui5-label
							>
							<ui5-text class="w-3/4">${endDateTime ?? ""}</ui5-text>
						</div>
						<div class="flex flex-row">
							<ui5-label
								show-colon
								class="w-2/4"
								>${$localize`Status`}</ui5-label
							>
							<ui5-text class="w-3/4">${status ?? ""}</ui5-text>
						</div>
						${this.isShowOperationPopupField.due_date ? `
							<div class="flex flex-row">
								<ui5-label show-colon class="w-2/4">${$localize`Due Date`}</ui5-label>
								<ui5-text class="w-3/4">${operation.prodOrderPos.due_date ? moment.utc(operation.prodOrderPos.due_date).local().format("DD.MM.YYYY HH:mm") : ""}</ui5-text>
							</div>` : ""}

						${this.isShowOperationPopupField.release_date ? `
							<div class="flex flex-row">
								<ui5-label show-colon class="w-2/4">${$localize`Release Date`}</ui5-label>
								<ui5-text class="w-3/4">${operation.prodOrderPos.release_date ? moment.utc(operation.prodOrderPos.release_date).local().format("DD.MM.YYYY HH:mm") : ""}</ui5-text>
							</div>` : ""}
							
						${this.isShowOperationPopupField.alt_machine ? `
							<div class="flex flex-row">
								<ui5-label show-colon class="w-2/4">${$localize`Alternative Machines`}</ui5-label>
								<ui5-text class="w-3/4">${operation.prodOrderPosOperationAltMachines.map((alt: any) => `${alt.machine?.name}`).join()}</ui5-text>
							</div>` : ""}
					</div>

					<div id="restriction" class="flex flex-col"></div>
				</div>
			`,
		});
		popup.showBy(event?.eventElement);

		if (document.getElementById("leftDiv")) {
			if (
				operation?.restrictions?.tool_restriction?.status ||
				operation?.restrictions?.due_date_restriction?.status ||
				operation?.restrictions?.overlapping_restriction?.status ||
				operation?.restrictions?.tool_status?.status ==
				ToolRepairStatus.NOT_READY_FOR_USE ||
				operation?.restrictions?.tool_status?.status ==
				ToolRepairStatus.MAINTENANCE_REQUIRED ||
				operation?.restrictions?.tool_status?.sampling_required
			) {
				document.getElementById("leftDiv")!.style.borderRight = "1px solid black";
			} else {
				document.getElementById("leftDiv")!.style.borderRight = "";
			}
		} else {
			document.getElementById("leftDiv")!.style.borderRight = "";
		}
		if (document.getElementById("restriction")) {
			document.getElementById("restriction")!.innerHTML = "";
		}

		if (operation?.restrictions?.tool_restriction?.status) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-red-700 mt-1 ml-5">${$localize`Usage of tools at the same time in different operations` + "(" + operation?.restrictions?.tool_restriction.data.prodOrderPos.prodOrder.custom_id + "|" + operation?.restrictions?.tool_restriction.data.pos + ")"}</ui5-text>`;
		}
		if (operation?.restrictions?.due_date_restriction?.status) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-red-700 mt-1 ml-5">${$localize`Conflict between Due date and end date of the last operation`}</ui5-text>`;
		}
		if (operation?.restrictions?.overlapping_restriction?.status) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-red-700 mt-1 ml-5">${$localize`Following operations have start date before end date of the previous operation`}</ui5-text>`;
		}
		if (operation?.restrictions?.tool_status?.status == ToolRepairStatus.NOT_READY_FOR_USE) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-red-700 mt-1 ml-5">${$localize`Tool is not ready for Production`}</ui5-text>`;
		}
		if (operation?.restrictions?.tool_status?.status == ToolRepairStatus.MAINTENANCE_REQUIRED) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-orange-700 mt-1 ml-5">${$localize`Tool can be used for Production but needs maintenance`}</ui5-text>`;
		}

		if (operation?.restrictions?.tool_status?.sampling_required) {
			document.getElementById("restriction")!.innerHTML +=
				`<ui5-text class="text-red-700 mt-1 ml-5">${$localize`Sampling for this tool required`}</ui5-text>`;
		}

		if (operation?.restrictions?.overlapping_restriction?.status) {
		}
	}

	popOverClose() {
		this.showPopOver = false;
	}

	editDialogOpen(event: any) {
		if (!this.isGanttEditable()) return;
		console.log(this.orderDetailsDialog.selectedOperation.status);
		this.isToolChanged = false;
		this.orderDetailsDialog.selectedOperation = new ProdOrderPosOperation().deserialize(
			JSON.parse(
				JSON.stringify(
					this.operations.find(
						(item: any) => item.id === event.eventRecord.originalData.id
					)
				)
			)
		);

		this.orderDetailsDialog.isOperationReadyRealease =
			this.orderDetailsDialog.selectedOperation.status == ProdOrderPosOperationStatus.PLANNED;

		this.dialogTitle =
			this.clientName == "shopfloor"
				? `${this.orderDetailsDialog.selectedOperation.prodOrderPos.prodOrder.assembly} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos.prodOrder.custom_id} ${this.orderDetailsDialog.selectedOperation.name} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.name}`
				: `${this.orderDetailsDialog.selectedOperation.name} | ${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.name}`;
		if (this.orderDetailsDialog.selectedOperation.machine) {
			this.selectedMachine = this.orderDetailsDialog.selectedOperation.machine.name;
		}
		if (
			this.orderDetailsDialog.selectedOperation.prodOrderPos?.item &&
			this.orderDetailsDialog.selectedOperation.prodOrderPos
		) {
			this.selecteItem = `${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.custom_id} - ${this.orderDetailsDialog.selectedOperation.prodOrderPos?.item?.name}`;
		}

		this.isSaveButton =
			this.orderDetailsDialog.selectedOperation.status === "TERMINATED" ? false : true;
		this.opeartionMachines = JSON.parse(
			JSON.stringify(
				this.orderDetailsDialog.selectedOperation.prodOrderPosOperationAltMachines
			)
		);

		if (this.orderDetailsDialog.selectedOperation?.start) {
			this.orderDetailsDialog.operationStart = moment
				.utc(this.orderDetailsDialog.selectedOperation?.start)
				.local()
				.format("DD.MM.YYYY, HH:mm");
		}

		if (this.orderDetailsDialog.selectedOperation?.end)
			this.operationEnd = moment
				.utc(this.orderDetailsDialog.selectedOperation?.end)
				.local()
				.format("DD.MM.YYYY, HH:mm");

		this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
			"none";
		this.checkForMaintenance();

		this.orderDetailsDialog.toolsComboBox.value =
			(this.orderDetailsDialog.selectedOperation.tool?.custom_id || "") +
			" - " +
			(this.orderDetailsDialog.selectedOperation.tool?.name || "");

		this.isDialogOpen = true;
	}

	checkForMaintenance() {
		this.isToolPreparedForRelease = false;
		const body = {};
		if (this.orderDetailsDialog.selectedOperation.tool_id) {
			if (
				this.orderDetailsDialog.selectedOperation.restrictions.tool_status.status ==
				ToolRepairStatus.NOT_READY_FOR_USE
			) {
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
					"block";

				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.textContent = $localize`Tool is not ready for Production`;
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.remove(
					"text-orange-600"
				);
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.add(
					"text-red-600"
				);

				this.isToolPreparedForRelease = false;
			} else if (
				this.orderDetailsDialog.selectedOperation.restrictions.tool_status.status ==
				ToolRepairStatus.MAINTENANCE_REQUIRED
			) {
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
					"block";
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.textContent = $localize`Tool can be used for Production but needs maintenance`;
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.remove(
					"text-red-600"
				);
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.add(
					"text-orange-600"
				);

				this.isToolPreparedForRelease = true;
			} else {
				this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
					"none";
				this.isToolPreparedForRelease = true;
			}
		} else {
			this.isToolPreparedForRelease = true;
		}
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			return;
		}
	}

	touchStart(event: any) {
		event.preventDefault();
	}

	onChangeTool(event: any) {
		if (this.orderDetailsDialog.selectedOperation) {
			this.isToolChanged = true;
			const resource =
				this.orderDetailsDialog.selectedOperation.prodOrderPosOperationResources.find(
					(resource: any) => resource.item?.id == parseInt(event.detail.item.id)
				);

			this.orderDetailsDialog.selectedOperation.tool = resource?.item;
			this.orderDetailsDialog.selectedOperation.tool_reference_nr = resource?.reference_nr;

			this.checkForMaintenance();
		}
	}

	selectHall(event: any) {
		this.selectedHalls = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
		this.getHallMachine()
	}
	selectedMachineIds: number[] = [];
	filterMachines: Machine[] = [];
	getHallMachine() {
		this.commonService.get(this.getLodataQuery()).subscribe({
			next: (res: any) => {
				this.filterMachines = res.value?.filter(
					(d: any) =>
						d.sectionActivatables.length > 0 &&
						d.sectionActivatables[0].is_active == true
				);
			}
		})
	}
	selectMachine(event: any) {
		this.selectedMachineIds = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	selectMachineGroup(event: any) {
		this.selectMachineGroups = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	selectItem(event: any) {
		this.selectItems = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
	}

	selectProdOrder(event: any) {
		this.selectProdOrders = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	onMachineInputChange(event: any) {
		if (this.orderDetailsDialog.selectedOperation) {
			const currentMachine = this.orderDetailsDialog.opeartionMachines.find(
				(altMachine: any) => altMachine.machine.id == event.detail.item.id
			);
			this.orderDetailsDialog.selectedOperation.machine = new Machine().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
			this.orderDetailsDialog.selectedOperation.machine.usage_factor =
				currentMachine.machine.usage_factor;
			this.orderDetailsDialog.selectedOperation.plan_machine_id = parseInt(
				event.detail.item.id
			);
			this.orderDetailsDialog.selectedOperation.te =
				this.orderDetailsDialog.selectedOperation?.prodOrderPosOperationAltMachines.find(
					(alt: ProdOrderPosOperationAltMachine) =>
						parseInt(event.detail.item.id) == alt.machine_id
				)?.te ?? this.orderDetailsDialog.selectedOperation.te;
			this.orderDetailsDialog.selectedOperation.plan_te =
				this.orderDetailsDialog.selectedOperation?.prodOrderPosOperationAltMachines.find(
					(alt: ProdOrderPosOperationAltMachine) =>
						parseInt(event.detail.item.id) == alt.machine_id
				)?.te ?? this.orderDetailsDialog.selectedOperation.te;
		}
	}

	onChangeMachine(event: any) {
		if (!this.orderDetailsDialog.selectedOperation) return;

		const currentMachine = this.orderDetailsDialog.opeartionMachines.find(
			(altMachine: any) => altMachine.machine.id == event.detail.item.id
		);

		this.orderDetailsDialog.selectedOperation.machine = new Machine().deserialize({
			id: parseInt(event.detail.item.id) || 0,
			name: event.detail.item.text || "",
			custom_id: event.detail.item.additionalText || "",
		});

		this.orderDetailsDialog.selectedOperation.machine.usage_factor =
			currentMachine.machine.usage_factor;

		const alt = this.orderDetailsDialog.selectedOperation.prodOrderPosOperationAltMachines.find(
			(alt: any) => alt.machine?.id == event.detail.item.id
		);

		if (alt?.te) this.orderDetailsDialog.selectedOperation.te = alt?.te;

		if (alt.reference_nr)
			this.orderDetailsDialog.selectedOperation.operation_code = alt?.reference_nr;
	}

	onStatusChange(event: any) {
		if (this.orderDetailsDialog.selectedOperation) {
			this.orderDetailsDialog.selectedOperation.status =
				event.detail.item.text == $localize`Released`
					? "PLANNED"
					: event.detail.item.text == $localize`Planned`
						? "TERMINATED"
						: ProdOrderPosOperationStatusClass.getStateValue(event.detail.item.text);
			this.orderDetailsDialog.selectedOperation.status_plan =
				this.orderDetailsDialog.selectedOperation.status;
			this.isStatusChanged = true;
		}
	}

	onConstraintChange(event: any) {
		this.orderDetailsDialog.selectedOperation.constraint_type =
			MachineConstraintTypeClass.getStateValue(event.detail.item.text);
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
		}
		else if (type === this.valueHelperType.CUSTOMER) {
			this.valueHelperUrl = "/Customers";
			this.selectedValueHelperType = this.valueHelperType.CUSTOMER;
			this.valueHelperColumns[1].accessor = "name";
			this.valueHelperColumns[1].Header = $localize`Name`;
			this.filterHandler();
			this.valueHelperTitle = $localize`Customers`;
			this.valueHelperSortBy = "id";
			this.valueHelperSortType = "desc";
			this.valueHelperAdditionalFilterQuery = "is_active eq true";
		}
		else {
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

	processData(data: any) {
		let selectedIds: number[] = [];
		selectedIds = (
			this.selectedValueHelperType === this.valueHelperType.PRODORDER
				? this.selectProdOrderIds
				: this.selectedValueHelperType === this.valueHelperType.CUSTOMER
					? this.selectCustomerIds
					: this.selectItemIds
		) as number[];
		this.selectedValueHelperType === this.valueHelperType.PRODORDER
			? this.selectProdOrderIds
			: this.selectedValueHelperType === this.valueHelperType.CUSTOMER
				? this.selectCustomerIds
				: this.selectItemIds;

		if (this.childComponent?.data.length && selectedIds.length) {
			this.setSelectedTableData(selectedIds);
		}
	}

	onChangeProdOrderStatus() {
		this.isShowProposedData = !this.isShowProposedData;
		this.onGo();
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

	closeValueHelpDialog() {
		this.isValueHelpDialog = false;
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
			this.clearCustomers();
		}
		else if (this.selectedValueHelperType === this.valueHelperType.CUSTOMER) {
			const newArray = this.selectCustomers
				.filter((item: any) => item?.original?.id)
				.map((item: any) => item?.original?.custom_id ?? "");

			this.selectCustomerIds = this.selectCustomers
				.filter((item: any) => item?.original?.id)
				.map((item: any) => item?.original?.id ?? "");
			this.valueForCustomer = newArray.join(", ");
			this.clearItems();
			this.clearProdOrders();
		}
		else {
			const newArray = this.selectItems.map((item: any) => item.original.custom_id);
			this.selectItemIds = this.selectItems.map((item: any) => item.original.id);
			this.valueForItem = newArray.join(", ");
			this.clearProdOrders();
			this.clearCustomers();
		}

		this.clearHallSelection();
		this.clearMachineGroup();
		this.clearMachine();
	}

	rowClick(event: any) {
		const selectedFlatRows = event.detail.selectedFlatRows;
		if (this.selectedValueHelperType === this.valueHelperType.PRODORDER) {
			this.selectProdOrders = selectedFlatRows;
		}
		else if (this.selectedValueHelperType === this.valueHelperType.CUSTOMER) {
			this.selectCustomers = selectedFlatRows;
		}
		else {
			this.selectItems = selectedFlatRows;
		}
	}
	@Output() dataFilterEmmiter = new EventEmitter<any>();
	async onGo(resetTimeSpan = true, recalculateQuantity = true) {
		if (resetTimeSpan && recalculateQuantity) this.dataFilterEmmiter.emit({ isBusy: true });
		const { calendarHighlight } = this.schedulerPro.features;
		calendarHighlight.unhighlightCalendars(); // fix: if any row is highlighted and after filtering data whole row become invisible

		this.operations = [];
		this.plannedOperations = [];

		if (resetTimeSpan) this.setTimeSpan();

		this.isBusy = true;

		this.isOnGoWithOperationSelectedSet();
		await this.setAllOperations(false, recalculateQuantity);
		if (recalculateQuantity) await this.setmachineData();
		this.isBusy = false;

		/** */
		const data: any = {};
		data.start_date = this.start;
		data.end_date = this.end;
		data.isBusy = true;
		data.machines = this.machines;
		data.zoom = (this.schedulerPro.viewPreset as any).data.id;
		if (resetTimeSpan && recalculateQuantity) this.dataFilterEmmiter.emit(data);
		/** */
	}

	setTimeSpan() {
		if (this.start && this.end) {
			this.schedulerPro.timeAxis.setTimeSpan(
				moment.utc(this.start).local().toDate(),
				moment.utc(this.end).add(1, "days").local().toDate()
			);
		}
	}

	getMachineFilterCondition(machine: any) {
		if (this.selectMachineGroups.length == 0) {
			return true;
		}

		return this.selectedHalls.includes(machine.hall_id);
	}

	onReset() {
		this.selectProdOrderIds = [];
		this.valueForProdOrder = "";
		this.selectItemIds = [];
		this.selectedMachineIds = [];
		this.selectMachineGroups = [];
		(document.getElementById("prodOrderInput") as Input).value = "";
		(document.getElementById("itemInput") as Input).value = "";

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
				if (this.hallRef.elementRef.nativeElement.children.length > 0) {
					this.hallRef.elementRef.nativeElement.children[0].selected = true;
				}
			});
		}

		this.machineGroupRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
		this.machineRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
		this.onGo();
	}

	async onSave() {
		this.isBusy = true;

		await this.calculateEnd();

		const payload = {
			plan_machine_id: this.orderDetailsDialog.selectedOperation.machine?.id,
			machine_id: this.orderDetailsDialog.selectedOperation.machine?.id,
			status: this.orderDetailsDialog.selectedOperation.status,
			status_plan: this.orderDetailsDialog.selectedOperation.status,
			te: this.orderDetailsDialog.selectedOperation.te.toString().replace(/,/g, "."),
			plan_te: this.orderDetailsDialog.selectedOperation.te.toString().replace(/,/g, "."),
			tool_id: this.orderDetailsDialog.selectedOperation.tool?.id,
			tool_reference_nr: this.orderDetailsDialog.selectedOperation.tool_reference_nr,
			start: moment(this.orderDetailsDialog.operationStart, "DD.MM.YYYY, HH:mm")
				.local()
				.toISOString(),
			plan_start: moment(this.orderDetailsDialog.operationStart, "DD.MM.YYYY, HH:mm")
				.local()
				.toISOString(),
			end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			plan_end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			is_changed: true,
			cavity: this.orderDetailsDialog.selectedOperation.cavity,
			plan_cavity: this.orderDetailsDialog.selectedOperation.cavity,
			tr: this.orderDetailsDialog.selectedOperation.tr,
			plan_tr: this.orderDetailsDialog.selectedOperation.tr,
			teardown_time: this.orderDetailsDialog.selectedOperation.teardown_time,
			plan_teardown_time: this.orderDetailsDialog.selectedOperation.teardown_time,
			operation_code: this.orderDetailsDialog.selectedOperation.operation_code,
			operation_code_plan: this.orderDetailsDialog.selectedOperation.operation_code,
			component_availability:
				this.orderDetailsDialog.selectedOperation.component_availability,
			plan_component_availability:
				this.orderDetailsDialog.selectedOperation.component_availability,
			constraint_type: this.orderDetailsDialog.selectedOperation.constraint_type,
		};

		if (this.isToolChanged && this.orderDetailsDialog.selectedOperation.tool?.id) {
			this.commonService
				.get(`Items/${this.orderDetailsDialog.selectedOperation.tool?.id}`)
				.subscribe({
					next: (item: any) => {
						const customId: string = item!.custom_id!;
						this.commonService
							.get(`Tools?$filter=custom_id eq '${customId}'`)
							.subscribe({
								next: (data: any) => {
									payload.tool_id = data.value[0].id;
									this.saveOperation(payload);
								},
							});
					},
				});
		} else {
			this.saveOperation(payload);
		}
		this.setToolProductionDate();
	}

	setConstraint(operationId: number) {
		return new Promise<void>(resolve => {
			const data = {};
			this.commonService.post(`update-constraint/${operationId}`, data, false).subscribe({
				next: () => {
					resolve();
				},
				error: () => {
					resolve();
				},
			});
		});
	}

	setToolProductionDate() {
		if (!this.orderDetailsDialog.selectedOperation.tool_id) return;
		this.commonService
			.get(`Tools/${this.orderDetailsDialog.selectedOperation.tool_id}`)
			.subscribe({
				next: (v: any) => {
					const custom_id = v.custom_id;

					this.commonService.get(`Items?$filter=custom_id eq '${custom_id}'`).subscribe({
						next: (item: any) => {
							if (item.value.length) {
								const data = {
									start_date: moment(
										this.orderDetailsDialog.operationStart,
										"DD.MM.YYYY, HH:mm"
									)
										.local()
										.toISOString(),
								};
								this.commonService
									.post(
										`items/${item.value[0].id}/tool-repair-production-date`,
										data,
										false
									)
									.subscribe({
										next: (item: any) => { },
									});
							}
						},
					});
				},
			});
	}

	saveOperation(payload: any) {
		this.commonService
			.patch(
				`ProdOrderPosOperations/${this.orderDetailsDialog.selectedOperation.id}`,
				payload
			)
			.subscribe({
				next: (res: any) => {
					const p = {
						quantity: this.orderDetailsDialog.selectedOperation.prodOrderPos?.quantity,
					};
					this.commonService
						.patch(
							`ProdOrderPos/${this.orderDetailsDialog.selectedOperation.prodOrderPos!.id}`,
							p
						)
						.subscribe({
							next: (res: any) => {
								this.isDialogOpen = false;
								this.operations = [];
								this.plannedOperations = [];

								this.setConstraint(
									this.orderDetailsDialog.selectedOperation.prodOrderPos!.id
								).then(() => {
									this.setAllOperations().then(() => {
										this.isBusy = false;
									});
								});
								if (this.clientName == "volaplast") {
									this.exportOperationCall(
										this.orderDetailsDialog.selectedOperation.id
									);
								}
							},
						});
				},
			});
	}

	exportOperationCall(id: any) {
		const config = {
			responseType: "text",
			observe: "response",
		};
		return new Promise<void>(resolve => {
			this.commonService.post(`operations/${id}/plan/0`, {}, false, config).subscribe({
				next: () => {
					resolve();
				},
			});
		});
	}
	onPlanOperation() {
		this.isPlanOrderExportDialogOpen = true;
	}

	onExportPlanOrder() {
		this.isExportBusy = true;
		const config = {
			responseType: "text",
			observe: "response",
		};
		this.commonService
			.post(
				`operations/${this.orderDetailsDialog.selectedOperation.id}/plan/1`,
				[],
				false,
				config
			)
			.subscribe({
				next: (res: any) => {
					this.commonService
						.get(
							`ProdOrderPosOperations/${this.orderDetailsDialog.selectedOperation.id}?expand=prodOrderPos($expand=item,prodOrder),tool,machine,machineGroup,prodOrderPosOperationAltMachines($expand=machine),prodOrderPosOperationResources($expand=item)`
						)
						.subscribe(data => {
							this.orderDetailsDialog.isOperationReadyRealease = false;
							this.isPlanOrderExportDialogOpen = false;
							this.orderDetailsDialog.isSaveButton = false;
							if (res.status == 200) {
								this.toastMessage = $localize`Data is exported successfully`;
							} else {
								this.toastMessage = $localize`Data is not exported`;
							}
							const index = this.operations.findIndex(
								o => o.id == this.orderDetailsDialog.selectedOperation.id
							);
							this.orderDetailsDialog.selectedOperation =
								new ProdOrderPosOperation().deserialize(data);
							this.operations[index] = new ProdOrderPosOperation().deserialize(data);
							if (this.orderDetailsDialog.selectedOperation?.start) {
								this.orderDetailsDialog.operationStart = moment
									.utc(this.orderDetailsDialog.selectedOperation?.start)
									.local()
									.format("DD.MM.YYYY, HH:mm");
							}

							if (this.orderDetailsDialog.selectedOperation?.end)
								this.operationEnd = moment
									.utc(this.orderDetailsDialog.selectedOperation?.end)
									.local()
									.format("DD.MM.YYYY, HH:mm");
							this.toast!.open = true;
							this.isExportBusy = false;
							this.operations = [];
							this.plannedOperations = [];
							this.setAllOperations();
						});
				},
				error: (err: any) => {
					this.isPlanOrderExportDialogOpen = false;
					this.toastMessage = $localize`Data is not exported`;
					this.toast!.open = true;
					this.isExportBusy = false;
				},
			});
	}

	closeExportOrder() {
		this.isPlanOrderExportDialogOpen = false;
	}

	onChangeStartDate() {
		if (this.orderDetailsDialog.operationStart) {
			this.orderDetailsDialog.selectedOperation.start = this.parsetUTCdateTime(
				this.orderDetailsDialog.operationStart ?? ""
			);
			this.calculateEnd$.next("");
		}
	}

	parsetUTCdateTime(date: string) {
		const momentDate = moment(date, "DD.MM.YYYY, HH:mm");
		return momentDate.format("YYYY-MM-DDTHH:mm:ssZ");
	}

	onToolInputChange(event: any) {
		if (this.orderDetailsDialog.selectedOperation)
			this.orderDetailsDialog.selectedOperation.tool = new Tools().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	setPlannedData() {
		this.plannedOperations = this.operations.map(operation => {
			return {
				id: operation.id,
				name: this.getName(operation),
				startDate:
					moment.utc(operation.start) < moment.utc(operation.end)
						? moment.utc(operation.start).toISOString()
						: moment.utc(operation.end).toISOString(),
				endDate:
					moment.utc(operation.start) < moment.utc(operation.end)
						? moment.utc(operation.end).toISOString()
						: moment.utc(operation.start).toISOString(),
				eventColor: this.getColor(operation),
				draggable: this.isDraggable(operation),
				resizable: false,
				status: operation.status,
			};
		});
	}

	getName(operation: any) {
		switch (environment.clientName) {
			case "ict":
				return `${operation.prodOrderPos?.item?.custom_id} ${operation.prodOrderPos?.item?.name}`;
			case "volaplast":
				return `${operation.prodOrderPos?.prodOrder?.custom_id} | ${operation.prodOrderPos?.item?.custom_id} ${operation.prodOrderPos?.item?.name}`;
			case "shopfloor":
				return `${operation.prodOrderPos?.prodOrder?.assembly} | ${operation.prodOrderPos?.prodOrder?.custom_id} ${operation.prodOrderPos?.item?.name}`;
			default:
				return `${operation.prodOrderPos?.prodOrder?.custom_id} | ${operation.prodOrderPos?.item?.custom_id} ${operation.prodOrderPos?.item?.name}`;
		}
	}

	getColor(operation: any) {
		const colorFromScheme = (label: string) => {
			const match = this.colorSchemeList.find((elm: any) => elm.value_string === label);
			return match ? `#${match.color}` : null;
		};

		const defaultStatusToLabel: any = {
			[ProdOrderPosOperationStatus.IN_PRODUCTION]: "In Production",
			[ProdOrderPosOperationStatus.IN_SETUP]: "In Setup",
			[ProdOrderPosOperationStatus.PROPOSED]: "Proposed",
			[ProdOrderPosOperationStatus.TERMINATED]: "Released",
			[ProdOrderPosOperationStatus.SUSPENDED]: "Suspended",
			[ProdOrderPosOperationStatus.PLANNED]: "Planned"
		};

		switch (environment.clientName) {
			case "ict":
				if (operation.status === ProdOrderPosOperationStatus.IN_PRODUCTION)
					return colorFromScheme("In Production") || "light-green";
				else if (operation.status === ProdOrderPosOperationStatus.IN_SETUP)
					return colorFromScheme("In Setup") || "orange";
				else if (operation.has_components_prepared)
					return colorFromScheme("Components prepared") || "teal";
				else if (operation.has_labels_prepared)
					return colorFromScheme("Printed") || "deep-orange";
				else if (operation.component_availability === "FULL")
					return colorFromScheme("Components available") || "blue";
				else return colorFromScheme("Others") || "gray";
			case "shopfloor":
				const colorFromPos = (position: number) => {
					const match = this.colorSchemeList.find((elm: any) => elm.model_column === position);
					return match ? match.color : null;
				};
				const posColorMap: Record<number, string> = {
					10: colorFromPos(10) || "red",
					30: colorFromPos(30) || "green",
					31: colorFromPos(31) || "green",
					50: colorFromPos(50) || "blue",
					60: colorFromPos(60) || "amber"
				};
				return posColorMap[parseInt(operation.pos)] || (colorFromScheme("Running Task") || "black");
			default:
				if (colorFromScheme(defaultStatusToLabel[operation.status])) {
					return colorFromScheme(defaultStatusToLabel[operation.status]);
				} else {
					
					switch (operation.status) {
						case ProdOrderPosOperationStatus.IN_PRODUCTION:
							return "green";
						case ProdOrderPosOperationStatus.IN_SETUP:
							return "orange";
						case ProdOrderPosOperationStatus.PROPOSED:
							return "gray";
						case ProdOrderPosOperationStatus.TERMINATED:
							return "deep-orange";
						case ProdOrderPosOperationStatus.SUSPENDED:
							return "yellow";
						default:
							return "blue";
					}

				}
		}
	}

	isDraggable(operation: any) {
		if (!this.isGanttEditable()) return false;
		if (operation.status == ProdOrderPosOperationStatus.TERMINATED) return true;

		if (operation.status == ProdOrderPosOperationStatus.IN_PRODUCTION) return false;

		if (environment?.isPlanVisuGanttRestrictionRemove) return true;

		return false;
	}

	setOpertions(clearData = false, recalculateQuantity = true) {
		return new Promise<void>((resolve, reject) => {
			const itemValue = (document.getElementById("itemInput") as Input).value;
			const prodOrderValue = (document.getElementById("prodOrderInput") as Input).value;

			if (this.isCustomer) {
				const customerValue = (document.getElementById("customerInput") as Input).value;
				if (customerValue.length) {
					const customer = customerValue.split(",");
					this.selectCustomerIds = this.selectCustomerIds.concat(customer);
				}
			}

			if (prodOrderValue.length) {
				const prodOrder = prodOrderValue.split(",");
				this.selectProdOrderIds = this.selectProdOrderIds.concat(prodOrder);
			}

			const payload = {
				prodOrders: this.selectProdOrderIds,
				items: this.selectItemIds,
				halls: this.selectedHalls.length > 0 ? this.selectedHalls : undefined,
				customers: this.selectCustomerIds,
				machineIds: this.selectedMachineIds.length ? this.selectedMachineIds : undefined
			};

			this.commonService
				.post(
					`planned-operation?start=${this.start}&end=${this.end}&isShowProposedData=${this.isShowProposedData}`,
					payload,
					false
				)
				.subscribe({
					next: async (data: any) => {
						if (clearData) {
							this.operations = [];
							this.plannedOperations = [];
							this.assignments = [];
						}
						this.operations = data.map((d: any) => {
							const operation: any = new ProdOrderPosOperation().deserialize(d);
							const currentLanguage = localStorage.getItem("CurrentLanguage") || "en";
							if (currentLanguage != "en") {
								operation.te = (operation.te ?? 0).toString().replace(/\./g, ",");
							}
							return operation;
						});

						await this.setProducedQuantityForAllOperations(recalculateQuantity);

						resolve();
					},
				});
		});
	}

	setBryntumData() {
		this.setPlannedData();
		this.setAssignments();
		this.setDependencies$.next(undefined);
	}

	setProducedQuantityForAllOperations(recalculateQuantity = true) {
		return new Promise<void>((resolve, error) => {
			const operations = this.operations
				.filter(op => op.status == ProdOrderPosOperationStatus.IN_PRODUCTION)
				.map(op => op.id)
				.join();
			if (
				(environment.clientName == "volaplast" || environment.clientName == "ict") &&
				recalculateQuantity
			) {
				if(!operations.length) {
					this.setBryntumData();
					resolve();
				}
				this.commonService.get(`quantity/v10/${operations}`, false).subscribe({
					next: (data: any) => {
						this.cachedQuantities = data;
						if(data.length) {
							data.forEach((element: any) => {
								const foundOpIndex = this.operations.findIndex(op => op.id == element.id);
	 
								if(foundOpIndex != -1) {
									this.operations[foundOpIndex].produced_quantity =
									element.quantity;
								}
							});
						}

						this.setBryntumData();
						resolve();
					},
					error: () => {
						this.setBryntumData();
						resolve();
					},
				});
			} else if (environment.clientName == "volaplast" || environment.clientName == "ict") {
				const data = this.cachedQuantities;
				if(data.length) {
					data.forEach((element: any) => {
						const foundOpIndex = this.operations.findIndex(op => op.id == element.id);

						if(foundOpIndex != -1) {
							this.operations[foundOpIndex].produced_quantity =
							element.quantity;
						}
					});
				}

				this.setBryntumData();
				resolve();
			} else {
				this.setBryntumData();
				resolve();
			}
		});
	}

	isGanttEditable() {
		return this.authService.isPermissionValid(PermissionEnum.PLANVISU_GANTT_CHART_PAGE_EDIT);
	}

	setDependencies(operationPosId: any = undefined) {
		const dependecies: any = [];

		if (this.isOnGoWithOperationSelected || operationPosId) {
			this.operations.forEach((operation: any) => {
				const prodOrderPosId = operation.prodOrderPos?.id;
				let operations;
				if (operationPosId && !this.isOnGoWithOperationSelected) {
					operations = this.operations.filter(
						op => op.prod_order_pos_id == operationPosId
					);
				} else {
					operations = this.operations;
				}
				const dependency = operations
					.filter((op: any) => op.id != operation.id)
					.sort((a: any, b: any) => {
						if (this.clientName == "ict") {
							const aArray = a.pos.split("_");
							const bArray = b.pos.split("_");

							return bArray[bArray.length - 1] - aArray[aArray.length - 1];
						}
						return b.pos.localeCompare(a.pos);
					})
					.find((op: any) => {
						if (this.clientName == "ict") {
							const aArray = operation.pos.split("_");
							const bArray = op.pos.split("_");

							return (
								op.prodOrderPos.id == prodOrderPosId &&
								bArray[bArray.length - 1] < aArray[aArray.length - 1]
							);
						}
						return (
							op.prodOrderPos.id == prodOrderPosId &&
							op.pos.localeCompare(operation.pos) == -1
						);
					});

				if (dependency?.id) {
					dependecies.push({
						from: dependency.id,
						to: operation.id,
						type: "FinishToStart",
					});
				}
			});
		}

		this.schedulerPro.dependencies = dependecies;
		this.schedulerPro.dependencyStore.commit();
	}

	onSplit() { }

	onGridScroll(event: any) { }

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

					this.machineGroups = response.responses[1].body.value.map(
						(data: MachineGroup) => new MachineGroup().deserialize(data)
					);
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
					resolve(true);
				},
				error: e => { },
			});
		});
	}

	changeTE(value: any) {
		this.orderDetailsDialog.selectedOperation.te = value;
		this.calculateEnd$.next("");
	}

	calculateEnd(isRecalculateOperation = false) {
		this.isEndBusy = true;
		const quantity = isRecalculateOperation
			? (this.orderDetailsDialog.selectedOperation.prodOrderPos!.quantity ?? 0) -
			(this.orderDetailsDialog.selectedOperation.produced_quantity ?? 0)
			: (this.orderDetailsDialog.selectedOperation.prodOrderPos!.quantity ?? 0);
		const te: number = (this.orderDetailsDialog.selectedOperation.te ?? 0)
			.toString()
			.replace(/,/g, ".");
		const tr: number = isRecalculateOperation
			? 0
			: (this.orderDetailsDialog.selectedOperation.tr ?? 0);
		const start = isRecalculateOperation
			? moment().toISOString()
			: moment.utc(this.orderDetailsDialog.selectedOperation.start).toISOString();
		const cavity = this.orderDetailsDialog.selectedOperation.cavity ?? 1;

		const usageFactor = this.orderDetailsDialog.selectedOperation.machine.usage_factor;
		const teardown = this.orderDetailsDialog.selectedOperation.teardown_time;
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
					`capacity-plan/machine/${this.orderDetailsDialog.selectedOperation.machine?.id}?start=${start} & duration=${duration}`,
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
		let usageValue = usageFactor ? parseFloat(usageFactor.toString().split("%")[0]) : 1;
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

	eventRenderer({ eventRecord, renderData }: any) {
		const operation = this.operations.find(op => op.id == eventRecord.id);
		if (this.clientName == 'shopfloor' && operation) {
			const controlPlanId = operation.prodOrderPos.item.custom_id;
			const machineId = operation.machine.custom_id;

			const isTaskRunning = this.currentTasks.find((task: any) => task.control_id == controlPlanId && task.user_id == machineId);
			if (isTaskRunning) {
				let borderColor: string = '#FF5C00';
				if (this.colorSchemeList) {
					const item: any = this.colorSchemeList.find((item: any) => item.value_string === 'Running Task');
					borderColor = item && item.has_border ? item.border_color : '#FF5C00';
				}
				renderData.style += `border:2px solid #${borderColor};`;
			}
		} else if (operation) {
			if (
				operation.restrictions?.due_date_restriction?.status ||
				operation.restrictions?.overlapping_restriction?.status ||
				operation.restrictions?.tool_restriction?.status ||
				operation?.restrictions?.tool_status?.status ==
				ToolRepairStatus.NOT_READY_FOR_USE ||
				operation?.restrictions?.tool_status?.sampling_required
			) {
				const restrictionItem: any = this.colorSchemeList.find((item: any) => item.value_string === 'Restrictions');
				const borderColor = restrictionItem && restrictionItem.has_border ? restrictionItem.border_color : 'red';
				renderData.style += `border:2px solid #${borderColor};`;
			}
		}

		if (eventRecord.eventColor == "green" || eventRecord.eventColor == "light-green" || eventRecord.eventColor == "#b5deb7") {
			if (operation) {
				const quantity = operation.prodOrderPos.quantity;
				const producedQuantity = operation.produced_quantity ?? 0;
				let producedPercentage = Math.round((producedQuantity / quantity) * 100);
				let totalPercentage = 100 - producedPercentage;
				// producedPercentage = 10;
				// totalPercentage = 90;
				if (totalPercentage != 100) {
					renderData.style += `background: linear-gradient(to right,darkgreen 0%, darkgreen ${producedPercentage}%,  #b7e0b9 ${producedPercentage}%, #b7e0b9 100%);`;
				}
			}
		}

		return {
			class: "b-event-name",
			text: eventRecord.name,
		};
	}

	onEventMouseEnter(event: any) {
		if(this.isAnyOperationSelectedFromHideOrUnHideOperation()) {
			return;
		}
		const op = this.operations.find((op: any) => op.id == event.eventRecord.id);
		const posId = op && op.prod_order_pos_id ? op.prod_order_pos_id : undefined;
		this.setDependencies$.next(posId);
	}

	onEventMouseLeave() {
		if(this.isAnyOperationSelectedFromHideOrUnHideOperation()) {
			return;
		}
		this.setDependencies$.next(undefined);
	}

	isAnyOperationSelectedFromHideOrUnHideOperation() {
		if(this.lastDependencyPosId) {
			return true;
		} else {
			return false;
		}
	}

	isRestricted(eventId: any) { }

	async recalculateOperation() {
		// const start = moment().toISOString();
		await this.calculateEnd(true);
		const payload = {
			start: moment().toISOString(),
			plan_start: moment().toISOString(),
			end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			plan_end: moment(this.operationEnd, "DD.MM.YYYY, HH:mm").local().toISOString(),
			is_changed: true,
		};

		this.commonService
			.patch(
				`ProdOrderPosOperations/${this.orderDetailsDialog.selectedOperation.id}`,
				payload
			)
			.subscribe({
				next: () => {
					this.isDialogOpen = false;
					this.operations = [];
					this.plannedOperations = [];

					this.setConstraint(
						this.orderDetailsDialog.selectedOperation.prodOrderPos!.id
					).then(() => {
						this.setAllOperations().then(() => {
							this.isBusy = false;
						});
					});
				},
			});
	}

	isOnGoWithOperationSelectedSet() {
		if (this.isOrderSelected()) {
			this.isOnGoWithOperationSelected = true;
		} else {
			this.isOnGoWithOperationSelected = false;
		}
	}
}

const schedulerPro = (widget: Widget): SchedulerPro => widget.up(SchedulerPro.type);

export const projectProps: BryntumSchedulerProProjectModelProps = {
	autoLoad: true,
	resourceStore: {
		modelClass: Resource,
		sorters: [],
	},
	eventStore: {
		// Unassigned events should remain in store
		removeUnassignedEvent: false,
		modelClass: Assignment,
		autoLoad: true,
		singleAssignment: true,
	},
	// This config enables response validation and dumping of found errors to the browser console.
	// It's meant to be used as a development stage helper only so please set it to false for production systems.
	validateResponse: true,
};
const currentDate = new Date();
const futureDate = new Date(currentDate);
futureDate.setDate(currentDate.getDate() + 1);
const oneWeek = new Date();
oneWeek.setDate(currentDate.getDate() + 15);

export const schedulerProProps: BryntumSchedulerProProps = {
	project: {
		autoLoad: true,
		transport: {
			load: {
				url: "./assets/data/data.json",
			},
		},
	},
	startDate: new Date(),
	endDate: oneWeek,
	barMargin: 10,
	eventStyle: "border",
	eventColor: "indigo",
	columns: [
		{
			type: "resourceInfo",
			field: "name",
			text: "Machines",
			width: 220,
			showEventCount: false,
			showImage: false,
		},
	],

	// Custom view preset with header configuration
	viewPreset: {
		id: "dayAndweekAndMonth1",
		columnLinesFor: 2,
		mainHeaderLevel: 2,
		tickWidth: 140,
		mainUnit: "day",
		headers: [
			{
				unit: "month",
				dateFormat: "MMMM YYYY",
				align: "center",
			},
			{
				unit: "week",
				// dateFormat: "WW",
				renderer: (startDate: any) => {
					return $localize`Week` + ` ${DateHelper.format(startDate, "WW")}`;
				},
				align: "center",
			},
			{
				unit: "day",
				dateFormat: "DD",
				align: "center",
			},
		],
		timeResolution: {
			unit: "second",
			increment: 0, // Example: 15-minute increments
		},
	},

	stripeFeature: true,
	columnLinesFeature: true,
	filterBarFeature: {
		compactMode: true,
	},
	calendarHighlightFeature: {
		calendar: "resource",
		// This method is provided to determine which resources are available for one or more eventRecords,
		// in order to highlight the right availability intervals
		collectAvailableResources({ scheduler, eventRecords }) {
			const appointment = eventRecords[0] as Assignment;
			return scheduler.resourceStore.query((doctor: Resource) => true) as ResourceModel[];
		},
	},
	// Configure event menu items with correct phrases (could also be done through localization)
	eventDragFeature: {
		validatorFn({ eventRecords, newResource, startDate, endDate }) {
			const task = eventRecords[0] as Assignment,
				doctor = newResource as Resource,
				{ calendar } = doctor,
				valid = !calendar || (calendar as CalendarModel).isWorkingTime(startDate, endDate),
				message = valid ? "" : "No available slot";

			return {
				valid,
				message:
					(valid ? "" : '<i class="b-icon b-fa-exclamation-triangle"></i>') + message,
			};
		},
	},
	tbar: [
		{
			type: "buttongroup",
			items: [
				// {
				// 	type: "button",
				// 	icon: "b-icon b-fa-chevron-left",
				// 	cls: "b-transparent",
				// 	onClick: ({ source }: any) => schedulerPro(source).shiftPrevious(),
				// },
				// {
				// 	type: "button",
				// 	text: "Today",
				// 	cls: "b-transparent",
				// 	onClick({ source }: any) {
				// 		const scheduler = schedulerPro(source);
				// 		const startDate = DateHelper.clearTime(new Date());
				// 		scheduler.setTimeSpan(
				// 			DateHelper.add(startDate, 0, "h"),
				// 			DateHelper.add(startDate, 24, "h")
				// 		);
				// 	},
				// },
				// {
				// 	type: "button",
				// 	icon: "b-icon b-fa-chevron-right",
				// 	cls: "b-transparent",
				// 	onClick: ({ source }: any) => schedulerPro(source).shiftNext(),
				// },
			],
		},
	],
};

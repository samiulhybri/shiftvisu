import { Component, ViewChild, ViewEncapsulation, } from "@angular/core";
import { Hall } from "@app/shared/models/hall.model";
import { BryntumSchedulerProComponent, BryntumSchedulerProProjectModelComponent, BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from "@bryntum/schedulerpro-angular-thin";
import moment, { Moment } from "moment";
import { Resource } from "@app/modules/planvisu/user-scheduler/lib/Resource";
import { Assignment } from "@app/modules/planvisu/user-scheduler/lib/Assignments";
import { CalendarModel, CalendarModelConfig, ProjectModel, ResourceModel, SchedulerPro, DependenciesConfig, ChangeLogTransactionModel } from "@bryntum/schedulerpro-thin";
import { DateHelper, StringHelper, Widget, Popup } from "@bryntum/core-thin";
import { BryntumGridComponent, BryntumGridProps } from "@bryntum/grid-angular-thin";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { environment } from "@app/environments/environment";
import { Column, Grid } from "@bryntum/grid-thin";
import { DragGantt } from "@app/modules/planvisu/user-scheduler/lib/DragGantt";
import presets from "@app/modules/planvisu/gantt/lib/Presets";
import { debounceTime, lastValueFrom, Subject, Subscriber } from "rxjs";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { Capacity } from "@app/shared/models/capacity.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { PlanVisuService } from "../services/plan-visu.service";

@Component({
	selector: "app-user-scheduler",
	templateUrl: "./user-scheduler.component.html",
	styleUrl: "./user-scheduler.component.scss",
	encapsulation: ViewEncapsulation.None,
})
export class UserSchedulerComponent {
	halls: Hall[] = [];
	machines: Machine[] = [];
	users: any[] = [];
	selectedHalls: number[] = [];
	machineUserPlanTimes: any[] = [];
	momentInstance = moment;
	start = moment().subtract(0, "days").toISOString();
	end = moment().add(2, "months").toISOString();
	isBusy = false;
	isLoading = false;
	events = [];
	drag?: any;
	isEverythingLoaded = true;
	grid!: Grid;
	presets = presets
	schedulerPro!: SchedulerPro;
	private project!: ProjectModel;
	getPrest!: string;
	deletemachineUserPlanTime: any = [];
	selectCapacity!: Capacity;
	selectStartTime!: string;
	selectEntTime!: string;
	message!: string;
	selectCapacityMachine!: Machine;
	calendarData = {
		id: "workweek",
		name: "Work week",
		intervals: [
			{
				recurrentStartDate: "on Sat",
				recurrentEndDate: "on Mon",
				isWorking: false,
			},
		],
	}
	dependenciesFeatures: DependenciesConfig = {
		allowCreate: false,
		highlightDependenciesOnEventHover: false,
	};
	unPlannedUserSearch?: string
	calendars: CalendarModelConfig[] = [this.calendarData];
	@ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
	@ViewChild(BryntumGridComponent) gridComponent!: BryntumGridComponent;
	@ViewChild(BryntumSchedulerProProjectModelComponent)

	projectComponent!: BryntumSchedulerProProjectModelComponent;
	@ViewChild("hallRef") hallRef: any;
	constructor(public commonService: CommonService,
		private _toastService: ToastService,
		private planvisuService: PlanVisuService,
	) {
	}

	saveChanges$ = new Subject();
	searchUser$ = new Subject();
	eventMenuFeature = {
		items: {
			splitTime: {
				text: `Split time`,
				onItem: ({ resourceRecord, eventRecord }: any) => {
					this.isLoading = true;
					this.openModal('timeSplitModal');
					this.getUserMachinePlanTime(eventRecord.capacity_id);
				},
			},
			deleteTime: {
				text: `Delete row`,
				onItem: ({ resourceRecord, eventRecord }: any) => {
					this.isLoading = true;
					this.deleteTimePlan(eventRecord.machine_user_plan_time_id);
				},
			},

			editEvent: false,
			copyEvent: false,
			cutEvent: false,
			splitEvent: false,
			deleteEvent: false,
		},
	};

	projectProps: BryntumSchedulerProProjectModelProps = {
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
	}

	schedulerProProps: BryntumSchedulerProProps = {
		project: {
			autoLoad: true,
			transport: {
				load: {
					url: "./assets/data/data.json",
				},
			},
		},
		startDate: new Date(),
		endDate: this.getOneWeekLaterDate(),
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
				type: "button",
				icon: "b-fa b-fa-columns",
				tooltip: "Toggle layout",
				ref: "toggle-layout", // for testing purpose
				cls: "b-transparent",
				toggleable: true,
				style: "margin-left: auto",
				onToggle: ({ source }: any) => {
					const dd = document.getElementById("unplannedgrid") as HTMLDivElement;
					dd.classList.toggle("hidden");
				},
			}
		],

	};

	gridProps: BryntumGridProps = {
		selectionMode: {
			cell: false,
		},

		stripeFeature: true,
		sortFeature: "name",
		groupFeature: {
			field: 'name',
			renderer({ groupRowFor, column }: {
				groupRowFor: string
				column: Column
			}) {
				if (column.parentIndex === 0) {
					return `Tasks for ${groupRowFor}`;
				}

				return '';
			}
		},
		columns: [
			{
				type: "template",
				text: "Name",
				flex: 1,
				width: 200,
				cellCls: "unscheduledNameCell",

				template: ({ record }) => {
					const appointment = record as Assignment;
					const truncateText = (text: string, wordLimit: number): string => {
						const words = text.split(''); // Split text into words
						return words.length > wordLimit
							? words.slice(0, wordLimit).join('') + '...'
							: text;
					};
					return StringHelper.xss`
	
							<div class="name-container">
								<span>${StringHelper.encodeHtml(truncateText(appointment.name, 16))}</span>
							</div>
						`;
				},
			},
			{
				type: "column",
				text: $localize`Date`,
				width: 100,
				align: "right",
				renderer: ({ record }: any) => {
					return moment.utc(`${record.date}`).format('ll');
				},
			},
			{
				type: "column",
				text: $localize`Shifts`,
				width: 100,
				align: "right",
				renderer: ({ record }: any) => {
					const startTime = moment.utc(`${record.date} ${record.capacity_start_time}`)?.local()?.format("HH:mm") || null;
					const endTime = moment.utc(`${record.date} ${record.capacity_end_time}`)?.local()?.format("HH:mm") || null;
					return `${startTime} - ${endTime}`;
				},
			},
		],
		tbar: [

			{
				type: 'textfield',
				ref: 'filterByName',
				placeholder: $localize`Filter Unplanned Users`,
				clearable: true,
				keyStrokeChangeDelay: 500,
				triggers: {
					filter: {
						align: 'center',
						cls: ''
					}
				},
				onChange: (data: any) => {
					this.isEverythingLoaded = false;
					this.unPlannedUserSearch = data.value || null;
					this.searchUser$.next(1)
				}

			},
		],
		showDirty: true,
		rowHeight: 65,
		disableGridRowModelWarning: true,
	}
	ngOnInit() {
		this.updateSavechanges();
		this.checkProjectOn();
		this.updateSchedulerProEvents();
	}
    checkProjectOn(){
		this.projectOn$.pipe(debounceTime(500)).subscribe(next=>{
			if(!this.isBusy && !this.saveChangesCall){
				this.setCapacity();
				this.setUserData();
			}
		})
	}
	ngAfterViewInit() {
		this.grid = this.gridComponent.instance;
		this.schedulerPro = this.schedulerProComponent.instance;
		this.project = this.projectComponent.instance;

		this.setAllStores();

		this.setAllData().then(() => {
			this.drag = new DragGantt(
				{
					grid: this.grid,
					schedule: this.schedulerPro,
					constrain: false,
					outerElement: this.grid.element,
				},
				this.planvisuService
			);

			document
				.querySelectorAll(".b-grid-body-container")[1]!
				.addEventListener("scroll", e => {
					const a: any = e.currentTarget;

					// use greater than or equal to be sure.
					if (Math.ceil(a.scrollTop) + a.clientHeight + 50 >= a.scrollHeight) {

					}
				});
		})
		this.timeAxisChange$.pipe(debounceTime(500)).subscribe(event => {
			if(event?.config?.viewPreset) this.dateChange(event);
		});
		this.project.calendars = this.calendars;
		this.onScroll();
	}
	/**
	 * add horijontal scroll event 
	 * if any of componet hotijontal event accur then it iffect direclty of other
	 */
	onScroll() {
		const elements = document.querySelectorAll('.b-virtual-scroller.b-widget-scroller.b-resize-monitored');
		if (elements.length >= 2) {
			const firstElement = elements[1];
			const secondElement = elements[3];
			firstElement.addEventListener('scroll', (event: any) => {
				const scrollLeftPosition = event.target.scrollLeft;
				secondElement.scrollLeft = scrollLeftPosition;
			});
			secondElement.addEventListener('scroll', (event: any) => {
				const scrollLeftPosition = event.target.scrollLeft;
				firstElement.scrollLeft = scrollLeftPosition;
			});
		}

	}

	capacity: any = [];;
	async getCalendarData() {
		const machineIds:number[] = [];
		this.machines.forEach((machine:any)=> machineIds.push(machine.id));
		const payload: any = {};
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		payload.start_date = moment(this.start).format('YYYY-MM-DD');
		payload.end_date = moment(this.end).format('YYYY-MM-DD');
		payload.hallIds = JSON.parse(localStorage.getItem("Hall") || "[]");
		payload.timezone = timezone ?? 'UTC';
		payload.machineIds = machineIds;
		const capacity:any = await lastValueFrom(this.commonService.post('plan_visu/user-scheduler/calendar', payload, false))
		this.capacity = capacity.calendars
		this.planvisuService.machineCapacities = capacity.machineCapacities
		this.setCalendar();
	}
    setCalendar(){
		this.calendars = [
			this.calendarData,
			...this.capacity
		];
		this.project.calendars = this.calendars;
		this.project.calendar = "workweek";
		this.setCapacity()
	}
	setCapacity() {
		setTimeout(() => {
			const availableResources = this.schedulerPro.resourceStore.query((doctor: any) => true) as any[];
			const { calendarHighlight } = this.schedulerPro.features;
			calendarHighlight ? calendarHighlight?.highlightResourceCalendars(availableResources) : ''
		}, 100)
	}
	async dateChange(event: any) {
		console.log((this.schedulerPro.viewPreset as any).data.id);
		this.getPrest = (this.schedulerPro.viewPreset as any).data.id;
	}

	selectHall(event: any) {
		this.selectedHalls = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
	}

	setAllStores() {
		const chainedStore = (this.grid.store = this.project.eventStore.chain(
			(eventRecord: Assignment) => !eventRecord.assignments.length,
			undefined,
			{
				groupers: [

				],
			}
		));
		this.project.assignmentStore.on({
			change: (event:any) => {
				if (!this.isEverythingLoaded) {
					this.project.assignmentStore.commit();
					return;
				}
				chainedStore.fillFromMaster();
				this.saveChanges();
			},
			thisObj: this.grid
		});

		// project's listener
		this.project.on({
			change: (event: any) => {
				const resourceId = !event.changes?.resourceId && !event.changes?.resourceId?.value;
				const planId = event.records[0]?.originalData?.machine_user_plan_time_id;
				if (resourceId && event.action == 'update' && this.users.length && !this.isBusy && !this.saveChangesCall && planId) {
					this.projectOn$.next(planId)
				}
			},
			thisObj: this.project,
		});
	}
	requests: ODataBatchCall[] = [];
    projectOn$= new Subject();
	saveChangesCall = false
	saveChanges() {
		const addArr = this.schedulerPro.assignmentStore?.changes?.added;
		const modifyArr = this.schedulerPro.assignmentStore?.changes?.modified;
		const add = (addArr?.[addArr?.length - 1] as any);
		const modify = (modifyArr?.[modifyArr?.length - 1] as any)
		const payload: any = {};
		this.setCapacity();
		const data = add ?? modify;
		if (data) {
			this.saveChangesCall = true;
			const url = add ? 'MachineUserPlanTimes' : `MachineUserPlanTimes(${data.id})`
			const method = add ? 'post' : `patch`
			payload.machine_id = data.resourceId;
			payload.capacity_id = data.event.capacity_id;
			payload.user_id = data.event.user_id;
			if (add) {
				const duration = this.getDuration(moment(`${data.event.date} ${data.event.start_time}`), moment(`${data.event.date} ${data.event.end_time}`))
				payload.start_time = `${data.event.date} ${data.event.start_time}`;
				payload.end_time = duration > 0 ?
					`${data.event.date} ${data.event.end_time}` :
					moment(`${data.event.date} ${data.event.end_time}`).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
			} else {
				payload.start_time = `${data.event.start_time}`;
				payload.end_time = `${data.event.end_time}`;
			}

			let increment = this.requests.length

			let batchData = new ODataBatchCall(
				increment,
				method,
				`\/odata\/${url}`
			)
			batchData.body = payload;
			const isResource = this.checkUserCapacityWithResource(payload);
			const machine:any = this.getMachine(payload.machine_id);
			const checkHall = machine?.hall_id == data.event.hall_id;
			if ( checkHall) {
				this.isBusy = true;
				this.requests.push(batchData)
				this.saveChanges$.next(this.requests)
			} else {
				if(!checkHall){
					this.message = 'User and Machine are not in same hall.'
					const dialog = document.getElementById('hallWarning') as Dialog;
				    dialog.open = true;
				}else{
					this.message = 'This machine does not have any capacity within the time period.'
					const dialog = document.getElementById('capacityWarning') as Dialog;
				    dialog.open = true;	
				}
				
			}

		}
	}

	getMachine(id:number){
        return this.machines.find((data:Machine)=> data.id == id);
	}

	updateSavechanges() {
		
		this.saveChanges$.pipe(debounceTime(1000)).subscribe(response => {
			this.isBusy = true;
			this.commonService.post('$batch', { requests: this.requests })

				.subscribe({
					next: async (resonse: any) => {
						this.isEverythingLoaded = false;
						this.schedulerPro.assignments = []
						this.setCalendar();
						this.setUserData()
						this.requests = [];
						this.saveChangesCall = false;
					},
					error: (error: any) => {
						this.isBusy = false;
						this.saveChangesCall = false;
					}
				})
		})

	}
	checkUserCapacityWithResource(payload: any) {
		const startDate = moment(`${payload.start_time} `, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
		const endDate = moment(`${payload.end_time} `, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
		const machine: any = this.machines.find((machine: Machine) => machine.id == payload.machine_id)
		const intervals: any = this.calendars
			.find((data: any) => machine.custom_id == data.id)
		let isValid = false;
		let startDatevalid = false;
		intervals?.intervals?.some((interval: any) => {
			const capacityStart = moment(`${interval.capacityStartDate}`, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
			let capacityEnd = moment(`${interval.capacityEndDate}`, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
			if (capacityEnd.isBefore(capacityStart)) {
				capacityEnd.add(1, 'day');
			}

			const isStartValid = startDate.isBetween(capacityStart, capacityEnd, undefined, '[]');
			const isEndValid = endDate.isBetween(capacityStart, capacityEnd, undefined, '[]');
			if (isStartValid && isEndValid) {
				isValid = true
				return true;
			}
			return 0;
		});
		return isValid;
	}

	getOneWeekLaterDate() {
		const currentDate = new Date();
		const futureDate = new Date(currentDate);
		futureDate.setDate(currentDate.getDate() + 1);
		const oneWeek = new Date();
		oneWeek.setDate(currentDate.getDate() + 15);
		return oneWeek;
	}

	changeDate(event: any) {
		const dates = event.detail.value.split(" - ");

		if (dates.length > 1) {
			this.start = moment.utc(dates[0], "DD/MM/YYYY").local().toISOString();
			this.end = moment.utc(dates[1], "DD/MM/YYYY").local().toISOString();
		}
	}

	onGo() { }
	onReset() { }
	touchStart(event: any) {
		event.preventDefault();
	}
	async setAllData() {
		this.isBusy = true;
		await this.getAllComboBoxData();
		await this.setmachineData();
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
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.halls = response.responses[0].body.value.map((data: Hall) =>
						new Hall().deserialize(data)
					);
					if (this.halls.length > 0) {
						this.selectedHalls = [this.halls![0].id as number];

						setTimeout(() => {
							this.hallRef.elementRef.nativeElement.items[0].selected = true;
						});
					}
					resolve(true);
				},
				error: e => { },
			});
		});
	}

	getHallQuery() {
		const cachedHall: number[] = JSON.parse(localStorage.getItem("Hall") || "[]");
		if (cachedHall.length) {
			return cachedHall.map(v => `hall_id eq ${v}`).join(" or ")
		}
		return this.selectedHalls.map(v => `hall_id eq ${v}`).join(" or ");
	}

	setmachineData() {
		return new Promise<void>((resolve, reject) => {
			const query = `Machines?$filter=is_active eq true ${this.selectedHalls.length > 0 ? `and ${this.getHallQuery()}` : ""} &$expand=machineGroup&$expand=sectionActivatables($filter=section%20eq%20%27PLANVISU%27%20and%20is_active%20eq%20true)&$top=1000&orderby=sort_order asc`;
			this.commonService
				.get(query)
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
								v.calendar = v.custom_id;
								v.image = false;
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

	async setUserData() {
		const payLoad: any = {};
		payLoad.start_date = moment(this.start).format('YYYY-MM-DD');
		payLoad.end_date = moment(this.end).format('YYYY-MM-DD');
		payLoad.hallIds = JSON.parse(localStorage.getItem("Hall") || "[]");;
		this.isBusy = true
		const data: any = await lastValueFrom(this.commonService
			.post(`plan_visu/user-capacity`, payLoad, false));
		this.users = data.users?.map((v: any, index: number) => {
			let startMoment;
			let endMoment;

			if (v.machine_id) {
				startMoment = moment.utc(`${v.start_time}`);
				endMoment = moment.utc(`${v.end_time}`);
			} else {
				startMoment = moment.utc(`${v.date} ${v.start_time}`);
				endMoment = moment.utc(`${v.date} ${v.end_time}`);
				const duration = this.getDuration(startMoment, endMoment);
				if (duration < 0) endMoment.add(1, 'day')
			}

			v.startDate = startMoment.toISOString()
			v.endDate = endMoment.toISOString()
			v.duration = this.getDuration(startMoment, endMoment);
			v.resizable = false;
			v.ignoreResourceCalendar = true;
			v.manuallyScheduled = true;
			v.durationUnit = "minute";
			return v;
		});
	   this.setUserAssign()
	}

	setUserAssign(){
		this.isEverythingLoaded = false;
		this.searchUser$.next(this.init)
		this.isBusy = false;
	}
    init:number = 0;
	updateSchedulerProEvents() {
		this.searchUser$.pipe(
			debounceTime(300)
		  ).subscribe((res) => {
			this.schedulerPro.assignments = [];
			this.schedulerPro.events = [];
			const searchTerm = this.unPlannedUserSearch?.toLowerCase() || null;
			let filteredUsers = this.users;
			if (searchTerm) {
			  filteredUsers = this.users?.filter((user: any) => 
				user.name.toLowerCase().includes(searchTerm) || 
				user.machine_id
			  );
			}
			this.schedulerPro.events = filteredUsers;
			this.setAssignments();
			if(res==0){
				this.searchUser$.next(1)
				this.init +=1;
			}
		  });
		  
	}

	getDuration(startDate: Moment, endDate: Moment) {
		return endDate.diff(startDate, 'minutes');
	}
	setAssignments() {
		
		this.schedulerPro.assignments  = this.users.filter((user:any) => user?.machine_id).map((d:any) => {
			this.updateCapacity(d)
			return {
				id: d.machine_user_plan_time_id,
				eventId: d.id,
				resource: d.machine_id
			}
		});
		setTimeout(()=> this.isEverythingLoaded = true, 300)
	}
	updateCapacity(user:any){
		this.capacity.some((capacity:any) => {
			let isMachcapacity = false;
			if(user.machine_id==capacity.name){
				const userStart = moment(user.startDate);
				const userEnd = moment(user.endDate);
				let intervals = false;
				let isCheckbefore = false;
				capacity.intervals.some((interval:any)=>{
					const capacityStart = moment(interval.startDate);
					const capacityEnd = moment(interval.endDate);
					
					let start = false;
					if(capacityStart.format('YYYY-MM-DD') == userStart.format('YYYY-MM-DD')){
						intervals = true;
						if (userStart.isBefore(capacityStart)) {
							interval.startDate = user.startDate;
						    const timeDif = capacityStart.diff(userStart, 'minutes');
						    capacityEnd.subtract(timeDif,'minutes');
							interval.endDate = capacityEnd.toISOString();
							start = true;
							isCheckbefore = true;
						}
					}
					return start;
				})
				if (!intervals) {
					capacity.intervals.push({
						"startDate": userStart.toISOString(),
						"endDate": userEnd.toISOString(),
						"isWorking": true
					})
				}
				isMachcapacity = true
			}
			return isMachcapacity;
		});
		this.calendars = [
			this.calendarData,
			...this.capacity
		];
		this.project.calendars = this.calendars;
		this.project.calendar = "workweek";
		this.setCapacity()
	}
	setResources() {
		this.schedulerPro.resources = this.machines;
	}

	onGridSelectionChange() {
		const
			appointments = this.grid.selectedRecords as any[],
			{ calendarHighlight } = this.schedulerPro.features,
			requiredRoles: {
				[key: string]: number
			} = {};
		appointments.forEach((appointment: any) => requiredRoles[appointment.requiredRole as string] = 1);

		if (Object.keys(requiredRoles).length === 1) {
			const
				appointment = appointments[0] as any,
				availableResources = this.schedulerPro.resourceStore.query((doctor: any) => doctor.role === appointment.requiredRole || !appointment.requiredRole) as any[];
			calendarHighlight.highlightResourceCalendars(availableResources);
		}
	}

	timeAxisChange$ = new Subject<any>();
	async getDataFilter(event: any) {
		if (event.isBusy) this.isBusy = true;
		if (event.start_date) {
			this.schedulerPro.assignments = [];
			this.schedulerPro.events = [];
			this.calendars = [];
			this.project.calendars = [];
			this.start = event.start_date;
			this.end = event.end_date;
			this.setTimeSpan();
			if (event.machines) {
				this.machines = event.machines;
				this.schedulerPro.resources = [];
				this.machines = this.machines?.map((v: any) => {
					v.role = "Resource";
					v.roleIconCls = "b-icon b-fa-user-md";
					v.calendar = v.custom_id;
					v.image = false;
					const m = new Machine().deserialize(v);
					if (environment.clientName == "ict") {
						m.name = `${m.custom_id} - ${m.name}`;
					}
					return m;
				});
				
				this.setResources();
			}
			await this.getCalendarData();
			await this.setUserData();
		}
		if (event.zoom) {
			(this.schedulerPro.viewPreset as any) = event.zoom
		}
	}
	eventDrag(event:any){
        //console.log(event)
	}
	setTimeSpan() {
		if (this.start && this.end) {
			this.schedulerPro.timeAxis.setTimeSpan(
				moment.utc(this.start).local().toDate(),
				moment.utc(this.end).add(1, "days").local().toDate()
			);
		}
	}
	ngOnDestroy(){
		this.planvisuService.machineCapacities = [];
	}

	openModal(id: string) {
		const dialog = document.getElementById(id) as Dialog;
		dialog.open = true;
	}
	closeModal(id: string, from?: string) {
		const dialog = document.getElementById(id) as Dialog;
		dialog.open = false;
		this.machineUserPlanTimes = [];
		if (from == 'capacityWarning' || from == 'hallWarning') {
			if(!this.isBusy){
				this.isEverythingLoaded = false;
				this.searchUser$.next(1)
			}
		}
	}
	deleteTimePlan(id: number) {
		this.isBusy = true;
		this.commonService.delete(`plan_visu/delete-user-plan-time/${id}`, false)
			.subscribe({
				next: async (res: any) => {
					this.isEverythingLoaded = false;
					this.schedulerPro.assignments = [];
					this.setCalendar();
					this.setUserData();
				},
				error: (e) => {
					this.isBusy = false;
				}
			})
	}
	getUserMachinePlanTime(capacityId: number) {
		this.commonService.get(`MachineUserPlanTimes?filter=capacity_id eq ${capacityId}&expand=machine(select=id,custom_id,name),capacity(select=id,start_time,end_time,date)`)
			.subscribe({
				next: (res: any) => {
					this.machineUserPlanTimes = res.value;
					this.isLoading = false,
						this.selectCapacity = res.value[0]?.capacity ?? undefined;
					let duration = this.getDuration(moment(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`), moment(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`));

					this.selectStartTime = moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`).local().format('YYYY-MM-DD HH:mm');

					this.selectEntTime = duration > 0
						? moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).local().format('YYYY-MM-DD HH:mm')
						: moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).add(1, 'day').local().format('YYYY-MM-DD HH:mm');

					this.selectCapacityMachine = res.value[0]?.machine ?? undefined;
				},
				error: (e) => {
					this.isLoading = false
				}
			})
	}
	updateSplitTime() {
		let capacity = this.getDuration(moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`), moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`));
		if (capacity < 0) {
			const end = moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).add(1, 'day');
			capacity = this.getDuration(moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`), end)
		}
		let totalCapacity = 0;
		let isReturn = false
		this.machineUserPlanTimes?.some((data: any, index: number) => {

			const isVadlidDateCheck = this.isValidDateCheck(data)
			if (!isVadlidDateCheck) {
				this._toastService.showToast($localize`Selected time must be within allowed range`, "error");
				isReturn = true;
				return 1;
			}
			if (index > 0 && this.isConflictCheck(data, index)) {
				isReturn = true;
				return 1;
			}
			const duration = this.getDuration(moment(data.start_time), moment(data.end_time));
			if (duration < 0) {
				this._toastService.showToast($localize`End date can't greatter than start date `, "error");
				isReturn = true
				return 1;
			}
			if (duration == 0) {
				this._toastService.showToast($localize`Two date can't same `, "error");
				isReturn = true
				return 1;
			}
			totalCapacity += duration;
			return false;
		});
		if (isReturn) return;
		if (totalCapacity > capacity) {
			this._toastService.showToast($localize`Total Hours exist Capacity hours`, "error");
			return;
		}
		let requests = this.preparetimeRequest()
		this.isLoading = true;
		this.commonService.post('$batch', { requests }).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				this._toastService.showToast($localize`Successfully split time`, "error");
				this.closeModal('timeSplitModal');
				this.setUserData();
			}, error: (e: any) => {
				this.isLoading = false;
				this._toastService.showToast($localize`something went wrong`, "error");
			}

		})
	}

	isValidDateCheck(data: any) {
		const startDate = moment(data.start_time, 'YYYY-MM-DDTHH:mm:ss');
		const endDate = moment(data.end_time, 'YYYY-MM-DD HH:mm');

		const capacityStart = moment(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
		let capacityEnd = moment(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`, 'YYYY-MM-DD HH:mm:ss.SSSSSS');

		// Ensure capacityEnd is after capacityStart (handles overnight shift)
		if (capacityEnd.isBefore(capacityStart)) {
			capacityEnd.add(1, 'day');
		}

		// Check if startDate and endDate fall within the range
		const isStartValid = startDate.isBetween(capacityStart, capacityEnd, undefined, '[]');
		const isEndValid = endDate.isBetween(capacityStart, capacityEnd, undefined, '[]');
		if (isStartValid) {
			return isStartValid;
		}
		return isEndValid;

	}
	preparetimeRequest() {
		let requests: ODataBatchCall[] = [];
		let increment = 0
		this.deletemachineUserPlanTime.map((id: number) => {
			requests.push(
				new ODataBatchCall(
					increment + 1,
					"delete",
					`\/odata\/MachineUserPlanTimes(${id})`
				)
			);
		})
		this.machineUserPlanTimes.map((data: any) => {
			if (data.id) {
				let time = new ODataBatchCall(
					increment + 1,
					"patch",
					`\/odata\/MachineUserPlanTimes(${data.id})`
				)

				time.body = {
					start_time: moment(data.start_time).toISOString(),
					end_time: moment(data.end_time).toISOString()
				}
				requests.push(time);
			} else {
				let time = new ODataBatchCall(
					increment + 1,
					"post",
					`\/odata\/MachineUserPlanTimes`
				)

				time.body = {
					start_time: moment(data.start_time).toISOString(),
					end_time: moment(data.end_time).toISOString(),
					user_id: data.user_id,
					capacity_id: this.selectCapacity.id,
					machine_id: data.machine.id,
				}
				requests.push(time);
			}
		})

		return requests;
	}

	isConflictCheck(data: any, index: number) {
		let conflictCheck = false
		const dateStartCheck = moment(data.start_time);
		const dateEndtCheck = moment(data.end_time);
		const startDate = moment(this.machineUserPlanTimes[index - 1].start_time);
		const endDate = moment(this.machineUserPlanTimes[index - 1].end_time).subtract(1, 'minutes');;

		const checkStartDateConflict = dateStartCheck.isBetween(startDate, endDate, undefined, '[]')
		const checkendDateConflict = dateEndtCheck.isBetween(startDate, endDate, undefined, '[]')

		if (checkStartDateConflict || checkendDateConflict) {
			this._toastService.showToast($localize`Two date must not be conflict`, "error");
			conflictCheck = true;
		}
		return conflictCheck
	}

	onChangeStartTime(event: any, index: number) {
		if (this.machineUserPlanTimes[index].start_time) {
			this.machineUserPlanTimes[index].start_time = moment(event).toISOString();
		}

	}
	onChangeEndTime(event: any, index: number) {
		if (this.machineUserPlanTimes[index].end_time) {
			this.machineUserPlanTimes[index].end_time = moment(event).toISOString();
			if (this.machineUserPlanTimes[index + 1]?.end_time) this.machineUserPlanTimes[index + 1].start_time = this.machineUserPlanTimes[index].end_time;
		}
	}
	deletePlan(data: any, index: number) {
		const duration = this.getDuration(moment(data.start_time), moment(data.end_time))
		if (duration > 0) {
			this.machineUserPlanTimes[index - 1].end_time = data.end_time;
			if (this.machineUserPlanTimes[index + 1]?.start_time) this.machineUserPlanTimes[index + 1].start_time = this.machineUserPlanTimes[index - 1].end_time
		}
		if (this.machineUserPlanTimes[index]?.hasOwnProperty("id")) this.deletemachineUserPlanTime.push(this.machineUserPlanTimes[index].id)
		this.machineUserPlanTimes.splice(index, 1);
	}

	addSplit() {
		const duration = this.getDuration(moment(`${this.selectCapacity.date} ${this.selectCapacity.start_time}`), moment(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`))
		this.machineUserPlanTimes.push({
			machine: this.selectCapacityMachine,
			start_time: moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).local(),
			end_time: duration > 0
				? moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).local()
				: moment.utc(`${this.selectCapacity.date} ${this.selectCapacity.end_time}`).add(1, 'day').local(),
			capacity_id: this.selectCapacity.id,
			user_id: this.machineUserPlanTimes[0].user_id
		})
	}

	async onEventClick(event: any) {
		const user: any = {}
		this.users?.some((u: any) => {
			if (u.id == event.eventRecord.originalData.id) {
				user.name = u.name;
				user.capacityStart = moment.utc(`${u.start_time}`);
				user.capacityEnd = moment.utc(`${u.end_time}`);
				const duration = this.getDuration(user.capacityStart, user.capacityEnd);
				if (duration < 0) user.capacityEnd.add(1, 'day')
				return 1;
			}
			return 0
		});
		const popup = new Popup({
			owner: event?.source,
			autoShow: false,
			closable: true,
			closeAction: "destroy",
			minWidth: "400px",
			minHeight: "6em",
			align: {
				align: "t-b",
				anchor: true,
			},
			header: false,

			html: `
					<div class="flex flex-row">
						<div class="flex flex-col w-[400px] gap-3" id="startDiv">
							<div class="flex flex-row gap-3">
								<ui5-label
									show-colon
									class="w-30"
									>${$localize`Name`}</ui5-label
								>
								<ui5-text class="w-70">${user.name}</ui5-text>
							</div>
							<div class="flex flex-row gap-3">
								<ui5-label
									show-colon
									class="w-30"
									>${$localize`Capacity`}</ui5-label
								>
								<ui5-text class="w-70"
									>${user.capacityStart.local().format('YYYY-MM-DD HH:mm')} to ${user.capacityEnd.local().format('YYYY-MM-DD HH:mm')}</ui5-text
								>
							</div>
					</div>		
				`,
		});
		popup.showBy(event?.eventElement);
	}

}

const schedulerPro = (widget: Widget): SchedulerPro => widget.up(SchedulerPro.type);



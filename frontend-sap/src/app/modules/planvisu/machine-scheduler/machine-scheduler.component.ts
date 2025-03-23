import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from "@angular/core";
import {
	BryntumSchedulerProComponent,
	BryntumSchedulerProProjectModelComponent,
    BryntumSchedulerProProjectModelProps,
    BryntumSchedulerProProps,
    BryntumVersionGridProps,
} from "@bryntum/schedulerpro-angular-thin";

import { Column, Grid } from "@bryntum/grid-thin";

import { Assignment } from "@app/modules/planvisu/user-scheduler/lib/Assignments";
import { Resource } from "@app/modules/planvisu/user-scheduler/lib/Resource";
import { BryntumVersionGridComponent } from "@bryntum/schedulerpro-angular-thin";
import {
	AjaxStore,
	AjaxStoreConfig,
	DateHelper,
	Model,
	StringHelper,
	Toast,
	Widget,
} from "@bryntum/core-thin";
import { ProjectModel } from "@bryntum/schedulerpro-thin";
import { EventModel, ViewPresetConfig } from "@bryntum/scheduler-thin";
import { CalendarModel, ResourceModel, SchedulerPro } from "@bryntum/schedulerpro-thin";



import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { User } from "@app/shared/models/user.model";
// import { gridProps, projectProps, schedulerProProps } from "./app.config";
import { DragMachineScheduler } from "./lib/DragMachineScheduler";
import { BryntumGridComponent } from "@bryntum/grid-angular-thin";

@Component({
	selector: "app-machine-scheduler",
	templateUrl: "./machine-scheduler.component.html",
	styleUrl: "./machine-scheduler.component.scss",
})
export class MachineSchedulerComponent {
	schedulerProProps = schedulerProProps;
	gridProps = gridProps;
	projectProps = projectProps;

	machines: any[] = [];
	users: any[] = [];

	private schedulerPro!: SchedulerPro;
	private grid!: Grid;
	private project!: ProjectModel;

	@ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
	@ViewChild(BryntumGridComponent) gridComponent!: BryntumGridComponent;
	@ViewChild(BryntumSchedulerProProjectModelComponent)
	projectComponent!: BryntumSchedulerProProjectModelComponent;

	constructor(private commonService: CommonService) {}

	ngOnInit(): void {
		this.setAllData();
	}

	async setAllData() {
		await this.setmachineData();
		await this.setUserData();

		this.schedulerPro.resources = this.machines;
		this.schedulerPro.assignments = [
			{
				id: "1",
				resourceId: "1",
				resource: "23"
				// startDate: new Date(2024, 2, 3, 7),
				// endDate: new Date(2024, 2, 4, 7),
				// name: "Planned Task",
			},
		];
		// this.schedulerPro.events = ;

		// this.grid.store.data = [{name:"fefefef"}];
		this.grid.store.data = this.users;
	}

	setmachineData() {
		return new Promise<void>((resolve, reject) => {
			this.commonService
				.get(`Machines?$filter=hall_id eq 1 and is_active eq true&$expand=machineGroup`)
				.subscribe({
					next: (data: any) => {
						this.machines = data.value.map((v: any, index: number) => {
							v.startDate = new Date(2022, 2, 1, 7)
							v.endDate = new Date(2022, 2, 1, 9)
							v.resourceId = v.id;
							v.resourceId = index;
							return new Machine().deserialize(v);
						});
						resolve();
					},
				});
		});
	}

	setUserData() {
		return new Promise<void>((resolve, reject) => {
			this.commonService
				.get(`Users`)
				.subscribe({
					next: (data: any) => {
						this.users = data.value.map((v: any) => {
							v.role = "User";
							v.roleIconCls = "b-icon b-fa-user-md";
							v.calendar = "workweek";
							v.image = false;
							return new User().deserialize(v);
						});
						resolve();
					},
				});
		});
	}
	ngAfterViewInit(): void {
		// Save grid, scheduler and project instances to this object
		this.grid = this.gridComponent.instance;
		this.schedulerPro = this.schedulerProComponent.instance;
		this.project = this.projectComponent.instance;

		// Create a chained version of the event store as our store.
		// It will be filtered to only display events that lack of assignments.
		// Config for grouping requiredRole in ascending mode while webpage loads initially.
		 // @ts-ignore
		// const chainedStore = (this.grid.store = this.project['equipmentStore'].chain(
		// 	(eventRecord: Assignment) => !eventRecord.assignments.length,
		// 	undefined,
		// 	{
		// 		groupers: [
		// 			{
		// 				field: "requiredRole",
		// 				ascending: true,
		// 			},
		// 		],
		// 	}
		// ));

		// const
        //     { schedulerPro, grid } = this,
        //     equipmentStore      = new EquipmentStore({
        //         modelClass : SchedulerEventModel,
        //         readUrl    : 'assets/data/equipment.json',
        //         sorters    : [
        //             { field : 'name', ascending : true }
        //         ],
        //         durationUnit : 'hour',
        //         equipment    : []
        //     });

        // grid.store = equipmentStore.chain(() => true, [], {});

		// // event renderer expects equipmentStore to be class property of scheduler
        // // @ts-ignore
		// schedulerPro['equipmentStore'] = equipmentStore;

		// When assignments change, update our chained store to reflect the changes.
		const chainedStore = (this.grid.store = this.project.eventStore.chain(
			(eventRecord: Assignment) => !eventRecord.assignments.length,
			undefined,
			{
				groupers: [],
			}
		));
		this.project.assignmentStore.on({
			change: () => {
				chainedStore.fillFromMaster();
			},
			thisObj: this.grid,
		});

		// project's listener
		this.project.on({
			change: () => {
				this.schedulerPro.widgetMap["saveButton"].disabled = !Boolean(
					this.project.eventStore.changes
				);
			},
			thisObj: this.project,
		});

		new DragMachineScheduler({
			grid: this.grid,
			schedule: this.schedulerPro,
			constrain: false,
			outerElement: this.grid.element,
		});
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

	onGridSelectionChange() {
		const appointments = this.grid.selectedRecords as Assignment[],
			{ calendarHighlight } = this.schedulerPro.features,
			requiredRoles: {
				[key: string]: number;
			} = {};
		appointments.forEach(
			(appointment: Assignment) => (requiredRoles[appointment.requiredRole as string] = 1)
		);

		if (Object.keys(requiredRoles).length === 1) {
			const appointment = appointments[0] as Assignment,
				availableResources = this.schedulerPro.resourceStore.query(
					(doctor: Resource) =>
						doctor.role === appointment.requiredRole || !appointment.requiredRole
				) as any[];
			calendarHighlight.highlightResourceCalendars(availableResources);
		} else {
			calendarHighlight.unhighlightCalendars();
		}
	}

	onSave() {
		Toast.show("TODO: Save data (see onSave() event for SchedulerPro)");
	}
}



// import { Assignment } from 'src/lib/Assignment';
// import { Resource } from 'src/lib/Resource';

class PresetModel extends Model {
	declare preset: ViewPresetConfig;
	declare value: number;
}

// Some variables used in this demo
const startHour = 7;
const endHour = 20;
const schedulerPro = (widget: Widget): SchedulerPro => widget.up(SchedulerPro.type);
const grid = (widget: Widget): Grid => widget.up(Grid.type);

export const projectProps: BryntumSchedulerProProjectModelProps|any = {
	autoLoad: true,
	// loadUrl: "assets/data/data.json",
	resourceStore: {
		modelClass: Resource,
		sorters: [{ field: "name", ascending: true }],
	},
	eventStore: {
		// Unassigned events should remain in store
		removeUnassignedEvent: false,
		modelClass: Assignment,
	},

	equipmentStore:{
		modelClass : EventModel,
                readUrl    : 'assets/data/equipment.json',
                sorters    : [
                    { field : 'name', ascending : true }
                ],
                durationUnit : 'hour',
	},

	// This config enables response validation and dumping of found errors to the browser console.
	// It's meant to be used as a development stage helper only so please set it to false for production systems.
	validateResponse: true,
};

export const schedulerProProps: BryntumSchedulerProProps = {
	startDate: new Date(2024, 2, 1, 7),
	endDate: new Date(2024, 2, 1, 19),
	// startDate: new Date(),
	// endDate: new Date(new Date().getTime() + 2 * 86400000), // 7 day range
	rowHeight: 80,
	barMargin: 10,
	eventStyle: "border",
	eventColor: "indigo",
	allowOverlap: false,
	useInitialAnimation: true,

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
		base: "hourAndDay",
		columnLinesFor: 1,
		headers: [
			{
				unit: "d",
				align: "center",
				dateFormat: "dddd",
			},
			{
				unit: "h",
				align: "center",
				dateFormat: "HH",
			},
		],
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
			return scheduler.resourceStore.query(
				(doctor: Resource) =>
					doctor.role === appointment.requiredRole || !appointment.requiredRole
			) as ResourceModel[];
		},
	},
	// Configure event menu items with correct phrases (could also be done through localization)
	eventMenuFeature: {
		items: {
			deleteEvent: {
				text: "Delete appointment",
			},
			unassignEvent: {
				text: "Unschedule appointment",
			},
		},
	},
	eventDragFeature: {
		validatorFn({ eventRecords, newResource, startDate, endDate }) {
			const task = eventRecords[0] as Assignment,
				doctor = newResource as Resource,
				{ calendar } = doctor,
				valid =
					doctor.role === task.requiredRole &&
					(!calendar || (calendar as CalendarModel).isWorkingTime(startDate, endDate)),
				message = valid ? "" : "No available slot";

			return {
				valid,
				message:
					(valid ? "" : '<i class="b-icon b-fa-exclamation-triangle"></i>') + message,
			};
		},
	},
	taskEditFeature: {
		editorConfig: {
			title: "User",
		},

		// Customize its contents inside the General tab
		items: {
			generalTab: {
				// Add a event field
				items: {
					// Add a event field
					orderField: {
						type: "text",
						name: "event",
						label: "Patient",
						// Place after name field
						weight: 150,
					},
				},
			},
		},
	},
	tbar: [
		{
			text: "Save",
			width: 100,
			cls: "b-raised b-blue",
			ref: "saveButton",
			disabled: true,
			onClick(): void {
				Toast.show("TODO: Save data (see onSave() event for SchedulerPro)");
			},
		},
		{
			type: "combo",
			ref: "preset",
			editable: false,
			label: "Show",
			value: 1,
			valueField: "value",
			displayField: "name",
			items: [
				{
					name: "1 day",
					value: 1,
					preset: {
						base: "hourAndDay",
						tickWidth: 45,
					},
				},
				{
					name: "3 days",
					value: 3,
					preset: {
						base: "dayAndWeek",
					},
				},
				{
					name: "1 week",
					value: 7,
					preset: {
						base: "dayAndWeek",
					},
				},
			],
			onSelect({ record, source }: any) {
				const scheduler = schedulerPro(source);
				const preset = record as PresetModel;
				const value = preset.value;
				const startDate = DateHelper.add(
					DateHelper.clearTime(scheduler.startDate),
					startHour,
					"h"
				);
				const endDate = DateHelper.add(startDate, value - 1, "d");

				endDate.setHours(endHour);

				scheduler.viewPreset = preset.preset;
				scheduler.setTimeSpan(startDate, endDate);
				// reset scroll
				scheduler.scrollLeft = 0;
			},
		},
		{
			type: "buttongroup",
			items: [
				{
					type: "button",
					icon: "b-icon b-fa-chevron-left",
					cls: "b-transparent",
					onClick: ({ source }: any) => schedulerPro(source).shiftPrevious(),
				},
				{
					type: "button",
					text: "Today",
					cls: "b-transparent",
					onClick({ source }: any) {
						const scheduler = schedulerPro(source);
						const startDate = DateHelper.clearTime(new Date());
						scheduler.setTimeSpan(
							DateHelper.add(startDate, startHour, "h"),
							DateHelper.add(startDate, endHour, "h")
						);
					},
				},
				{
					type: "button",
					icon: "b-icon b-fa-chevron-right",
					cls: "b-transparent",
					onClick: ({ source }: any) => schedulerPro(source).shiftNext(),
				},
			],
		},
		{
			type: "button",
			icon: "b-fa b-fa-columns",
			tooltip: "Toggle layout",
			ref: "toggle-layout", // for testing purpose
			cls: "b-transparent",
			toggleable: true,
			style: "margin-left: auto",
			onToggle: ({ source }: any) =>
				schedulerPro(source).element.parentElement?.classList.toggle("b-side-by-side"),
		},
	],
	eventRenderer({ eventRecord }) {
		return [
			{
				children: [
					{
						class: "b-event-name",
						text: eventRecord.name,
					},
					{
						class: "b-event",
						html: StringHelper.xss`<div>Patient: ${(eventRecord as Assignment).event || ""}</div>`,
					},
				],
			},
		];
	},
};

// Custom grid that holds unassigned appointments
export const gridProps: BryntumVersionGridProps = {
	selectionMode: {
		cell: false,
	},

	stripeFeature: true,
	sortFeature: "name",
	groupFeature: {
		field: "requiredRole",
		renderer({ groupRowFor, column }: { groupRowFor: string; column: Column }) {
			if (column.parentIndex === 0) {
				return `User List`;
			}

			return "";
		},
	},
	columns: [
		{
			type: "template",
			text: "User",
			flex: 1,
			cellCls: "unscheduledNameCell",

			template: ({ record }) => {
				const appointment = record as Assignment;
				return StringHelper.xss`
                        <i class="b-fa b-fa-${appointment.iconCls}"></i>
                        <div class="name-container">
                            <span>${StringHelper.encodeHtml(appointment.name)}</span>
                        </div>
                    `;
			},
		},
		{
			text: "Required role",
			field: "requiredRole",
		},
		{
			type: "column",
			icon: "b-icon b-fa-clock",
			width: 80,
			align: "center",
			editor: "duration",
			field: "fullDuration",
			renderer: ({ record }) => {
				const appointment = record as Assignment;
				return `${appointment.duration} ${appointment.durationUnit}`;
			},
		},
	],
	tbar: [
		{
			type: "widget",
			tag: "strong",
			html: "Unplanned users",
			flex: 1,
		},
		{
			type: "button",
			icon: "b-fa b-fa-angle-double-down",
			cls: "b-transparent",
			tooltip: "Expand all groups",
			ref: "expand-all", // for testing purpose
			onClick: ({ source }: any) => grid(source).expandAll(),
		},
		{
			type: "button",
			icon: "b-fa b-fa-angle-double-up",
			cls: "b-transparent",
			tooltip: "Collapse all groups",
			ref: "collapse-all", // for testing purpose
			onClick: ({ source }: any) => grid(source).collapseAll(),
		},
	],

	rowHeight: 65,
	disableGridRowModelWarning: true,
};



export type Equipment = {
    id?: number
    name?: string
    iconCls? : string
}


export type BryntumEquipmentStoreProps = AjaxStoreConfig & {
    durationUnit : string
    equipment : Model[]
};

export class EquipmentStore extends AjaxStore {
    durationUnit? : string;
    equipment? : Model[];

    constructor(config : BryntumEquipmentStoreProps) {
        super(config);
    }
}

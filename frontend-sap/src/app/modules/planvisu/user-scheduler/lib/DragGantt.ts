import {
	SchedulerPro,
} from "@bryntum/schedulerpro-thin";


import { Grid } from "@bryntum/grid-thin";
import {
	DragHelperConfig,
	DragHelper,
	ScrollManager,
	StringHelper,
	Store,
    DomHelper,
	DateHelper,
} from "@bryntum/core-thin";
import { Assignment } from "@app/modules/planvisu/user-scheduler/lib/Assignments";
import { PlanVisuService } from "../../services/plan-visu.service";
import moment from "moment";

type DragConfig = DragHelperConfig & {
	grid: Grid;
	schedule: SchedulerPro;
	constrain: boolean;
	outerElement: HTMLElement;
};

// Handles dragging unscheduled appointment from the grid onto the schedule
export class DragGantt extends DragHelper {
	static get defaultConfig() {
		return {
			callOnFunctions: true,
			autoSizeClonedTarget: false,
			unifiedProxy: true,

			// Prevent removing proxy on drop, we adopt it for usage in the Schedule
			removeProxyAfterDrop: false,

			// Don't drag the actual row element, clone it
			cloneTarget: true,
			// Only allow drops on the schedule area
			dropTargetSelector: ".b-timeline-subgrid",
			// Only allow drag of row elements inside on the unplanned grid
			targetSelector: ".b-grid-row:not(.b-group-row)",
		};
	}

	public scrollManager!: ScrollManager;
	public grid: Grid;
	public outerElement: HTMLElement;
	public schedule!: SchedulerPro;
	public constrain: boolean;
	private context: any;
	current!: DragGantt;
	

	constructor(config: DragConfig, protected planvisuSrc : PlanVisuService) {
		super(config);
		this.grid = config.grid;
		this.schedule = config.schedule;
		this.constrain = config.constrain;
		this.outerElement = config.outerElement;
		this.scrollManager = config.schedule.scrollManager as ScrollManager;
	}

	override createProxy = (grabbedElement: HTMLElement): HTMLDivElement => {
		const { context, schedule, grid } = this,
			appointment = grid.getRecordFromElement(grabbedElement) as Assignment,
			durationInPixels = schedule.timeAxisViewModel.getDistanceForDuration(
				appointment.durationMS
			),
			proxy = document.createElement("div");

		proxy.style.cssText = "";

		proxy.style.width = `${durationInPixels > 500 ? 500 : durationInPixels}px`;
		proxy.style.height = schedule.rowHeight - 2 * (schedule.resourceMargin as number) + "px";

		// Fake an event bar
		proxy.classList.add(
			"b-sch-event-wrap",
			"b-sch-style-border",
			"b-unassigned-class",
			"b-sch-horizontal"
		);
		proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-withicon">
                <div class="b-sch-event-content">
                    <i class="b-icon b-${appointment.iconCls}"></i>
                    <div>
                        <div>${appointment.name}</div>
                    </div>
                </div>
            </div>
        `;

		let totalDuration = 0;
		(grid.selectedRecords as Assignment[]).forEach(
			appointment => (totalDuration += appointment.duration)
		);
		context.totalDuration = totalDuration;

		return proxy;
	};

	override onDragStart = ({ context }: { context: any }): void => {
		const
            { schedule, grid }         = this,
            { selectedRecords, store } = grid as Grid,
            appointment                = grid.getRecordFromElement(context.grabbed);

        // save a reference to the appointments being dragged so we can access them later
        context.appointments    = selectedRecords.slice();
        context.relatedElements = selectedRecords.sort((r1, r2) => (store as Store)?.indexOf(r1) - (store as Store).indexOf(r2))?.map(rec => rec !== appointment && grid.getRowFor(rec)?.element).filter(el => el);
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
	};

	override onDrag = ({ context }: { context: any }): void => {
	try{
		const
		{ schedule }                    = this,
		{ appointments, totalDuration } = context,
		requiredRole                    = appointments[0]?.requiredRole,
		newStartDate                    = schedule?.getDateFromCoordinate(context.newX, 'round', false),
		lastAppointmentEndDate          = newStartDate && DateHelper.add(newStartDate, totalDuration, appointments[0]?.durationUnit),
		doctor                          = context?.target && schedule.resolveResourceRecord(context.target),
		calendar                        = doctor?.calendar;

	if (!calendar) {
		return;
	}
	const custom_id = doctor.originalData.custom_id
	const intervals = this.planvisuSrc.machineCapacities[custom_id].length || 0
	console.log(intervals,custom_id)
	// Only allow drops on the timeaxis
	context.valid = Boolean(intervals && newStartDate &&
		// Require a resource with matching role
		(!requiredRole || doctor.role === requiredRole) &&
		// Ensure we don't break allowOverlap config
		(schedule.allowOverlap || schedule.isDateRangeAvailable(newStartDate, lastAppointmentEndDate, null, doctor) &&
			// Respect resource's working time
			(!calendar || calendar.isWorkingTime(newStartDate, lastAppointmentEndDate, true))));

	// Save reference to the doctor so we can use it in onAppointmentDrop
	context.doctor = doctor;
	}catch(e:any){
       console.log(e)
	}
	};

	// Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
	override onDrop = async ({ context }: { context: any }) => {
		try{
			const { schedule } = this;
			const { doctor, element } = context;
		    const custom_id = doctor.originalData.custom_id
			//const intervals = this.planvisuSrc.machineCapacities[custom_id].length || 0
			const intervals = this.planvisuSrc.machineCapacities[custom_id] || null
			console.log(intervals,custom_id)
			const 
			coordinate = DomHelper.getTranslateX(element),
			dropDate = schedule.getDateFromCoordinate(coordinate, "round", false),
			checkValidity = this.checkValidity(intervals,moment(dropDate).format('YYYY-MM-DD'));
			// If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
			if (context.valid && checkValidity) {
				const { appointments, element, relatedElements = [], doctor } = context,
					coordinate = DomHelper.getTranslateX(element),
					dropDate = schedule.getDateFromCoordinate(coordinate, "round", false),
					eventBarEls = [element, ...relatedElements];
				for (let i = 0; i < appointments.length; i++) {
					// We hand over the data + existing element to the Scheduler so it do the scheduling
					// await is used so that we have a reliable end date in the case of multiple event drag
				try{
					if(context.doctor){
						await schedule.scheduleEvent({
							eventRecord: appointments[i],
							// When dragging multiple appointments, add them back to back + assign to resource
							startDate: i === 0 ? dropDate : appointments[i - 1]?.endDate,
							// Assign to the doctor (resource) it was dropped on
							resourceRecord: doctor,
							element: eventBarEls[i],
						});
					}
				}catch (error) {
					//console.error('Error scheduling event:', error);
				  }
					
				}
			}
	
			schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
		}catch(e:any){
			console.log(e)
		}
	};

	checkValidity = (intervals:string[], dropDate:string)=>{
		let isvalid = false;
		intervals.some((interval:any)=>{
			if(interval.startDate.substring(0, 10) === dropDate || 
				interval.endDate.substring(0, 10) === dropDate
			){
				isvalid = true;
			}
			return isvalid;
		});
		return isvalid;
	}
}

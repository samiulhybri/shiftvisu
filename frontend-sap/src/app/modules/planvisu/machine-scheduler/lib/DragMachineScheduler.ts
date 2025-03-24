import { SchedulerPro } from "@bryntum/schedulerpro-thin";

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

type DragConfig = DragHelperConfig & {
	grid: Grid;
	schedule: SchedulerPro;
	constrain: boolean;
	outerElement: HTMLElement;
};

// Handles dragging unscheduled appointment from the grid onto the schedule
export class DragMachineScheduler extends DragHelper {
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
	current!: DragMachineScheduler;

	constructor(config: DragConfig) {
		super(config);
		this.grid = config.grid;
		this.schedule = config.schedule;
		this.constrain = config.constrain;
		this.outerElement = config.outerElement;
		this.scrollManager = config.schedule.scrollManager as ScrollManager;
	}

	override createProxy = (grabbedElement: HTMLElement): HTMLDivElement => {
		const { context, schedule, grid } = this,
			appointment = grid.getRecordFromElement(grabbedElement) as any,
			durationInPixels = schedule.timeAxisViewModel.getDistanceForDuration(
				appointment.durationMS
			),
			proxy = document.createElement("div");

		proxy.style.cssText = "";

		proxy.style.width = `${durationInPixels}px`;
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
                        <div class="patient-name">Patient: ${appointment.patient || ""}</div>
                    </div>
                </div>
            </div>
        `;

		let totalDuration = 0;
		(grid.selectedRecords as any[]).forEach(
			appointment => (totalDuration += appointment.duration)
		);
		context.totalDuration = totalDuration;

		return proxy;
	};

	override onDragStart = ({ context }: { context: any }): void => {
		const { schedule, grid } = this,
			{ selectedRecords, store } = grid as Grid,
			appointment = grid.getRecordFromElement(context.grabbed);

		// save a reference to the appointments being dragged so we can access them later
		context.appointments = selectedRecords.slice();
		context.relatedElements = selectedRecords
			.sort((r1, r2) => (store as Store).indexOf(r1) - (store as Store).indexOf(r2))
			.map(rec => rec !== appointment && grid.getRowFor(rec).element)
			.filter(el => el);
		schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
		// Prevent tooltips from showing while dragging
		schedule.features.eventTooltip.disabled = true;
	};

	override onDrag = ({ context }: { context: any }): void => {
		const { schedule } = this,
			{ appointments, totalDuration } = context,
			requiredRole = appointments[0].requiredRole,
			newStartDate = schedule.getDateFromCoordinate(context.newX, "round", false),
			lastAppointmentEndDate =
				newStartDate &&
				DateHelper.add(newStartDate, totalDuration, appointments[0].durationUnit),
			doctor = context.target && schedule.resolveResourceRecord(context.target),
			calendar = doctor?.calendar;

		if (!calendar) {
			return;
		}

		// Only allow drops on the timeaxis
		context.valid =
			newStartDate &&
			// Require a resource with matching role
			(!requiredRole || doctor.role === requiredRole) &&
			// Ensure we don't break allowOverlap config
			(schedule.allowOverlap ||
				(schedule.isDateRangeAvailable(
					newStartDate,
					lastAppointmentEndDate,
					null,
					doctor
				) &&
					// Respect resource's working time
					(!calendar ||
						calendar.isWorkingTime(newStartDate, lastAppointmentEndDate, true))));

		// Save reference to the doctor so we can use it in onAppointmentDrop
		context.doctor = doctor;
	};

	// Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
	override onDrop = async ({ context }: { context: any }) => {
		const { schedule } = this;

		// If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
		if (context.valid) {
			const { appointments, element, relatedElements = [], doctor } = context,
				coordinate = DomHelper.getTranslateX(element),
				dropDate = schedule.getDateFromCoordinate(coordinate, "round", false),
				eventBarEls = [element, ...relatedElements];

			for (let i = 0; i < appointments.length; i++) {
				// We hand over the data + existing element to the Scheduler so it do the scheduling
				// await is used so that we have a reliable end date in the case of multiple event drag
				await schedule.scheduleEvent({
					eventRecord: appointments[i],
					// When dragging multiple appointments, add them back to back + assign to resource
					startDate: i === 0 ? dropDate : appointments[i - 1].endDate,
					// Assign to the doctor (resource) it was dropped on
					resourceRecord: doctor,
					element: eventBarEls[i],
				});
			}
		}

		schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
		schedule.features.eventTooltip.disabled = false;
	};
}

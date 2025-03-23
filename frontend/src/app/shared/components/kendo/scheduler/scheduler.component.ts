import { Component, Input, OnInit } from '@angular/core';
import { Group, Resource, SchedulerEvent } from '@progress/kendo-angular-scheduler';

@Component({
	selector: 'app-scheduler',
	templateUrl: './scheduler.component.html',
	styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent {

	@Input() public events!: SchedulerEvent[];
	@Input() public resources!: Resource[];
	@Input() public group!: Group;
	@Input() public selectedDate!: Date;
	@Input() public slotDuration!: number;
	@Input() public schedulerConfig!: any;
	@Input() public createFormGroup!: any;

}

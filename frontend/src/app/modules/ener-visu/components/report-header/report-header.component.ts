import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntlService } from '@progress/kendo-angular-intl';
import { addDays, addWeeks, addMonths, addYears } from '@progress/kendo-date-math';
import * as moment from 'moment';
// Services
import { Notification } from '@app/shared/services/notification.service';
import { DurationType } from '@app/enums/duration-type.enum';

@Component({
	selector: 'app-report-header',
	templateUrl: './report-header.component.html',
	styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent {
	constructor(
		public notification: Notification,
		public intl: IntlService
	) {

	}

	ngOnInit(): void {
		this.onLoadData();
	}

	public currentTime: Date = new Date();
	public durationList: Array<any> = [];
	public durationType = DurationType;

	public dateTimeOptions: any = {
		activeView: 'month',
		bottomView: 'month',
		format: 'dd.MM.yyyy'
	}

	public defaultItem: { text: string; value: any } = {
		text: $localize`Select item...`,
		value: null,
	}

	public defaultDurationItem: { text: string; value: any } = {
		text: $localize`Select timeframe...`,
		value: null,
	}

	@Input('selectedValue') selectedValue!: any;
	@Input('typeItems') typeItems!: Array<{ text: string; value: string }>;
	@Input('durationItems') durationItems!: Array<{ text: string; value: string }>;

	@Output() loadData = new EventEmitter();
	@Output() refreshReport = new EventEmitter();

	public selectDuration(dataItem: any) {
		this.dateTimeOptions.activeView = dataItem.value == DurationType.YEAR ? 'decade' : dataItem.value == DurationType.MONTH ? 'year' : 'month'
		this.dateTimeOptions.bottomView = dataItem.value == DurationType.YEAR ? 'decade' : dataItem.value == DurationType.MONTH ? 'year' : 'month'
		this.dateTimeOptions.format = dataItem.value == DurationType.YEAR ? 'yyyy' : dataItem.value == DurationType.MONTH ? 'MMM yyyy' : 'dd.MM.yyyy'

		if (dataItem.value == DurationType.HOUR) {
			this.selectedValue.startDate = new Date(this.currentTime.getTime() - (11 * 60 * 60 * 1000))
			this.selectedValue.endDate = this.currentTime
		}

		if (dataItem.value == DurationType.DAY) {
			this.selectedValue.startDate = addDays(this.currentTime, -13);
			this.selectedValue.endDate = this.currentTime
		}

		if (dataItem.value == DurationType.WEEK) {
			this.selectedValue.startDate = addWeeks(this.currentTime, -14);
			this.selectedValue.endDate = this.currentTime
		}

		if (dataItem.value == DurationType.MONTH) {
			this.selectedValue.startDate = addMonths(this.currentTime, -11);
			this.selectedValue.endDate = this.currentTime
		}

		if(dataItem.value == DurationType.YEAR) {
			this.selectedValue.startDate = addYears(this.currentTime, -3);
			this.selectedValue.endDate = this.currentTime;
		}
	}

	public onLoadData(): void {
		if (this.selectedValue.duration == DurationType.HOUR) {
			this.selectedValue.startDate.setMinutes(0, 0, 0);
			this.selectedValue.endDate.setMinutes(59, 59, 999);
		} else {
			this.selectedValue.startDate.setHours(0, 0, 0, 0);
			this.selectedValue.endDate.setHours(23, 59, 59, 999);
		}

		let startDate = new Date(this.selectedValue.startDate);
		let endDate = new Date(this.selectedValue.endDate);
		const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
		if (this.selectedValue.startDate > this.selectedValue.endDate) {
			return this.notification.showError("Invalid Date.");
		}
		if (this.selectedValue.duration == DurationType.HOUR) {
			const durationInHours = Math.floor(timeDiff / (1000 * 60 * 60)) + 1;
			if (durationInHours > 30) return this.notification.showError("Sorry maximum duration 30 hour");
			this.durationList = [];
			this.durationList = this.getHourList(startDate, endDate);
		}

		if (this.selectedValue.duration == DurationType.DAY) {
			const durationInDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
			if (durationInDays > 30) return this.notification.showError("Sorry maximum duration 30 day");
			this.durationList = [];
			this.durationList = this.getDateList(startDate, endDate);
		}

		if (this.selectedValue.duration == DurationType.WEEK) {
			const durationInWeeks = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7)) + 1;
			if (durationInWeeks > 25) return this.notification.showError("Sorry maximum duration 25 weeks");
			this.durationList = [];
			this.durationList = this.getWeekList(startDate, endDate);
		}

		if (this.selectedValue.duration == DurationType.MONTH) {
			const durationInMonths = Math.floor((timeDiff / (1000 * 60 * 60 * 24)) / 30) + 1;
			if (durationInMonths > 24) return this.notification.showError("Sorry maximum duration 25 months");
			this.durationList = [];
			this.durationList = this.getMonthsList(startDate, endDate);
		}

		if (this.selectedValue.duration == DurationType.YEAR) {
			const durationInYear = Math.floor((timeDiff / (1000 * 60 * 60 * 24 * 365))) + 1;
			if (durationInYear > 5) return this.notification.showError("Sorry maximum duration 5 years");
			this.durationList = [];
			this.durationList = this.getYearsList(startDate, endDate);
		}

		this.loadData.emit({ selectedValue: this.selectedValue, durationList: this.durationList });
	}

	public onRefreshReport() {
		this.refreshReport.emit('all');
	}

	private getHourList(start: Date, end: Date): string[] {
		const hours = [];
		const currentDate = new Date(start);
		while (currentDate <= end) {
			const formattedDate = this.intl.formatDate(currentDate, "HH-dd.MM.yyyy")
			hours.push(formattedDate);
			currentDate.setHours(currentDate.getHours() + 1);
		}
		return hours;
	}

	private getDateList(startDate: any, endDate: any): Array<any> {
		const dateList = [];
		startDate = new Date(startDate);
		endDate = new Date(endDate);
		const days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
		for (let i = 0; i < days; i++) {
			const currentDate = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
			dateList.push(this.intl.formatDate(currentDate, "dd.MM.yyyy"));
		}
		return dateList;
	}

	private getWeekList__(start: Date, end: Date): string[] {
		const weeks = [];
		const currentDate = new Date(start);
		while (currentDate <= end) {
			weeks.push(moment(currentDate).format('ww-yyyy'));
			currentDate.setDate(currentDate.getDate() + 7);
		}
		return weeks;
	}

	private getWeekList(start: Date, end: Date): string[] {
		const weeks = [];
		let currentWeek = moment(start).startOf('isoWeek').isoWeekday(1); // Set start of week to Monday
		while (currentWeek.isSameOrBefore(end, 'day')) {
			weeks.push(`${currentWeek.isoWeek().toString().padStart(2, '0')}-${currentWeek.year()}`);
			currentWeek.add(1, 'week');
		}
		return weeks;
	}

	private getMonthsList(start: Date, end: Date): string[] {
		const months = [];
		const currentDate = new Date(start);
		while (currentDate <= end) {
			months.push(this.intl.formatDate(new Date(currentDate), 'MM-yyyy'));
			currentDate.setMonth(currentDate.getMonth() + 1);
		}
		return months;
	}

	private getYearsList(start: Date, end: Date): string[] {
		const years = [];
		const currentDate = new Date(start);
		while (currentDate <= end) {
			years.push(this.intl.formatDate(new Date(currentDate), 'yyyy'));
			currentDate.setFullYear(currentDate.getFullYear() + 1);
		}
		return years;
	}
}
import { Injectable } from "@angular/core";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { CommonService } from "@app/shared/services/common.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class PlanVisuService extends CommonService {
	machineCapacities: any = [];
	weeksList: { Year: number; Week: number; YearWeek: string }[] = [];
	private chartDataBehaviorSUbject: BehaviorSubject<ChartRangeList[]> = new BehaviorSubject<
		ChartRangeList[]
	>([]);

	private chartThreosholdBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
		60
	);

	private machineWorkloadDetailsBehaviorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
		null
	);

	private combineBulletChartDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);

	get combineBulletChartData$() {
		return this.combineBulletChartDataSubject.asObservable();
	}

	updateCombineBulletChartData(data: any[]) {
		this.combineBulletChartDataSubject.next(data);
	}

	updatebarChartData(data: any[]) {
		this.chartDataBehaviorSUbject.next(data);
	}
	barChartDataBehaviorObservable() {
		return this.chartDataBehaviorSUbject.asObservable();
	}

	set thresholdValue(value: number) {
		this.chartThreosholdBehaviorSubject.next(value);
	}

	get thresholdValue$() {
		return this.chartThreosholdBehaviorSubject.asObservable();
	}

	set machineWorkloadDetails(detail: any) {
		this.machineWorkloadDetailsBehaviorSubject.next(detail);
	}

	get machineWorkloadDetails$() {
		return this.machineWorkloadDetailsBehaviorSubject.asObservable();
	}

	generateCombineBulletChartData(
		demands: any[],
		capacities: any[],
		hall: string,
		weeks: { Year: number; Week: number; YearWeek: string }[]
	) {
		this.weeksList = weeks;

		const chartDataMap = this.initializeChartDataMap(weeks);

		this.aggregateData(demands, chartDataMap, hall, "demand");
		this.aggregateData(capacities, chartDataMap, hall, "capacity");

		return this.formatChartData(chartDataMap);
	}

	private initializeChartDataMap(
		weeks: { Year: number; Week: number; YearWeek: string }[]
	): Record<string, any> {
		return weeks.reduce(
			(map, week) => {
				map[week.YearWeek] = {
					year_week_combo: week.YearWeek,
					demand_before: 0,
					demand_after: 0,
					capacity_before: 0,
					capacity_after: 0,
				};
				return map;
			},
			{} as Record<string, any>
		);
	}

	private aggregateData(
		source: any[],
		map: Record<string, any>,
		hall: string,
		type: "demand" | "capacity"
	): void {
		source
			.filter(item => !hall || item.hall_name === hall)
			.forEach(item => {
				const key = item.year_week_combo;
				if (!map[key]) return;

				const beforeKey = `${type}_before`;
				const afterKey = `${type}_after`;

				map[key][beforeKey] += item[`hours_${type}`] || 0;
				map[key][afterKey] += item[`actual_hours_${type}`] || 0;
			});
	}

	private formatChartData(map: Record<string, any>) {
		return Object.entries(map).map(([key, value]) => {
			const [year, week] = key.split("-").map(Number);
			const date = this.getDateFromYearWeek(year, week);

			return {
				date: date.toISOString().split("T")[0],
				demand_before: +value.demand_before.toFixed(1),
				demand_after: +value.demand_after.toFixed(1),
				capacity_before: +value.capacity_before.toFixed(1),
				capacity_after: +value.capacity_after.toFixed(1),
			};
		});
	}

	getDateFromYearWeek(year: number, week: number): Date {
		// Start with Jan 1 of the given year
		const simple = new Date(year, 0, 1 + (week - 1) * 7);
		const dayOfWeek = simple.getDay();
		const ISOweekStart = new Date(simple);

		// Adjust to the correct Monday of the given ISO week
		if (dayOfWeek <= 4) {
			// If it's Sunday to Thursday, adjust backward to the previous Monday
			ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
		} else {
			// If it's Friday or Saturday, adjust forward to the next Monday
			ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
		}

		return ISOweekStart;
	}
}

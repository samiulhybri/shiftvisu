import { Injectable } from "@angular/core";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { CommonService } from "@app/shared/services/common.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class PlanVisuService extends CommonService {
	machineCapacities:any=[]
	private chartDataBehaviorSUbject: BehaviorSubject<ChartRangeList[]> = new BehaviorSubject<
		ChartRangeList[]
	>([]);

	private chartThreosholdBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
		60
	);

	private machineWorkloadDetailsBehaviorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
		null
	);

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
}

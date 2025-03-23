import { Injectable } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class MachineboardService extends CommonService {
	private operationsBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private isBlockedForInspectionPointsSubject = new BehaviorSubject<boolean>(false);

	private logisticsDataSubject = new Subject<any>();
	private clockedInUserDataSubject = new Subject<any>();
	data$ = this.logisticsDataSubject.asObservable();
	clockedInUser = []

	updateOperations(members: any[]) {
		this.operationsBehaviorSubject.next(members);
	}

	operationsBehaviorObservable() {
		return this.operationsBehaviorSubject.asObservable();
	}

	sendLogisticsData(data: any) {
		this.logisticsDataSubject.next(data);
	}
	
	sendClockedInData(data: any) {
		this.clockedInUserDataSubject.next(data);
		this.clockedInUser = data;
	}

	get clockedInUserData$(){
		return this.clockedInUserDataSubject.asObservable()
	}

	get logisticData$(){
		return this.logisticsDataSubject.asObservable()
	}

	set isUserBlockedForInspectionPoint(isBlocked: boolean) {
		this.isBlockedForInspectionPointsSubject.next(isBlocked);
	}

	get isUserBlockedForInspectionPoint$() {
		return this.isBlockedForInspectionPointsSubject.asObservable();
	}
}

import { Injectable } from "@angular/core";
import { Machine } from "@app/shared/models/machine.model";
import { CommonService } from "@app/shared/services/common.service";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class MachineboardService extends CommonService {
	private operationsBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private selectedOperationBehaviorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	private isBlockedForInspectionPointsSubject = new BehaviorSubject<boolean>(false);
	private areOpenInspectionPointsAvailable = new BehaviorSubject<boolean>(false);

	private logisticsDataSubject = new Subject<any>();
	private clockedInUserDataSubject = new Subject<any>();

	private selectedMachine: Machine | undefined;

	data$ = this.logisticsDataSubject.asObservable();
	clockedInUser = []

	updateSelectedMachine(machine: Machine | undefined) {
		this.selectedMachine = machine;
	}

	getSelectedMachine(): Machine | undefined {
		return this.selectedMachine;
	}

	updateOperations(operations: any[]) {
		this.operationsBehaviorSubject.next(operations);
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

	set isOpenInspectionPointsRemaining(isRemaining: boolean) {
		this.areOpenInspectionPointsAvailable.next(isRemaining)
	}

	get isOpenInspectionPointsRemaining$() {
		return this.areOpenInspectionPointsAvailable.asObservable();
	}

	set updateSelectedOperation(operation: any) {
		this.selectedOperationBehaviorSubject.next(operation)
	}

	get updateSelectedOperation$() {
		return this.selectedOperationBehaviorSubject.asObservable();
	}
}

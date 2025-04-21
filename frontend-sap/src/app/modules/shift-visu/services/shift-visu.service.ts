import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { CommonService } from "@app/shared/services/common.service";
import { Hall } from "@app/shared/models/hall.model";

@Injectable({
	providedIn: "root",
})
export class ShiftVisuService extends CommonService {
	private hallWithDept: BehaviorSubject<Hall | {}> = new BehaviorSubject({});
	private refreshHallsSubject = new BehaviorSubject<boolean>(false);

	getRefreshHallsObservable() {
		return this.refreshHallsSubject.asObservable();
	  }
	  
	  triggerHallRefresh() {
		this.refreshHallsSubject.next(true);
	  }
	getHallWithDeptObservable() {
		return of(this.hallWithDept.value);
	}

	setHallWithDept(value: any) {
		this.hallWithDept.next(value);
	}

	getChildrenNames(children: any[], fieldName='name') {
		let result = "";

		if (!children) {
			return result;
		}

		let resultArray: string[] = [];
		children.forEach(o => {
			if (o?.[fieldName]) {
				resultArray.push(o?.[fieldName]);
			}
		});
		result = resultArray.join(", ");
		return result;
	}
}

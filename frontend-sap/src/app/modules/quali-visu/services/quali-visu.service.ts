import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { CommonService } from "@app/shared/services/common.service";
import { User } from "@app/shared/models/user.model";
import { environment } from "@app/environments/environment";
import {ProdInspectionOperation} from "@app/shared/models/prod-inspection-operation.model";

@Injectable({
	providedIn: "root",
})
export class QualiVisuService extends CommonService {
	private teamMembersBehaviorSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
	private isFilterChanged = new BehaviorSubject<boolean>(false);

	updateTeamMembers(members: User[]) {
		this.teamMembersBehaviorSubject.next(members);
	}

	teamMembersBehaviorObservable() {
		return this.teamMembersBehaviorSubject.asObservable();
	}
}

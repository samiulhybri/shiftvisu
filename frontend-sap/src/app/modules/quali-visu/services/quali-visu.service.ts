import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { CommonService } from "@app/shared/services/common.service";
import { User } from "@app/shared/models/user.model";
import { environment } from "@app/environments/environment";

@Injectable({
	providedIn: "root",
})
export class QualiVisuService extends CommonService {
	private teamMembersBehaviorSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

	updateTeamMembers(members: User[]) {
		this.teamMembersBehaviorSubject.next(members);
	}

	teamMembersBehaviorObservable() {
		return this.teamMembersBehaviorSubject.asObservable();
	}

	getUrlForExternalAttachments(resourceId: string) {
		return `${environment.apiPrefixForRest}/import-attachment-from-btp/${resourceId}`;
    }
}

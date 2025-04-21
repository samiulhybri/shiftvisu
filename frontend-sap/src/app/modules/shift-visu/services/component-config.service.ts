import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ShiftVisuFailureComponentResponse } from '@shift-visu/interfaces/failure.interface';
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ComponentConfigService {
	constructor(
		private route: ActivatedRoute,
		private shiftVisuService: ShiftVisuService,
		public authService: AuthService
	) {}

	getFailureComponent(id: number): Observable<any> {
		return this.shiftVisuService["get"](
			`shift-visu/get-components?shift_visu_issue_type_id=${id}`,
			false
		) as Observable<any>;
	}
	
}

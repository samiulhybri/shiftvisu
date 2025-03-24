
import { GridDataResult } from "@progress/kendo-angular-grid";
import { State } from "@progress/kendo-data-query";

import { CommonService } from "../services/common.service";

import { Notification } from 'src/app/shared/services/notification.service';
import { inject } from "@angular/core";
import { AuthService } from "@app/services/auth.service";
export class GridProperty {
	public notifications = inject(Notification)
	public gridItems: any;
	public isPageable: boolean = true
	public url!: string
	public isSortable: boolean = true;
	public isResizable: boolean = true;
	public isFilterable: boolean = false;
	public isGroupable: boolean = false;
	public isLoadedEnabled: boolean = true;
	public columnMenu: Object = { filter: true };
	public state: State = {
		skip: 0,
		take: 10,
		group: [],
		filter: { filters: [], logic: "and" },
		sort: [],
	};
	public authService = inject(AuthService)
	constructor(public _commonService: CommonService) { }

	/**
	 * Fetch data form server  
	 */
	public sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
			next: (response: GridDataResult) => {
				this.gridItems = response;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}
	/**
	 * fech  emited state change data form grid component  
	 * @param state 
	 */
	changeState(state: State) {
		this.state = state
		this.sendRequest()
	}

	onRemoveItem(url: string, id?: number, entyty?: string) {
		this.isLoadedEnabled = true
		this._commonService.delete(url)
			.subscribe({
				next: (response: any) => {
					this.sendRequest();
					if (id && entyty) this.createLog('delete', id, entyty);
					this.notifications.showSuccess($localize`Data deleted successfully`);
				},
				error: (e) => {
					this.isLoadedEnabled = false;
					this.notifications.showError($localize`Something went wrong`);
				}
			})
	}

	createLog(event: string, id: number, entyty?: string) {
		if (!this.authService.user) return;
		let payload = {
			user_id: this.authService.user.id,
			loggable_id: id,
			entity: entyty,
			event: event
		}
		this._commonService.createLog(payload)
	}

	changeGridFilter(data: any) {
		this.isLoadedEnabled = true;
		let stateQuery: string = typeof (data) != 'string' ? data.query : data;
		if (data.hasOwnProperty('state') && !data.hasOwnProperty('type')) this.state = data.state;
		else if (data.type == 'relational-data' || data.type == 'fullGridSearch') {
			if(data.hasOwnProperty('state') && this.state != data.state) {
				this.state = data.state;
			} 
			this.state.filter!.filters = [];
			this.state.sort = [];
		}
		
		if (stateQuery != undefined && stateQuery != '') this.sendRequest(stateQuery);
		else this.sendRequest();
	}
}

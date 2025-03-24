import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import MachineMachineStateTime from "@app/shared/models/machine-machine-state-time.model";
import MachineState from "@app/shared/models/machine-state.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import Button from "@ui5/webcomponents/dist/Button";

import "@ui5/webcomponents/dist/List.js";
import { switchMap } from "rxjs";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-states",
	templateUrl: "./machine-states.component.html",
	styleUrl: "./machine-states.component.css",
})
export class MachineStatesComponent {
	dialogTitle: string = $localize`Machine State`;
	isLoading: boolean = false;
	isDialogOpen = true;
	machineId: string = "";
	isAuthorized: boolean = false;
	machineStates?: MachineState[] = [];
	selectedState?: MachineState = new MachineState().deserialize({});
	noState: boolean = false;
	localization = Localization;
	@Input() isFromHistory?: boolean;
	@Input() stateData?: MachineMachineStateTime;
	@Output() public closeStateDialog = new EventEmitter<any>();
	@Output() public refreshHistoy = new EventEmitter<any>();
	@ViewChild("errorDialogMachineStates", { static: false }) errorDialogMachineStates: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		public commonService: CommonService,
		public authService: AuthService,
		private machineBoardEventService: MachineBoardEventHandleService
	) {}

	ngOnInit() {
		try {
			this.isLoading = true;

			const url = window.location.href;
			const basevisuIndex = url.indexOf("/machine-board/");
			const parameter = url.substring(basevisuIndex + "/machine-board/".length);
			this.machineId = parameter.split("/")[0];

			if (this.machineId) this.bindMachineData(parseInt(this.machineId));
			this.checkAuthorized(parseInt(this.machineId));
		} catch (error) {
			console.log(error);
		}
	}

	public onCloseStateDialog = () => {
		if (this.closeStateDialog) {
			this.closeStateDialog.emit();
		}
	};

	closeDialog() {
		if (!this.isFromHistory) {
			this.router.navigate(["../"], { relativeTo: this.route }).catch(() => {
				this.router.navigate(["../../"], { relativeTo: this.route });
			});
		} else this.onCloseStateDialog();
	}

	closeErrorDialog() {
		this.errorDialogMachineStates.elementRef.nativeElement.open = false;
	}

	itemClick(state: MachineState) {
		const lastStateCondition = this.machineStates?.find(state => state.isSelected);
		const saveBtn = document.getElementById("stateDialogSaveBtn") as Button;
		saveBtn.disabled = false;
		this.machineStates?.forEach(machineStates => (machineStates.isSelected = false));
		const selectedId = state.id;

		const condition = (state: MachineState) => state.id == selectedId;
		const index = this.machineStates?.findIndex(condition);
		this.selectedState = this.machineStates?.find(condition);
		if (typeof index !== "undefined" && this.machineStates) {
			this.machineStates[index].isSelected = true;
			if (lastStateCondition?.id == this.machineStates[index].id) {
				this.machineStates[index].isSelected = false;
				this.selectedState = undefined;
			}
		}
	}

	saveDialog() {
		const saveBtn = document.getElementById("stateDialogSaveBtn") as Button;
		saveBtn.disabled = true;
		this.isLoading = true;
		if (!this.isFromHistory) {
			this.commonService
				.post(
					`machines/${this.machineId}/machine-machine-state-time`,
					{ machine_state_id: this.selectedState?.id ? this.selectedState?.id : null },
					false
				)
				.subscribe(() => {
					this.isLoading = false;
					this.machineBoardEventService.triggerMachineStateChange();
					this.machineBoardEventService.machineKPI1ChangeEvent();
					this.machineBoardEventService.machineKPI2ChangeEvent();
					this.closeDialog();
				});
		} else {
			const payload = {
				machine_state_id: this.selectedState?.id ?? null,
			};
			this.commonService
				.patch(`machine/${this.machineId}/machine-state-time/${this.stateData?.id}`, payload, false)
				.subscribe({
					next: res => {
						this.isLoading = false;
						this.onCloseStateDialog();
						this.refreshHistoy.emit();
						this.machineBoardEventService.triggerMachineStateChange();
						this.machineBoardEventService.machineKPI1ChangeEvent();
						this.machineBoardEventService.machineKPI2ChangeEvent();
					},
					error: (err: Error) => {
						this.isLoading = false;
						this.errorDialogMachineStates.elementRef.nativeElement.open = true;
					},
				});
		}
	}

	bindMachineData(machineId: number) {
		var allStates: MachineState[] = [];
		if (machineId) {
			this.commonService
				.get(`Machines/${machineId}?$expand=machineState&select=machineState`)
				.pipe(
					switchMap((res: any) => {
						allStates = res.machineState;
                        allStates.sort((a ,  b) => (a.name ?? '').localeCompare(b.name ?? ''))
						return this.commonService.get(
							`machines/${machineId}/machine-machine-state-time`,
							false
						);
					})
				)
				.subscribe((state: any) => {
					if (state) {
						const state_id = !this.isFromHistory
							? state.machine_state_id
							: this.stateData?.machine_state_id;
						let condition = (value: MachineState) => value.id == state_id;
						const index = allStates?.findIndex(condition);

						condition = (machineStates: MachineState) =>
							(machineStates.isSelected = false);
						allStates?.forEach(condition);

						if (typeof index !== "undefined" && this.machineStates) {
							if (index != -1) allStates[index].isSelected = true;
						}
					}
					this.machineStates = allStates;
					this.isLoading = false;
					if (!allStates.length) this.noState = true;
				});
		}
	}

	checkAuthorized(machineId: number) {
		if (machineId) {
			this.commonService
				.get(`machine/${machineId}/qualification`, false)
				.subscribe((status: any) => (this.isAuthorized = status ? true : false));
		}
	}
}

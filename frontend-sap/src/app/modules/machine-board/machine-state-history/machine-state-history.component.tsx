import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/shared/services/common.service";
import { Text, FlexBox, Button } from "@ui5/webcomponents-react";
import { Machine } from "@app/shared/models/machine.model";
import React from "react";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import { calDuration } from "@app/shared/utils/calculate-time";
import { AuthService } from "@app/shared/services/auth.service";
import MachineMachineStateTime from "@app/shared/models/machine-machine-state-time.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import moment from "moment";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";

@Component({
	selector: "app-machine-state-history",
	templateUrl: "./machine-state-history.component.html",
	styleUrl: "./machine-state-history.component.css",
})
export class MachineStateHistoryComponent {
	isDialogOpen: boolean = true;
	dialogTitle: string = $localize`Machine State History`;
	tableTitle?: string = "";
	dateValue: string = "";
	machineId: string = "";
	selectedMachine: Machine = new Machine().deserialize({});
	stateHistoryData: MachineMachineStateTime[] = [];
	machineMachineStateTime?: MachineMachineStateTime = new MachineMachineStateTime();
	isLoading: boolean = false;
	stateDialogOpen: boolean = false;
	isFromHistory: boolean = false;
	state?: MachineMachineStateTime;
	isAuthorized: boolean = false;
	assignedStates?: number[] = [];
	disableSplit: boolean = false;
	actionColumn: any = {
		Cell: (instance: any) => {
			const { row, webComponentsReactProperties } = instance;
			const isOverlay = webComponentsReactProperties.showOverlay;

			return (
				<FlexBox style={{ gap: "5px" }} direction="Row" justifyContent="Start">
					<FlexBox>
						<Button
							id="editButton"
							onClick={() => this.handleEditClick(row.original)}
							icon="edit"
							disabled={row.original.editable}
						/>
					</FlexBox>
					<FlexBox>
						{row.original.isSplit ? (
							<Button
								id="splitButton"
								onClick={() => this.handleSplitClick(row.original)}
								icon="split"
								disabled={this.disableSplit}
							/>
						) : (
							<></>
						)}
					</FlexBox>
				</FlexBox>
			);
		},
		Header: $localize`Action`,
		accessor: ".",
		disableFilters: true,
		hAlign: "Center",
		disableGroupBy: true,
		disableResizing: true,
		disableSortBy: true,
		id: "actions",
		width: 100,
	};
	columns: any = [
		{
			Header: $localize`Start Date & Time`,
			accessor: "start",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 240,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.start);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`End Date & Time`,
			accessor: "end",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 240,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.end);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Duration (Minutes)`,
			accessor: "duration",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 240,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = this.machineMachineStateTime?.calDuration(
					row.original.start,
					row.original.end
				);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Machine State`,
			accessor: "machineState.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			width: 345,
		},
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		public commonService: CommonService,
		public authService: AuthService,
		private machineBoardEventService: MachineBoardEventHandleService
	) {}

	ngOnInit() {
		const url = window.location.href;
		const basevisuIndex = url.indexOf("/machine-board/");
		const parameter = url.substring(basevisuIndex + "/machine-board/".length);
		this.machineId = parameter.split("/")[0];

		this.checkAuthorized();
		this.isLoading = true;
		this.dateValue = this.machineMachineStateTime?.setRangeDatePickerValue() || "";
		this.batchCall();

		const editPermission =
			this.authService.isPermissionValid("MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT") ||
			this.isAuthorized;
		if (editPermission) this.columns.push(this.actionColumn);
		else this.columns[3].width = 450;
	}

	refreshHistoy() {
		this.isLoading = true;
		this.batchCall();
	}

	closeDialog() {
		this.router.navigate(["../"], { relativeTo: this.route }).catch(() => {
			this.router.navigate(["../../"], { relativeTo: this.route });
		});
	}

	changeRangeDatePicker(event: any) {
		let [start, end] = event.detail.value.split(" - ");
		const formattedStart = moment(start, "MMM D").format("MM-DD,YYYY");
		const formattedEnd = moment(end, "MMM D").format("MM-DD,YYYY");

		this.dateValue = `${start} - ${end}`;

		this.isLoading = true;
		this.commonService
			.get(
				`machine/${this.machineId}/start/${formattedStart}/end/${formattedEnd}/machine-state-time-history`,
				false,
				true
			)
			.subscribe((value: any) => {
				this.stateHistoryData = value.map((history: MachineMachineStateTime) =>
					new MachineMachineStateTime().deserialize(history)
				);
				this.stateHistoryData.map((history: MachineMachineStateTime) => {
					history.editable = !this.assignedStates?.find(
						(item: number) => item === history.machine_state_id
					)
						? true
						: false;
					if (history?.end === null) history.isSplit = true;
				});
				this.isLoading = false;
			});
	}

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`MachineMachineStateTimes?$expand=machineState&filter=machine_id eq ${parseInt(
					this.machineId
				)}&$filter=start ge ${this.machineMachineStateTime?.getPrevious30Date()}&$orderby=start desc`
			),
			new ODataBatchCall(
				1,
				"get",
				`Machines?$filter=id eq ${parseInt(this.machineId)}&$expand=machineState($select=id)`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.stateHistoryData = response.responses[0].body.value.map(
					(history: MachineMachineStateTime) =>
						new MachineMachineStateTime().deserialize(history)
				);
				this.selectedMachine = response.responses[1].body.value[0];
				this.stateHistoryData.map((history: MachineMachineStateTime) => {
					if (history?.end === null) history.isSplit = true;
				});
				this.isLoading = false;
				this.tableTitle = this.selectedMachine.name || "";
				if (response.responses[1].body.value[0]?.machineState) {
					this.assignedStates = response.responses[1].body.value[0].machineState.map(
						(item: any) => item.id
					);
					this.stateHistoryData.map((history: MachineMachineStateTime) => {
						history.editable = !this.assignedStates?.find(
							(item: number) => item === history.machine_state_id
						)
							? history.machine_state_id
								? true
								: false
							: false;
						if (history?.end === null) history.isSplit = true;
					});
				}
				this.machineBoardEventService.machineKPI1ChangeEvent();
				this.machineBoardEventService.machineKPI2ChangeEvent();
			},
			error: e => {},
		});
	}

	handleEditClick(value: any) {
		this.stateDialogOpen = true;
		this.isFromHistory = true;
		this.state = value;
	}

	handleSplitClick(value: any) {
		this.disableSplit = true;
		this.isLoading = true;
		this.commonService
			.post(
				`machines/${this.machineId}/machine-machine-state-time`,
				{ machine_state_id: value?.machine_state_id },
				false
			)
			.subscribe(() => {
				this.isLoading = false;
				this.refreshHistoy();
				this.machineBoardEventService.triggerMachineStateChange();
				this.disableSplit = false;
			});
	}

	closeStateDialog() {
		this.stateDialogOpen = false;
	}

	checkAuthorized() {
		if (
			(this.authService.isQualified() &&
				this.authService.isPermissionValid(
					"MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT_IF_QUALIFIED"
				)) ||
			this.authService.isPermissionValid("MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT")
		) {
			this.isAuthorized = true;
		} else this.isAuthorized = false;
	}
}

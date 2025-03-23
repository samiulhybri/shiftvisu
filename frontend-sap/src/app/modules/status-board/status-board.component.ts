import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { AuthService } from "@app/shared/services/auth.service";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { Hall } from "@app/shared/models/hall.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ReplaySubject, switchMap, take, takeUntil } from "rxjs";
import { DataService } from "@app/shared/services/data.service";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { PlantsService } from "@app/shared/services/plants.service";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { Setting } from "@app/shared/models/setting.model";

@Component({
	selector: "app-status-board",
	templateUrl: "./status-board.component.html",
	styleUrl: "./status-board.component.css",
})
export class StatusBoardComponent implements OnInit, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	machines: Machine[] = [];
	filteredMachines: Machine[] = [];
	machineGroups: MachineGroup[] = [];
	halls: Hall[] = [];
	settings: Setting = new Setting().deserialize({});
	customQuery = "Machines?$expand=hall,machineGroup";
	allQuery: string[] = [];
	isLogOutDialogOpen = false;
	isBusy = false;
	date: Date=new Date();
	cardType = MachineStateStateType;
	cardView = CardView;
	selectedCardView = CardView.Standard;
	machineBoardViewPermission = PermissionEnum.MACHINEBOARD_VIEW;

	public selectedHall: number[] = [];
	public selectedMachine: number[] = [];
	public selectedMachineGroup: number[] = [];

	totalInProduction: number = 0;
	totalInStandStill: number = 0;
	totalInSetup: number = 0;
	totalInOFF: number = 0;
	totalInReady: number = 0;

	constructor(
		private route: ActivatedRoute,
		public commonService: CommonService,
		private router: Router,
		protected authService: AuthService,
		private dataService: DataService,
		private plantService: PlantsService
	) {}

	ngOnInit() {
		this.checkParamsFromURL();
		this.loadCachedData();
		this.loadSettingsData();
		this.setTime();
	}

	checkParamsFromURL() {
		this.route.queryParams.subscribe(params => {
			if (params["machines"])
				this.allQuery.push(
					this.commonService.generateCustomQueryForMultipleEntry(params["machines"], "id")
				);
			if (params["machine-groups"])
				this.allQuery.push(
					this.commonService.generateCustomQueryForMultipleEntry(
						params["machine-groups"],
						"machine_group_id"
					)
				);
			if (params["halls"])
				this.allQuery.push(
					this.commonService.generateCustomQueryForMultipleEntry(
						params["halls"],
						"hall_id"
					)
				);

			// new param add here, only add if condition and push to allQuery

			if (params["mode"]) console.log(`Display mode is ${params["mode"]}`);

			if (this.allQuery.length) {
				this.customQuery =
					`${this.customQuery}&filter=` +
					this.allQuery.map((query: string) => `${query}`).join(` and `);
			}
		});
	}

	selectedCardChange(event: any) {
		this.selectedCardView = event;
	}

	loadCachedData() {
		this.dataService.statusboardMachineList = null;
		this.dataService.statusBoardMachines$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			if (res !== null) {
				this.machines = res;
			} else {
				this.loadData();
			}
			this.filterMachineList();
		});

		this.dataService.statusBoardMachineGroups$
			.pipe(takeUntil(this.destroyed$))
			.subscribe(res => {
				this.machineGroups = res;
			});

		this.dataService.statusBoardHalls$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.halls = res;
		});

		this.dataService.filteredHallIds$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.selectedHall = res;
			this.filterMachineList();
		});

		this.dataService.filteredMachineGroupIds$
			.pipe(takeUntil(this.destroyed$))
			.subscribe(res => {
				this.selectedMachineGroup = res;
				this.filterMachineList();
			});

		this.dataService.filteredMachineIds$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.selectedMachine = res;
			this.filterMachineList();
		});
	}

	filterMachineList() {
		this.filteredMachines = this.machines.filter(machine => {
			let isHallSelected = true;
			let isMachineGroupSelected = true;
			let isMachineSelected = true;

			if (this.selectedHall.length > 0) {
				isHallSelected = this.selectedHall.includes(machine.hall?.id!);
			}

			if (this.selectedMachineGroup.length > 0) {
				isMachineGroupSelected = this.selectedMachineGroup.includes(
					machine.machineGroup?.id!
				);
			}

			if (this.selectedMachine.length > 0) {
				isMachineSelected = this.selectedMachine.includes(machine.id!);
			}
			return isHallSelected && isMachineGroupSelected && isMachineSelected;
		});

		this.setMachineStatus();
	}

	setMachineStatus() {
		this.totalInProduction = 0;
		this.totalInStandStill = 0;
		this.totalInSetup = 0;
		this.totalInOFF = 0;
		this.totalInReady = 0;

		this.filteredMachines.forEach(machine => {
			switch (machine.status) {
				// Machine State Type
				case MachineStateStateType.PRODUCTION:
					this.totalInProduction++;
					break;
				case MachineStateStateType.STANDSTILL:
					this.totalInStandStill++;
					break;
				case MachineStateStateType.SETUP:
					this.totalInSetup++;
					break;
				case MachineStateStateType.OFF:
					this.totalInOFF++;
					break;
				case MachineStateStateType.READY:
					this.totalInReady++;
					break;
				// Operation State Type
				case ProdOrderPosOperationStatus.IN_PRODUCTION:
					this.totalInProduction++;
					break;
				case ProdOrderPosOperationStatus.IN_SETUP:
				case ProdOrderPosOperationStatus.IN_TEARDOWN:
					this.totalInSetup++;
					break;
				default:
					this.totalInOFF++;
					break;
			}
		});
	}

	loadData() {
		this.isBusy = true;
		this.commonService
			.get(`machines/${this.plantService.plantId.value}`, false)
			.pipe(
				takeUntil(this.destroyed$),
				take(1),
				switchMap((res: any) => {
					this.machines = res.map((machine: Machine) => {
						return new Machine(this.commonService).deserialize(machine);
					});
					const requests: ODataBatchCall[] = [];
					requests.push(
						new ODataBatchCall(
							1,
							"get",
							`\/odata\/MachineGroups?$filter=is_active eq true&$expand=hall&$orderby=custom_id`
						)
					);
					requests.push(
						new ODataBatchCall(
							2,
							"get",
							`\/odata\/Halls?$filter=is_active eq true and is_enabled_statusboard eq true&$orderby=custom_id`
						)
					);
					return this.commonService.post("$batch", { requests });
				})
			)
			.subscribe({
				next: (res: any) => {
					this.machineGroups = res.responses[0].body.value.map(
						(machineGroup: MachineGroup) => {
							return new MachineGroup().deserialize(machineGroup);
						}
					);
					this.halls = res.responses[1].body.value.map((hall: Hall) => {
						return new Hall().deserialize(hall);
					});
					this.dataService.statusboardMachineList = [...this.machines];
					this.dataService.statusboardMachineGroupList = [...this.machineGroups];
					this.dataService.statusboardHallList = [...this.halls];
				},
				error: error => {
					this.isBusy = false;
				},
				complete: () => {
					this.isBusy = false;
				},
			});
	}

	loadSettingsData() {
		let requests: ODataBatchCall[] = [];

		requests.push(new ODataBatchCall(0, "get", `/odata/Settings`));
		this.isBusy = true;

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.settings = new Setting().deserialize(
					response.responses[0]?.body?.value?.[0] || {}
				);

				this.isBusy = false;
			},
			error: () => {
				this.isBusy = false;
			},
		});
	}

	logOut() {
		this.isBusy = true;
		this.authService.logout().then(
			() => {
				this.isBusy = false;
				this.closeDialog();
				this.router.navigate(["/login"], { replaceUrl: true });
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	setTime() {
		setInterval(() => {
			this.date = new Date();
		}, 1000);
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}
}

export enum CardView {
	Standard,
	Compact,
}

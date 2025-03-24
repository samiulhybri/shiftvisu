import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { CardView } from "@app/modules/status-board/status-board.component";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { Hall } from "@app/shared/models/hall.model";
import { Machine } from "@app/shared/models/machine.model";
import { DataService } from "@app/shared/services/data.service";
import { ReplaySubject, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/shared/services/common.service";

@Component({
	selector: "app-machine-status",
	templateUrl: "./machine-status.component.html",
	styleUrl: "./machine-status.component.css",
})
export class MachineStatusComponent implements OnInit, OnChanges, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@Input() selectedCardView!: CardView;
	@Output() selectedCardChange: EventEmitter<any> = new EventEmitter();
	@Input() machines: Machine[] = [];
	@Input() halls: Hall[] = [];
	@Input() machineGroups: MachineGroup[] = [];
	@ViewChild('hallRef') hallRef : any;
	@ViewChild('machineGroupRef') machineGroupRef : any;
	@ViewChild('machineRef') machineRef : any;
	public selectedHall: number[] = [];
	public selectedMachine: number[] = [];
	public selectedMachineGroup: number[] = [];

  selectorsVisible: boolean = false;

	constructor(
		private dataService: DataService,
		private commonService: CommonService,
		private route: ActivatedRoute
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if(this.halls.length > 0) this.hallFilter();
		if(this.machineGroups.length > 0) this.machineGroupFilter();
		if(this.machines.length > 0) this.machineFilter();
	}

	ngOnInit(): void {
		this.getCachedFilter();
		this.getQueryParamsFromURL();
    	window.addEventListener('resize', this.handleResize.bind(this));
	}

	handleResize() {
		if (window.innerWidth >= 1600) {
		// Hide selectors if the screen is bigger than 1600px
		this.selectorsVisible = false;
		}
	}

	toggleSelectors(): void {
		this.selectorsVisible = !this.selectorsVisible;
	}

	getQueryParamsFromURL() {
		this.route.queryParams.subscribe(params => {
			if(params["halls"]) {
				const hallIds = this.commonService.getValidIdsFromQueryParams(params["halls"]);
				if( hallIds.length > 0 ) {
					this.dataService.filterHallId = [...hallIds];
				}
			}else {
				this.dataService.filterHallId = [];
			}

			if(params["machine-groups"]) {
				const machineGroupIds = this.commonService.getValidIdsFromQueryParams(params["machine-groups"]);
				if( machineGroupIds.length > 0 ) {
					this.dataService.filterMachineGroupId = [...machineGroupIds];
				}
			}else {
				this.dataService.filterMachineGroupId = [];
			}

			if (params["machines"]) {
				const machineIds = this.commonService.getValidIdsFromQueryParams(params["machines"]);
				if( machineIds.length > 0 ) {
					this.dataService.filterMachineId = [...machineIds];
				}
			}else {
				this.dataService.filterMachineId = [];
			}
		})
	}

	getCachedFilter() {
		this.dataService.filteredHallIds$
		.pipe(takeUntil(this.destroyed$))
		.subscribe(res=>{
			this.selectedHall = res;
			this.hallFilter();
		})

		this.dataService.filteredMachineGroupIds$
		.pipe(takeUntil(this.destroyed$))
		.subscribe(res=>{
			this.selectedMachineGroup = res;
			this.machineGroupFilter()
		})

		this.dataService.filteredMachineIds$
		.pipe(takeUntil(this.destroyed$))
		.subscribe(res=>{
			this.selectedMachine = res;
			this.machineFilter();
		})
	}

	selectionChangeCardViewMode(event: any) {
		if (event.detail.selectedItems[0].id == "standardCard") {
			this.selectedCardView = CardView.Standard;
		} else {
			this.selectedCardView = CardView.Compact;
		}
		this.selectedCardChange.emit(this.selectedCardView);
	}

	machineSelectionChange(event: any) {
		const selectedMachine = event.srcElement.selectedValues.map((el: any)=> +el.id) as number[];
		this.commonService.updateQueryParams({"machines": selectedMachine.join(',')})
	}

	hallSelectionChange(event: any) {
		const selectedHall = event.srcElement.selectedValues.map((el: any)=> +el.id) as number[];
		this.commonService.updateQueryParams({"halls": selectedHall.join(',')})
	}

	machineGroupSelectionChange(event: any) {
		const selectedMachineGroup = event.srcElement.selectedValues.map((el: any)=> +el.id) as number[];
		this.commonService.updateQueryParams({"machine-groups": selectedMachineGroup.join(',')})
	}

	machineFilter() {
		if(this.selectedMachine.length > 0) {
			this.machines.forEach(machine => {
				if (machine.id && this.selectedMachine.includes(machine.id)) {
					machine.isSelected = true;
				} else {
					machine.isSelected = false;
				}
			});
		}else {
			this.machines = this.machines.map(el=> {
				el.isSelected = true;
				return el;
			})
		}
	}

	hallFilter() {
		if(this.selectedHall.length > 0) {
			this.halls.forEach(hall => {
				if (hall.id && this.selectedHall.includes(hall.id)) {
					hall.isSelected = true;
					this.machineGroups.forEach((machineGroup:MachineGroup) => {
						if(machineGroup?.hall?.id == hall.id) {
							machineGroup.isSelected = true;
						}
					});
					this.machines.forEach((machine: Machine) => {
						if (machine?.hall?.id == hall.id) {
							machine.isSelected = true;
						}
					});
				} else {
					hall.isSelected = false;
				}
			});
		}else {
			this.halls = this.halls.map(el=>{
				el.isSelected = true;
				return el;
			});
			this.machineGroups = this.machineGroups.map(el=>{
				el.isSelected = true;
				return el;
			});
		}
	}

	machineGroupFilter() {
		if(this.selectedMachineGroup.length > 0) {
			this.machineGroups.forEach(machineGroup => {
				if (machineGroup.id && this.selectedMachineGroup.includes(machineGroup.id)) {
					machineGroup.isSelected = true;
					this.machines.forEach((machine: Machine) => {
						if (machine?.machineGroup?.id == machineGroup.id) {
							machine.isSelected = true;
						}
					});
				} else {
					machineGroup.isSelected = false;
				}
			});
		}else {
			this.machineGroups = this.machineGroups.map(el=>{
				el.isSelected = true;
				return el;
			});
			this.machines = this.machines.map(el=> {
				el.isSelected = true;
				return el;
			})
		}
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}
}

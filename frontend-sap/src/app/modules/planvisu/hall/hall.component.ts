import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GenericTagType } from "@app/shared/components/generic-tag/generic-tag.component";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { CommonService } from "@app/shared/services/common.service";
import moment from "moment";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Capacity } from "@app/shared/models/capacity.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ProductionPlanType } from "@app/shared/enums/ProductionPlanType";
import { ProductionPlanningPageName } from "@app/shared/enums/ProductionPlanningPageName";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@app/environments/environment";

@Component({
	selector: "app-hall",
	templateUrl: "./hall.component.html",
	styleUrl: "./hall.component.css",
})
export class HallComponent {
	public type = GenericTagType;

	public hall: Hall = new Hall();
	public halls: Hall[] = [];
	public isBusy = true;
	public isHallDeactivatedDialogOpen = false;
	public prodOrderPosOperations: ProdOrderPosOperation[] = [];
	public isWeek: boolean = true;
	public hallCopy!: Hall;
	public momentInstance = moment;
	public isOperationDetailOn = false;
	public isDataNotSaveErrorDialog = false;
	public maxDate = moment().add(2, "months").format("MMM DD, yyyy");
	public minDate = moment().format("MMM DD, yyyy");
	isPopOverOpen = false;
	isKanbanPopOverOpen = false;
	public isInForgePage = false; // we have to types of kanban pages: Standard and Kanban
	orderSearch?: string;
	restrictedOperations: any[] = [];
	linkedOperationsData:any[] = [];

	constructor(
		public route: ActivatedRoute,
		public commonService: CommonService,
		private router: Router,
		private http: HttpClient,
	) {}

	ngOnInit(): void {
		if (this.route.snapshot.url[0].path == "forge") this.isInForgePage = true;
		this.route.params.subscribe(params => {
			this.isBusy = true;
			const hallId = params["id"];

			this.setLinkedOperations();
			this.resetHall(hallId).then(() => {
				if (!this.hall?.machineGroup.length) {
					this.isBusy = false;
					return;
				}

				this.hall.resetDate(this.isWeek);
				this.resetMachineAndMachineGroup();

				this.hallCopy = JSON.parse(JSON.stringify(this.hall));

				this.isBusy = false;
			});
			this.getHalls();
		});
	}

	setLinkedOperations() {
		const token = localStorage.getItem("token");
		const homeLink = environment.homeLink
		if(token) {
			const headers = new HttpHeaders({
				Authorization: `Bearer ${token}`,
			});
			this.http
				.get(
					homeLink +
						"mes_visu/ruesten/php/mes_visu_data_services.php?service=get_lock_orders_info",
					{ headers:  headers  }
				)
				.subscribe({
					next: (res: any) => {
						this.linkedOperationsData = res;
					},
				});
		}
	}

	isOperationLocked(prodOrderPosOperation:ProdOrderPosOperation): boolean {
		let isLocked = false
		this.linkedOperationsData.forEach((data:any) => {
			data.oparations.forEach((element:any) => {
				if(element.auf_nr ==`${prodOrderPosOperation.prodOrderPos?.prodOrder?.custom_id}|${prodOrderPosOperation.pos}`) {
					if(element.show==1) {
					 isLocked = false
					}else{
						isLocked = true
					}
				}

			});
		});

		return isLocked;
	}

	getHalls() {
		this.commonService
			.get(
				`Halls?$filter=is_enabled_plan_visu eq true and is_active eq true and id ne ${this.route.snapshot.params["id"]}`
			)
			.subscribe({
				next: (data: any) => {
					this.halls = data.value.map((hall: any) => {
						const h = new Hall().deserialize(hall);
						h.isSelected = false;
						return h;
					});
				},
			});
	}

	resetHall(hallId: number | string): Promise<any> {
		const start = moment().subtract(1, "days").format("YYYY-MM-DD");
		const end = moment().add(2, "months").format("YYYY-MM-DD");
		return new Promise((resolve, reject) => {
			this.commonService.get(this.getQuery(hallId, start, end)).subscribe({
				next: (hall: any) => {
					if (!hall.is_active) {
						this.isHallDeactivatedDialogOpen = true;
						resolve(hall);
					}

					this.processHall(hall);

					resolve(hall);
				},
				error: (err: any) => {
					console.log(err);
				},
			});
		});
	}

	processHall(hall: any) {
		this.hall.deserialize(hall);

		this.hall.machineGroup = this.hall.machineGroup.filter(
			(machineGroup: MachineGroup) => machineGroup.is_active == true
		);
	}

	getQuery(hallId: string | number, start: string, end: string) {
		return `Halls/${hallId}?$expand=capacities(filter=date gt '${start}' and date lt '${end}'),machineGroup(filter=is_active eq true;expand=machines($filter=is_active eq true;expand=capacities(expand=shift;$filter=date gt '${start}' and date lt '${end}')),prodOrderPosOperations(filter=show_in_planvisu eq true and pos ne '0010' and status ne '${ProdOrderPosOperationStatus.CLOSED}' and status ne '${ProdOrderPosOperationStatus.DELETED}';expand=prodOrderPos(expand=bomPos($expand=item,unitOfMeasure,classifications),item($expand=classifications),prodOrder,calculation(expand=testingScope,heatTreatments,offerPos($expand=offerPosRawDimensions,material,offer($expand=customer))))))`;
	}

	resetMachineAndMachineGroup() {
		this.hall.machineGroup.forEach((machineGroup: MachineGroup) => {
			machineGroup.isSelected = false;
			machineGroup.machines.forEach((machine: Machine) => (machine.isSelected = false));
		});
	}

	changeGroups(event: Event) {
		const selcetedGroups = (event as CustomEvent).detail.items;
		for (let machineGroup of this.hall.machineGroup) {
			const index = selcetedGroups.findIndex((item: any) => item.id == machineGroup.id);
			machineGroup.isSelected = index != -1;
      if(index != -1){
        machineGroup.machines.forEach((machine: Machine)=>{
          machine.isSelected = true;
        })
      }
		}
	}

	changeHall(event: Event) {
		const start = moment().subtract(1, "days").format("YYYY-MM-DD");
		const end = moment().add(2, "months").format("YYYY-MM-DD");
		const selcetedHalls = (event as CustomEvent).detail.items;
		this.isBusy = true;
		this.resetHall(this.route.snapshot.params["id"]).then((newHall: Hall) => {
			this.isBusy = true;
			this.hall.resetDate(this.isWeek);
			this.resetMachineAndMachineGroup();
			const requests = selcetedHalls.map(
				(item: any, i: number) =>
					new ODataBatchCall(i, "get", this.getQuery(item.id, start, end))
			);

			this.commonService.post("$batch", { requests }).subscribe({
				next: (data: any) => {
					this.hall = new Hall();
					this.processHall(newHall);
					data.responses.forEach((respose: any) => {
						const hall = new Hall().deserialize(respose.body);
						hall.machineGroup.forEach(mg => {
							const machineGroup = this.hall.machineGroup.find(mg2 => {
								mg2.id == mg.id;
							});
							if (!machineGroup) this.hall.machineGroup.push(mg);
						});
					});

					this.hall.resetDate(this.isWeek);
					this.resetMachineAndMachineGroup();

					this.hallCopy = JSON.parse(JSON.stringify(this.hall));
					this.isBusy = false;
				},
				error: e => {
					console.log(e);
				},
			});
		});
	}

	weekDayChange() {
		this.isWeek = !this.isWeek;
		this.hall.resetDate(this.isWeek);
	}

	changeMachines(event: Event) {
		const selcetedMachines = (event as CustomEvent).detail.items;
		for (let machineGroup of this.hall.machineGroup) {
			for (let machine of machineGroup.machines) {
				const index = selcetedMachines.findIndex((item: any) => item.id == machine.id);
				machine.isSelected = index != -1;
			}
		}
	}

	changeOrders(event: any) {
		const searchedValue = event.target.value;
		this.orderSearch = searchedValue;
		this.changeOrdersBySearchValue(searchedValue);
	}

	changeOrdersBySearchValue(searchedValue: string) {
		this.hall.machineGroup.forEach(machineGroup => {
			machineGroup.prodOrderPosOperations.forEach(operation => {
				if (
					!searchedValue ||
					operation.prodOrderPos!.prodOrder?.custom_id?.includes(searchedValue)
				) {
					operation.prodOrderPos!.prodOrder!.isSelected = true;
				} else {
					operation.prodOrderPos!.prodOrder!.isSelected = false;
				}
			});
		});
	}

	changeDate(event: Event) {
		this.hall.tableDate = (event as CustomEvent).detail.value;
		this.hall.resetDate(this.isWeek);
	}

	dropBacklog(event: CdkDragDrop<ProdOrderPosOperation[]>) {
		const id = event.item.element.nativeElement.id;

		this.hall.moveToBacklog(parseInt(id), this.hallCopy);
		this.save();
	}

	dropMachine(
		event: CdkDragDrop<any[]>,
		machineId: number,
		machineGroupId: number,
		date: string
	) {
		const id = event.item.element.nativeElement.id;
		const index = event.currentIndex;
		this.hall.moveToMachine(machineId, id, machineGroupId, date, index);
		this.save();
	}

	save() {
		let requests: ODataBatchCall[] = [];
		this.isBusy = true;
		for (let prodOrderPosOperation of this.hall.changes!) {
			const payload = prodOrderPosOperation.toOdata();
			let requestData = new ODataBatchCall(
				1,
				"put",
				`\/odata\/ProdOrderPosOperations\/${prodOrderPosOperation.id}`
			);
			requestData.body = payload;

			requests.push(requestData);
		}
		this.commonService.post(`$batch`, { requests }).subscribe({
			next: (res: any) => {
				this.hall.changes = [];
				this.hallCopy = JSON.parse(JSON.stringify(this.hall));
				this.isBusy = false;
			},
			error: (e: any) => {
				this.isDataNotSaveErrorDialog = true;
			},
		});
	}

	resetChanges() {
		const hallCopy = this.hallCopy;
		hallCopy.dates = this.hall.dates;
		hallCopy.machineGroup.forEach((machineGroup, i) => {
			machineGroup.isSelected = this.hall.machineGroup[i].isSelected;
			machineGroup.machines.forEach((machine, j) => {
				machine.isSelected = this.hall.machineGroup[i].machines[j].isSelected;
			});
		});
		this.hall = new Hall().deserialize(JSON.parse(JSON.stringify(hallCopy)));
		this.changeOrdersBySearchValue(this.orderSearch ?? "");
	}

	changeStartDateFilter(event: Event) {
		this.hall.startDateFilterValue = (event as CustomEvent).detail.value;
	}

	sortOperations(
		prodOrderPosOperations: ProdOrderPosOperation[],
		machineId: number,
		date: string,
		isPast = false
	) {
		let operations: ProdOrderPosOperation[] = [];

		for (let prodOrderPosOperation of prodOrderPosOperations) {
			if (
				machineId == prodOrderPosOperation.plan_machine_id &&
				prodOrderPosOperation.plan_start != null
			) {
				if (
					date == moment(prodOrderPosOperation.plan_start).format("MMM DD, yyyy") &&
					!isPast
				) {
					operations.push(prodOrderPosOperation);
				}
				if (
					moment(moment().format("MMM DD, yyyy")).toDate() >
						moment(
							moment(prodOrderPosOperation.plan_start).format("MMM DD, yyyy")
						).toDate() &&
					isPast
				) {
					operations.push(prodOrderPosOperation);
				}
			}
		}

		operations = operations.sort(
			(a, b) =>
				moment(a.plan_start).toDate().getTime() - moment(b.plan_start).toDate().getTime()
		);
		return operations;
	}

	clickOnOperation(prodOrderPosOperation: ProdOrderPosOperation): void {
		this.router.navigate([`operation/${prodOrderPosOperation.id}`], {
			relativeTo: this.route,
			state: { hall: JSON.stringify(this.hall.toOdata()) },
		});
	}

	openPopOver() {
		this.isPopOverOpen = true;
	}

	openKanbanPopOver() {
		this.isKanbanPopOverOpen = true;
	}

	checkRestrictions() {
		const currentOperations = this.getCurrentOpereations();
		const queryPart = currentOperations
			.map((operation, i) => ` ${i != 0 ? "or" : ""} id eq ${operation.prodOrderPos?.id}`)
			.join("");
		const query = `ProdOrderPos?$expand=prodOrderPosOperations&$filter=${queryPart}`;
		this.isBusy = true;

		this.commonService.get(query).subscribe({
			next: (res: any) => {
				this.isBusy = false;
				this.restrictedOperations = [];
				currentOperations.forEach(currentOprataion => {
					res.value.forEach((pos: any) => {
						const sortedOperations = pos.prodOrderPosOperations.sort(
							(a: any, b: any) => {
								return parseInt(a.pos) - parseInt(b.pos);
							}
						);

						for (let i = 0; i < sortedOperations.length - 2; i++) {
							if (
								sortedOperations[i].plan_end &&
								sortedOperations[i + 1].plan_start &&
								(sortedOperations[i].plan_end
									? moment(sortedOperations[i].plan_end).toDate().getTime() + 1
									: 0) >
									(sortedOperations[i + 1].plan_start
										? moment(sortedOperations[i + 1].plan_start)
												.toDate()
												.getTime()
										: 0) &&
								sortedOperations[i + 1].plan_machine_id
							) {
								this.restrictedOperations.push(currentOprataion);
								break;
							}
						}
					});
				});
			},
		});
	}

	getCurrentOpereations() {
		const selectedMachines: Machine[] = [];
		const selectedOperations: ProdOrderPosOperation[] = [];
		this.hall.machineGroup.forEach(mg => {
			mg.machines.forEach(m => {
				if (m.isSelected && mg.isSelected) {
					selectedMachines.push(m);
				}
			});
		});
		this.hall.machineGroup.forEach(mg => {
			mg.prodOrderPosOperations.forEach(operation => {
				const machine = selectedMachines.find(m => m.id == operation.machine_id);
				if (
					machine &&
					operation.plan_start != null &&
					operation.plan_end != null &&
					operation.plan_machine_id
				) {
					selectedOperations.push(operation);
				}
			});
		});

		return selectedOperations;
	}

	isRestricted(prodOrderPosOperation: ProdOrderPosOperation) {
		const operation = this.restrictedOperations.find(p => p.id == prodOrderPosOperation.id);
		if (operation) {
			return true;
		} else {
			return false;
		}
	}
	popOverClose() {
		this.isPopOverOpen = false;
	}

	kanbanPopOverClose() {
		this.isKanbanPopOverOpen = false;
	}

	changeBacklogQuantity(event: any) {
		this.hall.quantityFilter = event.target.value;
	}

	changeBacklogOrderFilter(event: any) {
		this.hall.backlogOrderFilter = event.target.value;
	}

	changeBacklogOperation(event: any) {
		this.hall.operationNameFilter = event.target.value;
	}

	changeBacklogProductType(event: any) {
		this.hall.productTypeFilter = event.target.value;
	}

	changeBacklogLinkedOperations(event: any) {
		this.hall.linkedOperation = event.target.value;
	}
}

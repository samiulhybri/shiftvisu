import { Component, Input, OnDestroy, OnInit } from "@angular/core";

import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import moment from "moment";
import { Subject, takeUntil, tap } from "rxjs";

import { CommonService } from "@app/shared/services/common.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ToastService } from "@app/shared/services/toaster.service";

@Component({
	selector: "app-machine-orders-modal",
	templateUrl: "./machine-orders-modal.component.html",
	styleUrl: "./machine-orders-modal.component.css",
})
export class MachineOrdersModalComponent implements OnInit, OnDestroy {
	public localization = Localization;
	@Input() machineId?: number;
	@Input() startDate: string = Date.now().toLocaleString();
	@Input() endDate: string = Date.now().toLocaleString();
	@Input() showProposed: boolean = true;
	@Input() closeEvent: any;
	@Input() saveEvent: any;

	public combineOrderDialog: boolean = false;

	public groups: Set<number>[] = [];
	public group: Set<number> = new Set<number>();
	public inGroup: Map<number, any> = new Map<number, any>();
	public forCombineOrders: any = [];
	public selectedCombineOrders: any = [];
	public selectedOrders: string = "";
	public selectedOrderIds: number[] = [];
	public isOrderDetailsDialogOpen: boolean = false;
	public selectedParentOrder: any = null;
	public isLoading: boolean = true;
	public showDialog: boolean = true;
	public isNewOrderDialogOpen: boolean = false;
	public prodOrderPosOperationStatus = ProdOrderPosOperationStatus;
	public orders: any = [];
	public selectedItem: any;
	public machineName: string = "";
	public tempProdOrderPosOperations: any = [];
	public initialSelectedOrders: string = "";
	public willBeSave: boolean = false;
	public needToSaveOrderIds: Set<number> = new Set<number>();
	private destroy$ = new Subject<void>();
	public cardHeaderText = $localize`Machine Schedule`;

	constructor(
		private commonService: CommonService,
		private _toaster: ToastService
	) {}

	ngOnInit(): void {
		this.loadOperations();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onSelectOrder($event: any) {
		const state = $event.target._state;
		const selected = state.selected.trim();
		this.selectedOrderIds = selected
			.split(" ")
			.filter((id: string) => id.trim() !== "")
			.map((id: string) => Number(id));
	}

	loadOperations() {
		this.isLoading = true;
		const start = moment(this.startDate).format("YYYY-MM-DD");
		const end = moment(this.endDate).format("YYYY-MM-DD");
		let url = ` and status ne 'PROPOSED'`;
		if (this.showProposed) {
			url = ``;
		}
		this.commonService
			.get(
				`Machines(${this.machineId})?$expand=prodOrderPosOperations($orderBy=start asc;$filter=(end ge ${start} and start le ${end} and status ne 'DELETED' and status ne 'CLOSED'${url});$expand=tool,machine,prodOrderPos($expand=item,prodOrder))&$select=id,name,custom_id`
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.orders = [];
					this.machineName = `${res.custom_id} - ${res.name}`;
					this.orders = res.prodOrderPosOperations;
					for (let i = 0; i < this.orders.length; i++) {
						this.orders[i].start = moment.utc(this.orders[i].start).local().toDate();
						this.orders[i].end = moment.utc(this.orders[i].end).local().toDate();
					}

					this.orders.sort((a: any, b: any) => {
						return moment(a.start).isSame(moment(b.start))
							? moment(a.end).diff(moment(b.end))
							: moment(a.start).diff(moment(b.start));
					});

					const groups = this.getGroups();
					this.groups = structuredClone(groups);

					let groupCount: number = 0;
					groups.forEach((group: Set<number>) => {
						++groupCount;
						const _group = Array.from(group);
						_group.forEach((id: number) => {
							const index = this.orders.findIndex((order: any) => order.id === id);
							if (index > -1) {
								this.orders[index].belongsToGroup = true;
								this.orders[index].belongsToOrder = _group[0];
								this.orders[index].belongsToGroupId = groupCount;
							}
						});
					});

					this.isLoading = false;
				},
				error: () => {},
			});
	}

	formatTime(date?: any) {
		if (date) {
			return moment.utc(date).local().format("DD.MM.YYYY HH:mm");
		} else {
			return "";
		}
	}

	onChangeStartTime(value: any, order: any) {
		const index = this.orders.findIndex((x: any) => x.id === order.id);
		if (index > -1) {
			const parsedDate = moment(value, "DD.MM.YYYY HH:mm", true);
			if (!parsedDate.isValid()) {
				this._toaster.showToast($localize`Invalid date format`, "error");
				return;
			}
			const difference = moment(this.orders[index].end).diff(moment(this.orders[index].start));

			this.orders[index].start = parsedDate.format("YYYY-MM-DD HH:mm");

			this.orders[index].end = moment(this.orders[index].start)
				.add(difference)
				.format("YYYY-MM-DD HH:mm");
		}
	}

	async saveOrder() {
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];

		for (let i = 0; i < this.orders.length; i++) {
			if (this.orders[i].status === ProdOrderPosOperationStatus.IN_PRODUCTION) {
				continue;
			}
			const payload = {
				start: moment.utc(this.orders[i].start).format('YYYY-MM-DD HH:mm'),
				end: moment.utc(this.orders[i].end).format('YYYY-MM-DD HH:mm'),
			};
			const request = new ODataBatchCall(
				i,
				"patch",
				`\/odata\/ProdOrderPosOperations/${this.orders[i].id}`
			);

			request.body = payload;
			requests.push(request);
		}

		await new Promise((resolve, reject) => {
			this.commonService.post("$batch", { requests }).subscribe({
				next: () => {
					resolve(true);
					this.saveEvent();
					this.closeDialog();
				},
				error: error => {
					reject(false);
					this.saveEvent();
					this.closeDialog();
					console.log(error);
				},
			});
		});
	}

	combineOrder(order: any) {
		this.initialSelectedOrders = "";
		this.selectedParentOrder = order;
		this.selectedCombineOrders = [];
		this.forCombineOrders = [];
		this.group.clear();

		for (let i = 0; i < this.groups.length; i++) {
			const group = this.groups[i];
			if (group.has(order.id)) {
				this.group = structuredClone(group);
				break;
			}
		}

		this.forCombineOrders = this.orders
			.filter((order: any) => order.status !== ProdOrderPosOperationStatus.IN_PRODUCTION)
			.filter((item: any) => item.id !== order.id);

		this.initialSelectedOrders = [...this.group].join(" ");

		this.group.add(order.id);

		this.combineOrderDialog = true;
	}

	unlinkOrder(order: any) {
		order.start = moment(order.start).add(1, "seconds");
		order.belongsToGroup = undefined;
		order.belongsToOrder = undefined;

		for (let i = 0; i < this.groups.length; i++) {
			const group = this.groups[i];
			if (group.has(order.id)) {
				group.delete(order.id);
			}
		}
	}

	closeCombineOrderDialog() {
		this.initialSelectedOrders = "";
		this.group.clear();
		this.combineOrderDialog = false;
		this.forCombineOrders = [];
		this.selectedCombineOrders = [];
		this.selectedParentOrder = null;
	}

	getGroups() {
		if (this.orders.length > 0) {
			let startTime = this.orders[0].start;
			const groups: Set<number>[] = [];
			const group: Set<number> = new Set<number>();
			for (let i = 1; i < this.orders.length; ++i) {
				if (this.orders[i].status === ProdOrderPosOperationStatus.IN_PRODUCTION) {
					continue;
				}
				if (moment(startTime).isSame(moment(this.orders[i].start))) {
					if (!this.group.has(this.orders[i].id)) {
						group.add(this.orders[i].id);
					}
					if (!this.group.has(this.orders[i - 1].id)) {
						group.add(this.orders[i - 1].id);
					}
				} else {
					if (group.size > 0) {
						groups.push(structuredClone(group));
						group.clear();
					}
				}
				startTime = this.orders[i].start;
			}

			if (group.size > 0) {
				groups.push(structuredClone(group));
				group.clear();
			}

			return groups;
		}
		return [];
	}

	onSelectCombineOrder(event: any) {
		const state = event.target._state;
		const selected = state.selected.trim();
		const selectedIds = selected.split(" ").map(Number);
		this.selectedCombineOrders = [];

		this.group.clear();
		selectedIds.forEach((id: number) => this.group.add(id));
		this.group.add(this.selectedParentOrder.id);

		this.selectedCombineOrders = this.orders
			.filter((order: any) => order.status !== ProdOrderPosOperationStatus.IN_PRODUCTION)
			.filter((item: any) => this.group.has(item.id));
	}

	confirmCombineOrder() {
		let index = -1;
		for (let i = 0; i < this.groups.length; ++i) {
			const group = this.groups[i];
			if (group.has(this.selectedParentOrder.id)) {
				index = i;
			} else {
				this.group.forEach((id: number) => {
					if (group.has(id)) {
						group.delete(id);
					}
				});
			}
		}

		if (index > -1) {
			this.groups[index] = structuredClone(this.group);
		} else {
			this.groups.push(structuredClone(this.group));
		}

		let groupCount: number = 0;
		this.groups.forEach((group: Set<number>) => {
			++groupCount;
			const _group = Array.from(group);
			_group.forEach((id: number) => {
				const index = this.orders.findIndex((order: any) => order.id === id);
				if (index > -1) {
					this.orders[index].belongsToGroup = true;
					this.orders[index].belongsToOrder = _group[0];
					this.orders[index].belongsToGroupId = groupCount;
				}
			});
		});

		this.group.forEach((id: number) => {
			const index = this.orders.findIndex((order: any) => order.id === id);
			const difference = moment(this.orders[index].end).diff(moment(this.orders[index].start));
			if (index > -1) {
				this.orders[index].start = this.selectedParentOrder.start;
				this.orders[index].end = moment(this.orders[index].start).add(difference);
			}
		});

		this.orders.sort((a: any, b: any) => {
			return moment(a.start).isSame(moment(b.start))
				? moment(a.end).diff(moment(b.end))
				: moment(a.start).diff(moment(b.start));
		});

		this.closeCombineOrderDialog();
	}

	openOrderDetails(order: any) {
		this.selectedParentOrder = order;
		this.selectedItem = `${order.prodOrderPos.item.custom_id} - ${order.prodOrderPos.item.name}`;
		this.isOrderDetailsDialogOpen = true;
	}

	closeOrderDetails() {
		this.isOrderDetailsDialogOpen = false;
	}

	reSchedule() {
		if (this.orders.length > 0) {
			this.isLoading = true;
			const ids: number[] = [];
			for (let i = 0; i < this.orders.length; i++) {
				const index = this.selectedOrderIds.findIndex(
					(x: number) => x === this.orders[i].id
				);
				if (index > -1) {
					ids.push(this.orders[i].id);
				}
			}
			const firstOrder = this.orders.find((x: any) => x.id === ids[0]);
			const startTime = moment(firstOrder.start, "YYYY-MM-DD HH:mm", true)
				.utc()
				.format("YYYY-MM-DD HH:mm");

			const groups = this.groups.map((group: Set<number>) => Array.from(group));

			this.commonService
				.get(
					`capacity-plan/machine/${this.machineId}/re-schedule?operations=${ids}&start=${startTime}&groups=${JSON.stringify(groups)}`,
					false
				)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						for (let i = 0; i < res.length; i++) {
							const index = this.orders.findIndex((x: any) => x.id === res[i].id);
							if (index > -1) {
								this.orders[index].start = moment
									.utc(res[i].start)
									.local()
									.toDate();
								this.orders[index].end = moment.utc(res[i].end).local().toDate();
								this.needToSaveOrderIds.add(this.orders[index].id);
							}
							this.willBeSave = true;
						}
						this.isLoading = false;
					},
					error: () => {
						this.isLoading = false;
					},
					complete: () => {
						this.isLoading = false;
						this.group.clear();

						this.orders.sort((a: any, b: any) => {
							return moment(a.start).isSame(moment(b.start))
								? moment(a.end).diff(moment(b.end))
								: moment(a.start).diff(moment(b.start));
						});
					},
				});
		}
	}

	drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.orders, event.previousIndex, event.currentIndex);
	}

	openCreateOrderModal() {
		this.isNewOrderDialogOpen = true;
	}

	closeNewOrderDialog() {
		this.isNewOrderDialogOpen = false;
	}

	createOrder = () => {
		this.closeNewOrderDialog();
		this.loadOperations();
	};

	closeDialog() {
		this.showDialog = false;
		this.isLoading = false;
		if (this.closeEvent) {
			this.closeEvent();
		}
	}
}

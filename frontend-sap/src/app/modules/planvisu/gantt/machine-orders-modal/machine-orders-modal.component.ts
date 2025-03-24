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

	public groups: any[] = [];
	public group: Set<number> = new Set<number>();
	public inGroup: Map<number, any> = new Map<number, any>();
	public forCombineOrders: any = [];
	public combineOrders: any = [];
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
					for (let i = 0; i < groups.length; i++) {
						const group = groups[i];
						for (let j = 0; j < group.length; j++) {
							const id = group[j];
							const index = this.orders.findIndex((order: any) => order.id === id);
							if (index > -1) {
								this.orders[index].belongsToGroup = true;
								this.orders[index].belongsToOrder = group[0];
								this.orders[index].belongsToGroupId = i + 1;
							}
						}
					}

					this.isLoading = false;
				},
				error: () => {},
			});
	}

	formatTime(date?: any) {
		if (date) {
			return moment.utc(date).local().format("DD.MM.YYYY HH:mm:ss");
		} else {
			return "";
		}
	}

	onChangeStartTime(value: any, order: any) {
		const index = this.orders.findIndex((x: any) => x.id === order.id);
		if (index > -1) {
			const parsedDate = moment(value, "DD.MM.YYYY HH:mm:ss", true);
			if (!parsedDate.isValid()) {
				this._toaster.showToast($localize`Invalid date format`, "error");
				return;
			}
			this.orders[index].start = parsedDate.format("DD.MM.YYYY HH:mm:ss");
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
				start: moment.utc(this.orders[i].start).format(),
				end: moment.utc(this.orders[i].end).format(),
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
		this.combineOrders = [];
		this.forCombineOrders = [];
		this.group.add(order.id);

		const inGroup = new Set<number>();
		for (let i = 0; i < this.groups.length; ++i) {
			const group = this.groups[i];
			if (group.includes(this.selectedParentOrder.id)) {
				for (let j = 0; j < group.length; ++j) {
					const id = group[j];
					inGroup.add(id);
					const index = this.orders.findIndex((item: any) => item.id === id);
					if (index > -1) {
						if (this.selectedParentOrder.id !== this.orders[index].id) {
							this.forCombineOrders.push(this.orders[index]);
						}
						this.group.add(this.orders[index].id);
						this.initialSelectedOrders =
						`${this.initialSelectedOrders} ${this.orders[index].id}`.trim();
					}
				}
			}
		}

		for (let i = 0; i < this.orders.length; i++) {
			const id = this.orders[i].id;
			if (inGroup.has(id)) {
				continue;
			}
			if (this.selectedParentOrder.id !== id) {
				if (this.orders[i].status !== ProdOrderPosOperationStatus.IN_PRODUCTION) {
					this.forCombineOrders.push(this.orders[i]);
				}
			}
		}

		this.combineOrderDialog = true;
	}

	unlinkOrder(order: any) {
		order.start = moment(order.start).add(1, "seconds");
		order.belongsToGroup = undefined;
		order.belongsToOrder = undefined;

		for (let i = 0; i < this.groups.length; i++) {
			const group = this.groups[i];
			if (group.includes(order.id)) {
				const index = group.indexOf(order.id);
				if (index > -1) {
					group.splice(index, 1);
				}
			}
		}
	}

	closeCombineOrderDialog() {
		this.initialSelectedOrders = "";
		this.group.clear();
		this.combineOrderDialog = false;
	}

	getGroups() {
		if (this.orders.length > 0) {
			let startTime = this.orders[0].start;
			const groups: any[] = [];
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
						groups.push(Array.from(group));
						group.clear();
					}
				}
				startTime = this.orders[i].start;
			}

			if (group.size > 0) {
				groups.push(Array.from(group));
				group.clear();
			}

			return groups;
		}
		return [];
	}

	onSelectCombineOrder(event: any) {
		const state = event.target._state;
		const selected = state.selected.trim();
		const selectedIds = selected.split(" ");
		this.combineOrders = [];
		this.group.clear();
		this.group.add(this.selectedParentOrder.id);
		if (selectedIds.length > 0) {
			for (let i = 0; i < selectedIds.length; ++i) {
				const id = Number(selectedIds[i]);
				const order = this.forCombineOrders.find((x: any) => x.id === id);
				if (order) {
					if (order.status === ProdOrderPosOperationStatus.IN_PRODUCTION) {
						continue;
					}
					this.group.add(order.id);
					this.combineOrders.push(order);
				}
			}
		}
	}

	confirmCombineOrder() {
		for (let i = 0; i < this.combineOrders.length; ++i) {
			const index = this.orders.findIndex((x: any) => x.id === this.combineOrders[i].id);
			if (index > -1) {
				this.orders[index].start = this.selectedParentOrder.start;
				this.orders[index].end = this.selectedParentOrder.end;
			}

			if (!this.selectedOrderIds.find(id => id === this.combineOrders[i].id)) {
				this.selectedOrderIds.push(this.combineOrders[i].id);
			}
		}
		if (!this.selectedOrderIds.find(id => id === this.selectedParentOrder.id)) {
			this.selectedOrderIds.push(this.selectedParentOrder.id);
		}

		this.orders.sort((a: any, b: any) => {
			return moment(a.start).isSame(moment(b.start))
				? moment(a.end).diff(moment(b.end))
				: moment(a.start).diff(moment(b.start));
		});

		let populate = false;
		for (let i = 0; i < this.groups.length; ++i) {
			const group = this.groups[i];
			if (group.includes(this.selectedParentOrder.id)) {
				populate = true;
				this.groups[i] = structuredClone(this.selectedOrderIds);
				for (let j = 0; j < this.groups[i].length; ++i) {
					const id = this.groups[i][j];
					const index = this.orders.findIndex((x: any) => x.id === id);
					if (index > -1) {
						this.orders[index].belongsToGroup = true;
						this.orders[index].belongsToOrder = this.groups[i][0];
						this.orders[index].belongsToGroupId = i + 1;
					}
				}
			}
		}
		if (!populate) {
			this.groups.push(structuredClone(this.selectedOrderIds));
			for (let i = 0; i < this.selectedOrderIds.length; ++i) {
				const id = this.selectedOrderIds[i];
				const index = this.orders.findIndex((x: any) => x.id === id);
				if (index > -1) {
					this.orders[index].belongsToGroup = true;
					this.orders[index].belongsToOrder = this.selectedOrderIds[0];
					this.orders[index].belongsToGroupId = this.groups.length;
				}
			}
		}

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

	reSchedule(group?: number[]) {
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
			const startTime = moment(firstOrder.start, "DD.MM.YYYY HH:mm:ss", true)
				.utc()
				.format("YYYY-MM-DD HH:mm:ss");

			this.commonService
				.get(
					`capacity-plan/machine/${this.machineId}/re-schedule?operations=${ids}&start=${startTime}&groups=${JSON.stringify(this.groups)}`,
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

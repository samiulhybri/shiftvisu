import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import moment from "moment";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Capacity } from "@app/shared/models/capacity.model";
import { arrayMove } from "@app/shared/utils/array-move";
import { ProductionPlanningPageName } from "@app/shared/enums/ProductionPlanningPageName";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { Machine } from "@app/shared/models/machine.model";

export class Hall implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_enabled_plan_visu?: boolean = false;
	is_active?: boolean = true;
	production_planning_page?: ProductionPlanningPageName = ProductionPlanningPageName.DEFAULT;
	machineGroup: MachineGroup[] = [];
	isUsed: boolean = false;
	is_enabled_statusboard?: boolean = false;
	is_imported_from_erp: boolean = false;
	changes?: ProdOrderPosOperation[] = [];
	startDateFilterValue: string | null = null;
	tableDate?: string;
	frozen_zone_before_days?: number | undefined;
	frozen_zone_after_weeks?: number | undefined;
	capacities: Capacity[] = [];
	machines: Machine[] = [];
	public dates: string[] = [];
	isSelected = true; //internal use only
	private isForge = false;
	private _quantityFilter = "";
	private _operationNameFilter = "";
	private _productTypeFilter = "";
	private _linkedOperationFilter = "";
	private _backlogOrderFilter = "";

	constructor() {}

	get quantityFilter() {
		return this._quantityFilter;
	}

	set quantityFilter(quantity: string) {
		this._quantityFilter = quantity;
	}

	get linkedOperation() {
		return this._linkedOperationFilter;
	}

	set linkedOperation(linkedOperationFilter: string) {
		this._linkedOperationFilter = linkedOperationFilter;
	}

	get operationNameFilter() {
		return this._operationNameFilter;
	}

	set operationNameFilter(operationName: string) {
		this._operationNameFilter = operationName;
	}

	get productTypeFilter() {
		return this._productTypeFilter;
	}

	set productTypeFilter(productTypeFilter: string) {
		this._productTypeFilter = productTypeFilter;
	}

	get backlogOrderFilter() {
		return this._backlogOrderFilter;
	}

	set backlogOrderFilter(backlogOrderFilter: string) {
		this._backlogOrderFilter = backlogOrderFilter;
	}

	getOrders() {
		const orders: ProdOrder[] = [];
		this.machineGroup.forEach(machineGroup => {
			if (machineGroup.isSelected) {
				machineGroup.prodOrderPosOperations.forEach(prodOrderPosOperation => {
					const order = orders.find(
						order => order.id == prodOrderPosOperation.prodOrderPos?.prodOrder!.id
					);

					if (!order) {
						orders.push(prodOrderPosOperation.prodOrderPos?.prodOrder!);
					}
				});
			}
		});

		return orders;
	}

	getBacklogList(): ProdOrderPosOperation[] {
		const backlogList: ProdOrderPosOperation[] = [];
		for (let machineGroup of this.machineGroup) {
			for (let prodOrderPosOperation of machineGroup.prodOrderPosOperations) {
				if (
					prodOrderPosOperation.show_in_planvisu &&
					(prodOrderPosOperation.plan_start == null ||
						prodOrderPosOperation.plan_machine_id == null)
				) {
					if (
						this.startDateFilterValue != null &&
						this.startDateFilterValue != "" &&
						moment(prodOrderPosOperation.start).toDate().getTime() >
							moment(this.startDateFilterValue).add(1, "days").toDate().getTime()
					)
						continue;

					if (
						this._quantityFilter &&
						this._quantityFilter !=
							prodOrderPosOperation!.prodOrderPos!.quantity?.toString()
					)
						continue;
					if (
						this._linkedOperationFilter &&
						!prodOrderPosOperation
							.prodOrderPos!.calculation?.note_linked_operations?.toString()
							.toLocaleLowerCase()
							.includes(this._linkedOperationFilter.toLocaleLowerCase())
					)
						continue;
					if (
						this._operationNameFilter &&
						!prodOrderPosOperation.name
							?.toString()
							.toLocaleLowerCase()
							.includes(this._operationNameFilter.toLocaleLowerCase())
					)
						continue;
					if (
						this._productTypeFilter &&
						!prodOrderPosOperation.prodOrderPos?.calculation?.offerPos?.product_type
							?.toString()
							.toLocaleLowerCase()
							.includes(this._productTypeFilter.toLocaleLowerCase())
					)
						continue;

					if (
						this._backlogOrderFilter &&
						!prodOrderPosOperation.prodOrderPos?.prodOrder?.custom_id
							?.toString()
							.toLocaleLowerCase()
							.includes(this._backlogOrderFilter.toLocaleLowerCase())
					)
						continue;

					if (!machineGroup.isSelected) {
						continue;
					}

					backlogList.push(prodOrderPosOperation);
				}
			}
		}
		this.sortBacklogList(backlogList);

		return backlogList;
	}

	sortBacklogList(backlogList: ProdOrderPosOperation[]) {
		backlogList = backlogList.sort((a, b) => parseInt(a.pos!) - parseInt(b.pos!));

		backlogList = backlogList.sort(
			(a, b) => a!.prodOrderPos!.prodOrder!.id! - b!.prodOrderPos!.prodOrder!.id!
		);
	}

	getBacklogListForge(
		selectedMachineGroup: string,
		selectedMachine: string
	): ProdOrderPosOperation[] {
		const backlogList: ProdOrderPosOperation[] = [];
		for (let machineGroup of this.machineGroup) {
			for (let prodOrderPosOperation of machineGroup.prodOrderPosOperations) {
				if (
					(selectedMachineGroup == machineGroup.id?.toString() &&
						!prodOrderPosOperation.machine_id) ||
					selectedMachine == prodOrderPosOperation.machine_id?.toString()
				) {
					if (
						prodOrderPosOperation.show_in_planvisu &&
						(prodOrderPosOperation.plan_start == null ||
							prodOrderPosOperation.plan_machine_id == null)
					) {
						if (
							this.startDateFilterValue != null &&
							this.startDateFilterValue != "" &&
							moment(prodOrderPosOperation.start).toDate().getTime() >
								moment(this.startDateFilterValue).add(1, "days").toDate().getTime()
						)
							continue;

						backlogList.push(prodOrderPosOperation);
					}
				}
			}
		}

		return backlogList;
	}

	moveToBacklog(id: number, hallCopy: any) {
		for (let machineGroup of this.machineGroup) {
			for (let prodOrderPosOperation of machineGroup.prodOrderPosOperations) {
				if (prodOrderPosOperation.id != id) continue;
				if (
					moment(this.dates[0]).toDate().getTime() >
					moment(prodOrderPosOperation.plan_start!).toDate().getTime()
				)
					continue;

				const hall = new Hall().deserialize(JSON.parse(JSON.stringify(hallCopy)));
				const mg = hall.machineGroup.find(mg =>
					mg.prodOrderPosOperations.some(
						pOperaiton => pOperaiton.id == prodOrderPosOperation.id
					)
				);

				const operation = mg!.prodOrderPosOperations.find(
					pOperaiton => pOperaiton.id == prodOrderPosOperation.id
				);

				if (operation?.machine_id && operation.plan_machine_id) {
					prodOrderPosOperation.plan_machine_id = null;
					prodOrderPosOperation.machine_id = null;
					prodOrderPosOperation.plan_start = prodOrderPosOperation.erp_start;
					prodOrderPosOperation.start = prodOrderPosOperation.erp_start;
					prodOrderPosOperation.plan_end = prodOrderPosOperation.erp_end;
					prodOrderPosOperation.end = prodOrderPosOperation.erp_end;
					prodOrderPosOperation.status = "";

					this.addChanges(prodOrderPosOperation);
					continue;
				} else {
					prodOrderPosOperation = operation!;
					prodOrderPosOperation.plan_machine_id = null;
					prodOrderPosOperation.machine_id = null;
					prodOrderPosOperation.plan_start = prodOrderPosOperation.erp_start;
					prodOrderPosOperation.start = prodOrderPosOperation.erp_start;
					prodOrderPosOperation.plan_end = prodOrderPosOperation.erp_end;
					prodOrderPosOperation.end = prodOrderPosOperation.erp_end;
					prodOrderPosOperation.status = "";
					this.machineGroup.forEach(mg => {
						mg.prodOrderPosOperations.forEach((op, i) => {
							if (op.id == operation!.id) {
								mg.prodOrderPosOperations.splice(i, 1);
							}
						});
					});

					this.machineGroup.forEach(mg => {
						if (mg.id == operation!.machine_group_id) {
							mg.prodOrderPosOperations.push(operation!);
						}
					});
					this.addChanges(prodOrderPosOperation);
				}
			}
		}
	}

	addChanges(prodOrderPosOperation: ProdOrderPosOperation) {
		const index = this.changes?.findIndex(
			(data: ProdOrderPosOperation) => data.id == prodOrderPosOperation.id
		);
		if (index != -1) {
			this.changes?.splice(index!, 1);
		}

		if (
			prodOrderPosOperation.oldMachineId === prodOrderPosOperation.plan_machine_id &&
			prodOrderPosOperation.oldStart === prodOrderPosOperation.plan_start
		)
			return; // tile is moving A to B and B to A

		this.changes!.push(prodOrderPosOperation);
	}

	moveToMachine(
		machineId: number,
		prodOrderPosOperationId: string,
		machinegroupId: number,
		date: string,
		index: number
	) {
		this.machineGroup.forEach((machineGroup, i) => {
			for (let i = 0; i < machineGroup.prodOrderPosOperations.length; i++) {
				const prodOrderPosOperation = machineGroup.prodOrderPosOperations[i];
				if (prodOrderPosOperation.id != parseInt(prodOrderPosOperationId)) continue;

				prodOrderPosOperation.plan_machine_id = machineId;
				prodOrderPosOperation.machine_id = machineId;
				prodOrderPosOperation.plan_start = date;
				prodOrderPosOperation.start = date;
				prodOrderPosOperation.machine_group_id = machinegroupId;
				prodOrderPosOperation.status = ProdOrderPosOperationStatus.PLANNED;

				if (machineGroup.id != machinegroupId) {
					const currentOperation = prodOrderPosOperation;
					machineGroup.prodOrderPosOperations.splice(i, 1);

					this.machineGroup.forEach(machineGroup2 => {
						if (machineGroup2.id == machinegroupId) {
							machineGroup2.prodOrderPosOperations.push(currentOperation);
							this.planDateReArranging(
								index,
								date,
								currentOperation.id!,
								machineGroup2
							);
						}
					});
				} else {
					this.planDateReArranging(index, date, prodOrderPosOperation.id, machineGroup);
				}

				return;
			}
		});
	}

	planDateReArranging(
		index: number,
		date: string,
		prodOrderPosOperationId: number,
		machineGroup: MachineGroup
	) {
		let prodOrderOperations = machineGroup.prodOrderPosOperations
			.filter(
				(prodOrderPosOperation: ProdOrderPosOperation) =>
					moment(prodOrderPosOperation.plan_start).format("MMM DD, yyyy") == date
			)
			.sort(
				(a, b) =>
					moment(a.plan_start!).toDate().getTime() -
					moment(b.plan_start!).toDate().getTime()
			);

		const acutalIndex = prodOrderOperations.findIndex(
			prodOrderPosOperation => prodOrderPosOperation.id == prodOrderPosOperationId
		);
		prodOrderOperations = arrayMove(prodOrderOperations, acutalIndex, index);

		let lastTime: string = moment(date).format("YYYY-MM-DD HH:mm:ss");

		for (let prodOrderOperation of prodOrderOperations) {
			if (!prodOrderOperation) continue;
			prodOrderOperation.plan_start = lastTime;
			prodOrderOperation.start = lastTime;
			prodOrderOperation.plan_end = moment(lastTime)
				.add((prodOrderOperation.te!*prodOrderOperation.prodOrderPos?.quantity!), "seconds")
				.format("YYYY-MM-DD HH:mm:ss");
			prodOrderOperation.end = prodOrderOperation.plan_end;
			lastTime = prodOrderOperation.plan_end!;
			prodOrderOperation.is_changed = true;

			this.addChanges(prodOrderOperation);
		}
	}

	resetDate(isWeek: boolean) {
		this.dates = [];

		let j = 0;

		for (let i = 0; i < Infinity; i++) {
			if (
				moment().add(i, "days").format("MMM DD, yyyy") ==
				moment(this.tableDate).add(1, "days").format("MMM DD, yyyy")
			)
				break;

			if (isWeek) {
				if (
					this.capacities.find(
						(capacity: Capacity) =>
							moment().add(i, "days").format("MMM DD, yyyy") ==
							moment(capacity.date).format("MMM DD, yyyy")
					)
				) {
					this.dates.push(moment().add(i, "days").format("MMM DD, yyyy"));
					j++;
					continue;
				}
			} else {
				if (
					this.capacities.find(
						(capacity: Capacity) =>
							moment(this.tableDate).format("MMM DD, yyyy") ==
							moment(capacity.date).format("MMM DD, yyyy")
					)
				) {
					this.dates.push(moment(this.tableDate).format("MMM DD, yyyy"));
				}
				break;
			}
		}
	}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.machineGroup) {
			this.machineGroup = input.machineGroup.map((data: any) =>
				new MachineGroup().deserialize(data)
			);
		}

		if (input.machines) {
			this.machines = input.machines.map((data: any) => new Machine().deserialize(data));
		}

		if (input.capacities) {
			this.capacities = input.capacities.map((data: any) => new Capacity().deserialize(data));
		}

		if (input.topMachine) {
			this.isUsed = true;
		}

		if (input.changes) {
			this.changes = input.changes; // special case and correct
		}

		if (input.isForge) this.isForge = input.isForge;

		this.tableDate = moment()
			.add(input.isForge ? 0 : 5, "days")
			.format("MMM DD, yyyy");

		return this;
	}

	getStatus(prodOrderOperation: ProdOrderPosOperation) {
		let operations: ProdOrderPosOperation[] = [];
		const id = prodOrderOperation.prod_order_pos_id;
		this.machineGroup.forEach((machineGroup: MachineGroup) => {
			const data = machineGroup.prodOrderPosOperations.filter(
				operation => operation.prod_order_pos_id == id
			);
			operations = [...operations, ...data];
		});

		operations = operations.sort((a, b) => parseInt(a.pos!) - parseInt(b.pos!));

		for (let i = 0; i < operations.length - 1; i++) {
			if (
				(operations[i].plan_end ? moment(operations[i].plan_end).toDate().getTime() : 0) ==
				(operations[i + 1].plan_start
					? moment(operations[i + 1].plan_start)
							.toDate()
							.getTime()
					: 0)
			)
				continue;
			if (
				operations[i].plan_end &&
				operations[i + 1].plan_start &&
				(operations[i].plan_end
					? moment(operations[i].plan_end).toDate().getTime() + 1
					: 0) >
					(operations[i + 1].plan_start
						? moment(operations[i + 1].plan_start)
								.toDate()
								.getTime()
						: 0) &&
				operations[i + 1].plan_machine_id
			) {
				return "Error";
			}
		}

		return "Success";
	}

	calculateCapacityByDate(date: string) {
		const capacities = this.capacities.filter(capacity => capacity.date == date);

		let hours = 0;
		capacities.forEach(capacity => {
			hours += (capacity.shift!.hours ?? 0) - (capacity.shift!.break_minutes ?? 0) / 60;
		});

		return hours;
	}

	toOdata(): Object {
		return {
			...this,
			changes: undefined,
			startDateFilterValue: undefined,
			capacities: undefined,
			dates: undefined,
			tableDate: undefined,
			isForge: undefined,
			isSelected: undefined,
			isUsed: undefined,
			_quantityFilter: undefined,
			_operationNameFilter: undefined,
			_productTypeFilter: undefined,
			_linkedOperationFilter: undefined,
			_backlogOrderFilter: undefined,
			machines: undefined,
		};
	}
}

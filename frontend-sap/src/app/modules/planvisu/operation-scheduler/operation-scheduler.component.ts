import { Component, Input } from "@angular/core";

import moment from "moment";
import { firstValueFrom, lastValueFrom, Subject, takeUntil } from "rxjs";

import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import {
	MachineConstraintType,
	MachineConstraintTypeClass,
} from "@app/shared/enums/MachineConstraintType";

@Component({
	selector: "app-operation-scheduler",
	templateUrl: "./operation-scheduler.component.html",
	styleUrl: "./operation-scheduler.component.css",
})
export class OperationSchedulerComponent {
	@Input() orderId?: number;
	@Input() closeEvent: any;
	@Input() saveEvent: any;

	public localization = Localization;
	public prodOrderPosOperationStatus = ProdOrderPosOperationStatus;
	public operationCustomId: string = "";
	public selectedDeleteType: string = "";
	public selectedOperation: any = {};
	public constraints: any[] = MachineConstraintTypeClass.getEnumArray();

	public isOperationDataChanged: boolean = false;
	public isLoading: boolean = false;
	public willBeSave: boolean = false;
	public isDeleteModalOpen: boolean = false;

	public prodOrderPos: any = [];
	public selectedOperationsIds: any = [];
	public machineConstraintType = MachineConstraintType;
	public needToPositionIds: Set<number> = new Set<number>();
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

	loadOperations() {
		this.isLoading = true;
		this.commonService
			.get(
				`ProdOrders(${this.orderId})?$expand=prodOrderPos($expand=prodOrderPosOperations($expand=machine),item)`
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.operationCustomId = res.custom_id;
					this.prodOrderPos = [];
					this.prodOrderPos = res.prodOrderPos;
					for (let i = 0; i < this.prodOrderPos.length; i++) {
						this.prodOrderPos[i].start = moment
							.utc(this.prodOrderPos[i].start)
							.local()
							.toDate();

						this.prodOrderPos[i].end = moment
							.utc(this.prodOrderPos[i].end)
							.local()
							.toDate();

						this.prodOrderPos[i].due_date = moment
							.utc(this.prodOrderPos[i].due_date)
							.local()
							.toDate();

						this.prodOrderPos[i].release_date = moment
							.utc(this.prodOrderPos[i].release_date)
							.local()
							.toDate();
					}

					this.prodOrderPos.sort((a: any, b: any) => {
						return moment(a.start).isSame(moment(b.start))
							? moment(a.due_date).diff(moment(b.due_date))
							: moment(a.start).diff(moment(b.start));
					});

					for (let i = 0; i < this.prodOrderPos.length; i++) {
						this.prodOrderPos[i].prodOrderPosOperations.sort(
							(a: any, b: any) => a.pos - b.pos
						);
					}

					this.isLoading = false;
				},
				error: () => {
					this.isLoading = false;
				},
			});
	}

	deleteSelectedData() {
		if (this.selectedDeleteType == "order") {
			this.commonService.delete(`ProdOrders(${this.orderId})`).subscribe({
				next: () => {
					this._toaster.showToast(this.localization.recordDeleted, "success");
					this.isDeleteModalOpen = false;
					this.saveEvent();
				},
				error: err => {
					this._toaster.showToast($localize`Something went wrong`, "error");
				},
			});
		} else {
			this.commonService
				.delete(`ProdOrderPosOperations(${this.selectedOperation.id})`)
				.subscribe({
					next: () => {
						this._toaster.showToast(this.localization.recordDeleted, "success");
						this.isDeleteModalOpen = false;
						this.selectedOperation = undefined;
						this.isOperationDataChanged = true;
						this.loadOperations();
					},
					error: err => {
						this._toaster.showToast($localize`Something went wrong`, "error");
					},
				});
		}
	}

	onChangeConstraint($event: any) {
		const operationId = parseInt($event?.detail?.item?.id);
		for (const pos of this.prodOrderPos) {
			const index = pos.prodOrderPosOperations.findIndex((op: any) => op.id === operationId)
			if (index > -1) {
				pos.prodOrderPosOperations[index].constraint_type = this.getStateValue($event?.detail?.item?.text);
				break;
			}
		}
	}

	deleteModalOpen(type: string, operation = {}) {
		this.selectedDeleteType = type;
		if (type == "operation") {
			this.selectedOperation = operation;
		}
		this.isDeleteModalOpen = true;
	}

	getStateTranslate(state: MachineConstraintType): string {
		return MachineConstraintTypeClass.getStateTranslate(state);
	}

	getStateValue(state: MachineConstraintType): string {
		return MachineConstraintTypeClass.getStateValue(state);
	}

	async updateAllOperationsStartAndEnd(pos: any) {
		const operations = pos.prodOrderPosOperations.filter(
			(operation: any) =>
				operation.status !== this.prodOrderPosOperationStatus.IN_PRODUCTION
		);

		const apiCalls = operations.map(async (operation: any) => {
			try {
				const duration =
					(operation.te / (operation.cavity ? operation.cavity : 1)) * pos.quantity;

				const formattedStart = encodeURIComponent(moment(operation.start).toISOString());

				const url = `capacity-plan/machine/${operation.machine.id}?start=${formattedStart}&duration=${duration}`;

				const res: any = await lastValueFrom(this.commonService.get(url, false));

				if (res) {
					operation.end = moment.utc(res.end).local().toDate();
				}
			} catch (error) {
				console.error(`Error updating operation ${operation.id}:`, error);
			}
		});

		await Promise.allSettled(apiCalls);
	}

	async reSchedule() {
		if (this.isLoading) return;
		this.isLoading = true;

		try {
			const apiCalls = this.selectedPositions.map(async (positionId: number) => {
				const pos = this.prodOrderPos.find((x: any) => x.id === positionId);
				if (!pos) return;

				pos.prodOrderPosOperations.map((operation: any) => {
					operation.te = Number(operation.te);
					operation.cavity = Number(operation.cavity);
					operation.lead_time_days = Number(operation.lead_time_days);
					operation.send_ahead_quantity = Number(operation.send_ahead_quantity);
				});

				await this.updateAllOperationsStartAndEnd(pos);

				const reSchedulableOperations = pos.prodOrderPosOperations.filter(
					(operation: any) =>
						operation.status !== this.prodOrderPosOperationStatus.IN_PRODUCTION &&
						(operation.constraint_type === this.machineConstraintType.MANUAL ||
							operation.constraint_type === this.machineConstraintType.CONSTRAINT)
				);

				const operationRequests = reSchedulableOperations.map(async (operation: any) => {
					try {
						const data = {
							pos: operation.pos,
							machine_id: operation.machine_id,
							start: moment(operation.start).toISOString(),
							operations: pos.prodOrderPosOperations,
							quantity: pos.quantity,
							constraint_type: operation.constraint_type,
						};

						const res: any = await lastValueFrom(
							this.commonService.post(
								"plan_visu/constrainged_operation_date",
								data,
								false
							)
						);

						if (res) {
							res.forEach((result: any) => {
								const index = pos.prodOrderPosOperations.findIndex(
									(x: any) => x.pos === result.pos
								);
								if (index > -1) {
									pos.prodOrderPosOperations[index].start = moment
										.utc(result.start)
										.local()
										.toDate();
									pos.prodOrderPosOperations[index].end = moment
										.utc(result.end)
										.local()
										.toDate();
								}
								this.needToPositionIds.add(pos.id);
							});

							this.willBeSave = true;

							const index = this.prodOrderPos.findIndex((x: any) => x.id === pos.id);
							if (index > -1) {
								this.prodOrderPos[index] = { ...pos };
							}
						}
					} catch (error) {
						console.error(`Error processing operation ${operation.pos}:`, error);
					}
				});

				return Promise.all(operationRequests);
			});

			await Promise.allSettled(apiCalls);
		} catch (error) {
			console.error("Error in reSchedule:", error);
		} finally {
			this.isLoading = false;
		}
	}

	onChangeStartTime(value: any, operation: any) {
		const parsedDate = moment(value, "DD.MM.YYYY HH:mm", true);
		if (!parsedDate.isValid()) {
			this._toaster.showToast($localize`Invalid date format`, "error");
			return;
		}
		operation.start = parsedDate.format();
	}

	public selectedPositions: number[] = [];

	onSelectOrder($event: any, pos: any) {
		const state = $event.target._state;
		const selected = state.selected.trim();
		const ids = selected
			.split(" ")
			.filter((id: string) => id.trim() !== "")
			.map((id: string) => Number(id));

		const index = this.selectedPositions.findIndex((x: number) => x === pos.id);
		if (index > -1) {
			this.selectedPositions.splice(index, 1);
		} else {
			this.selectedPositions.push(pos.id);
		}
	}

	async saveOrder() {
		this.isLoading = true;

		try {
			const apiCalls = this.prodOrderPos
				.filter((pos: any) => this.selectedPositions.includes(pos.id))
				.map(async (pos: any) => {
					const requests: ODataBatchCall[] = pos.prodOrderPosOperations.map(
						(operation: any, index: number) => {
							const payload = {
								constraint_type: operation.constraint_type,
								start: moment(operation.start).toISOString(),
								end: moment(operation.end).toISOString(),
								te: operation.te,
								cavity: operation.cavity,
								lead_time_days: operation.lead_time_days,
								send_ahead_quantity: operation.send_ahead_quantity,
							};

							const request = new ODataBatchCall(
								index,
								"patch",
								`/odata/ProdOrderPosOperations/${operation.id}`
							);
							request.body = payload;
							return request;
						}
					);

					return lastValueFrom(this.commonService.post("$batch", { requests }));
				});

			await Promise.allSettled(apiCalls);

			this.saveEvent();
			this.closeDialog();
		} catch (error) {
			console.error("Error saving order:", error);
		} finally {
			this.isLoading = false;
		}
	}

	closeDialog() {
		this.isLoading = false;
		if (this.closeEvent) {
			this.isOperationDataChanged ? this.saveEvent() : this.closeEvent();
			this.isOperationDataChanged = false;
		}
	}
}

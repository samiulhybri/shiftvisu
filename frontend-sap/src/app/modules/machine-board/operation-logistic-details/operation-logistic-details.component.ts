import { Component, Input, OnDestroy, OnInit } from "@angular/core";

import { delay, expand, forkJoin, interval, of, Subject, timer } from "rxjs";
import { catchError, concatMap, debounce, switchMap, takeUntil, tap } from "rxjs/operators";

import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { DataService } from "@app/shared/services/data.service";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import PackagingInstructionPos from "@app/shared/models/packaging-instruction-pos.model";
import PackagingInstruction from "@app/shared/models/packaging-instruction.model";
import { Item } from "@app/shared/models/item.model";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { ProdOrderPosOperationHandlingUnitType } from "@app/shared/enums/ProdOrderPosOperationHandlingUnitType";
import Stock from "@app/shared/models/stock.models";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";

@Component({
	selector: "app-operation-logistic-details",
	templateUrl: "./operation-logistic-details.component.html",
	styleUrl: "./operation-logistic-details.component.css",
})
export class OperationLogisticDetailsComponent implements OnInit, OnDestroy {
	public quantityProposed: number = 0;
	public quantityPerHu: number = 0;
	public quantityInHu: number = 0;
	public nextStop: number = 0;
	public quantityPerParentHU: number = 0;
	public quantityInParentHU: number = 0;

	private destroy$ = new Subject<void>();

	@Input() machine?: Machine;
	@Input() operationId?: number = 0;
	selectedOrderDetails: OrderDetails | null = null;
	packagingInstructions: PackagingInstruction[] = [];
	initialPackagingInstructions: PackagingInstruction[] = [];
	selectedItemId: string = "";

	top: number = 200;
	selectedItemName: any;
	selectedItem: any;
	savedHandlingUnits: any;
	selectedHandlingUnit: any;
	selectedHandlingUnitForParent: any;
	packagingPositionData: Stock[] = [];
	private inProgress: boolean = true;

	logisticsData = {
		quantityProposed: 0,
		quantityPerHu: 0,
		quantityInHu: 0,
		nextStop: 0,
		quantityPerParentHU: 0,
		quantityInParentHU: 0,
	};

	constructor(
		private commonService: CommonService,
		private dataService: DataService,
		private machineboardService: MachineboardService
	) {}

	ngOnInit(): void {
		const polling = timer(0, 3000).pipe(
			takeUntil(this.destroy$),
			debounce(() => of(this.inProgress)),
			tap(() => {
				this.inProgress = true;
			}),
			concatMap(() =>
				forkJoin([
					this.getQuantityPerHu().pipe(
						takeUntil(this.destroy$),
						catchError(err => {
							return of(null);
						})
					),
					this.getQuantityInHu().pipe(
						takeUntil(this.destroy$),
						catchError(err => {
							return of(null);
						})
					),
					this.getQuantityProposed().pipe(
						takeUntil(this.destroy$),
						catchError(err => {
							return of(null);
						})
					),
				])
			),
			tap(() => {
				this.getNextStop();
			}),
			switchMap(() => timer(3000)),
			tap(() => {
				this.inProgress = false;
			})
		);

		polling.subscribe({
			next: () => {},
			error: err => console.error("Polling error:", err),
			complete: () => {
				this.destroy$.next();
				this.destroy$.complete();
			},
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getQuantityProposed() {
		return this.commonService.get(`quantity/${this.machine?.id}`, false).pipe(
			takeUntil(this.destroy$),
			tap((response: any) => {
				const proposedQuantitiesForMachine = (response.proposed_quantities as []) ?? [];
				if (proposedQuantitiesForMachine.length > 0) {
					const operation = proposedQuantitiesForMachine.find(
						(item: any) => item.prod_order_pos_operation_id == this.operationId
					);
					if (operation) {
						const quantity = operation["sum"];
						this.quantityProposed = Number(quantity ?? "0");

						this.logisticsData.quantityProposed = this.quantityProposed;
						this.machineboardService.sendLogisticsData(this.logisticsData);
					}
				}
			})
		);
	}

	getSavedNextPackaging() {
		if (this.selectedOrderDetails) {
			return this.commonService
				.get(
					`MachineProdOrderPosOperationTimes?$filter=machine_id eq ${this.machine?.id} and prod_order_pos_operation_id eq ${this.selectedOrderDetails?.id} and end eq null&$expand=itemPackaging,packagingInstruction,packagingInstructionParent($expand=packagingInstructionPos,handlingUnits),itemPackagingParent`
				)
				.pipe(
					takeUntil(this.destroy$),
					tap((res: any) => {
						const machineOperationTimes = res.value;
						if (machineOperationTimes.length) {
							const nextPackagingInstruction =
								machineOperationTimes[0].packagingInstruction;
							const nextPackagingItem = machineOperationTimes[0].itemPackaging;

							if (nextPackagingItem) {
								this.selectedItemName = nextPackagingItem.name;
								this.selectedItem = new Item().deserialize({
									id: nextPackagingItem.id,
									name: nextPackagingItem.name,
									custom_id: nextPackagingItem.custom_id,
								});
							}

							const savedPackagingInstructionParent =
								machineOperationTimes?.[0]?.packagingInstructionParent?.packagingInstructionPos?.find(
									(packagingInstructionPos: PackagingInstructionPos) =>
										packagingInstructionPos.is_container == false &&
										packagingInstructionPos.packable_type ==
											BackendModelType.PACKAGING_INSTRUCTION
								);

							const savedPackaging = this.packagingInstructions.find(
								el => el.id === nextPackagingInstruction?.id
							);

							this.quantityPerParentHU =
								savedPackagingInstructionParent?.target_quantity ?? 0;

							this.quantityPerHu = savedPackaging
								? Number(savedPackaging?.targetQuantity ?? "0")
								: 0;

							this.logisticsData.quantityPerParentHU = this.quantityPerParentHU;
							this.logisticsData.quantityPerHu = this.quantityPerHu;
							this.machineboardService.sendLogisticsData(this.logisticsData);
						}
					})
				);
		}

		return of(null);
	}

	getQuantityPerHu() {
		return of(this.dataService.selectedOrderDetailRaw).pipe(
			takeUntil(this.destroy$),
			switchMap(res => {
				if (res) {
					this.selectedOrderDetails = res.value;
					this.selectedItemId = this.selectedOrderDetails!.itemImageId;
					const query = `packable_type=${BackendModelType.ITEM}&packable_id=${this.selectedItemId}&$top=${this.top}`;

					return this.commonService.get(`packaging-instruction-pos?${query}`, false);
				}

				return of(null);
			}),
			switchMap((res: any) => {
				if (res) {
					const packagingInstructionPos = res as PackagingInstructionPos[];
					if (packagingInstructionPos.length) {
						const uniquePackagingInstPos = Object.values(
							packagingInstructionPos.reduce((acc: any, item: any) => {
								if (!acc[item.packaging_instruction_id]) {
									acc[item.packaging_instruction_id] = item;
								}
								return acc;
							}, {})
						) as PackagingInstructionPos[];

						this.packagingInstructions = uniquePackagingInstPos.map(res => {
							const packagingInstructionContent = packagingInstructionPos.find(
								(pos: PackagingInstructionPos) =>
									pos.is_container === false &&
									pos.packaging_instruction_id === res.packagingInstruction.id
							);
							let targetedQuantity: number = 0;
							if (packagingInstructionContent) {
								targetedQuantity = packagingInstructionContent.target_quantity!;
							}
							return new PackagingInstruction().deserialize({
								...res.packagingInstruction,
								targetQuantity: targetedQuantity,
							});
						});
						this.initialPackagingInstructions = [...this.packagingInstructions];
					}
					return this.getSavedNextPackaging();
				}
				return of(null);
			})
		);
	}

	getStockPosData() {
		return this.commonService
			.get(
				`stock/stocks?positionable_id=${this.selectedHandlingUnit?.id}&positionable_type=${BackendModelType.HANDLINGUNIT}`,
				false
			)
			.pipe(
				takeUntil(this.destroy$),
				tap((res: any) => {
					const mappedStocks = res.map((el: any) =>
						new Stock().deserialize(el)
					) as Stock[];
					this.quantityInHu = 0;
					for (let index = 0; index < mappedStocks.length; ++index) {
						if (mappedStocks[index].quantity) {
							this.quantityInHu += Number(mappedStocks[index].quantity ?? "0");
						}
					}

					this.quantityInHu = this.quantityPerHu > 0 ? this.quantityInHu : 0;

					this.logisticsData.quantityInHu = this.quantityInHu;
					this.machineboardService.sendLogisticsData(this.logisticsData);

					this.getStockDataForParent();
				})
			);
	}

	getStockDataForParent() {
		this.commonService
			.get(
				`stock/stocks?positionable_id=${this.selectedHandlingUnitForParent?.id}&positionable_type=${BackendModelType.HANDLINGUNIT}`,
				false
			)
			.subscribe({
				next: (res: any) => {
					const count =
						res?.filter(
							(stock: Stock) => stock.stockable_type === BackendModelType.HANDLINGUNIT
						)?.length ?? 0;

					this.quantityInParentHU = count;

					this.logisticsData.quantityInParentHU = this.quantityInParentHU;
					this.machineboardService.sendLogisticsData(this.logisticsData);
				},
				error: err => console.error(err),
			});
	}

	getQuantityInHu() {
		if (!this.quantityPerHu && !this.quantityPerParentHU) {
			this.quantityInParentHU = 0;
			this.quantityInHu = 0;
			return of(null);
		}

		const filterQuery = `&$filter=machine_id eq ${this.machine?.id} and prod_order_pos_operation_id eq ${this.operationId} and (type eq '${ProdOrderPosOperationHandlingUnitType.PROD_GOOD}' or type eq '${ProdOrderPosOperationHandlingUnitType.PROD_GOOD_LEVEL_2}')`;
		const apiUrl = `ProdOrderPosOperationHandlingUnits?$expand=handlingUnit($expand=item)${filterQuery}`;

		return this.commonService.get(apiUrl).pipe(
			takeUntil(this.destroy$),
			switchMap((res: any) => {
				this.savedHandlingUnits = res.value;
				if (this.savedHandlingUnits.length > 0) {
					const HUForProdGood = this.savedHandlingUnits.find(
						(prodHU: any) =>
							prodHU.type == ProdOrderPosOperationHandlingUnitType.PROD_GOOD
					);
					const ParentHUForProdGood = this.savedHandlingUnits.find(
						(prodHU: any) =>
							prodHU.type == ProdOrderPosOperationHandlingUnitType.PROD_GOOD_LEVEL_2
					);

					this.selectedHandlingUnit = HUForProdGood?.handlingUnit;
					this.selectedHandlingUnitForParent = ParentHUForProdGood?.handlingUnit;

					return this.getStockPosData();
				} else {
					this.selectedHandlingUnit = {};
					this.selectedHandlingUnitForParent = {};
					this.quantityInHu = 0;
					this.quantityInParentHU = 0;

					this.logisticsData.quantityInHu = this.quantityInHu;
					this.machineboardService.sendLogisticsData(this.logisticsData);
					return of(null);
				}
			})
		);
	}

	getNextStop() {
		this.nextStop = this.quantityPerHu - this.quantityInHu - this.quantityProposed;
		if (this.nextStop < 0) {
			this.nextStop = 0;
		}

		this.logisticsData.nextStop = this.nextStop;
		this.machineboardService.sendLogisticsData(this.logisticsData);
	}
}

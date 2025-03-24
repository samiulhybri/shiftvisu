import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperationHandlingUnit } from "@app/shared/models/prod-order-pos-operation-handling-unit.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { ReplaySubject, takeUntil } from "rxjs";

@Component({
	selector: "app-box-packaging",
	templateUrl: "./box-packaging.component.html",
	styleUrl: "./box-packaging.component.css",
})
export class BoxPackagingComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	disableButtonDuringRequest = false;
	isLoading = false;
	dialogTitle = $localize`Add Handling Unit`;
	prodOrderPosOperations: number[] = [];
	currentMachine: Machine | undefined;
	prodOrderPosOperationHandlingUnit: ProdOrderPosOperationHandlingUnit =
		new ProdOrderPosOperationHandlingUnit().deserialize({});

	//TODO: will remove later
	qualities = {
		quantityProduced: 1200,
		quantityPackaged: 900,
		quantityVIP: 300,
		counter: 100,
	};

	@Input() public selectedHandlingUnit = new HandlingUnit().deserialize({});
	@Output() public onOpenHandlingUnit = new EventEmitter<any>();

	constructor(
		private commonService: CommonService,
		private activeRoute: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private dataService: DataService
	) {
		this.getCurrentMachine();
	}

	createHandlingUnit() {
		this.onOpenHandlingUnit.emit();
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
			if (this.currentMachine.id) {
				this.getRunningProdOrderPosOperation(this.currentMachine.id);
			}
		});
	}

	getRunningProdOrderPosOperation(id: number) {
		this.commonService
			.get(
				`MachineProdOrderPosOperationTimes?$filter=machine_id eq ${id} and end eq null and (status eq '${ProdOrderPosOperationStatus.IN_PRODUCTION}' or status eq '${ProdOrderPosOperationStatus.IN_SETUP}')&$top=1`
			)
			.subscribe((data: any) => {
				const id = data.value[0]?.prod_order_pos_operation_id;
				this.prodOrderPosOperations = [id];
			});
	}

	handlePreviewClick(orderDetails: OrderDetails) {
		console.log(orderDetails); // TODO; will remove later
	}

	onSaveBox() {
		this.prodOrderPosOperationHandlingUnit =
			new ProdOrderPosOperationHandlingUnit().deserialize({
				prodOrderPosOperation: { id: this.prodOrderPosOperations?.[0] },
				handlingUnit: { id: this.selectedHandlingUnit?.id },
				machine: { id: this.currentMachine?.id },
			});

		const payload = this.prodOrderPosOperationHandlingUnit.toOdata();

		return this.commonService.post("ProdOrderPosOperationHandlingUnits", payload);
	}
}

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { DataService } from "@app/shared/services/data.service";
import { calDuration } from "@app/shared/utils/calculate-time";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";

@Component({
	selector: "app-order-details",
	templateUrl: "./order-details.component.html",
	styleUrl: "./order-details.component.css",
})
export class OperationDetailsComponent {
	@Output() triggerEvent = new EventEmitter<any>();
	prodOrderPosOperation: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({});
	selectedId = 0;
	selectedOperations: OrderDetails | undefined;
	localizedSec = $localize`Sec.`;
	localizedDay = $localize`D`;
	isLoading: boolean = false;
	isOneId: boolean = false;
	showPopOver: boolean = false;
	opener = "itemName";
	orderText: string = $localize`Order`;
	resQuantityText: string = $localize`Residual Quantity`;


	@Input() public showPreviewButton = false;
	@Input() public currentMachine: Machine | undefined;

	orderDetails: OrderDetails[] = [];
	@Input() public set prodOrderPosOperationsIds(dataItem: number[]) {
		this.isOneId = dataItem.length == 1;

		if (dataItem.length) {
			this.orderDetails = [];
			this.loadData(dataItem);
		} else {
			this.orderDetails = [];
			this.selectedOperations = undefined;
			this.selectedOperationEvent.emit({});
			this.changeItem();
		}
	}

	@Output() selectedOperationEvent = new EventEmitter<any>();
	@Output() handlePreviewClick = new EventEmitter<OrderDetails>();
	totalGoodItems: number = 0;

	constructor(
		public machineboardService: MachineboardService,
		private dataService: DataService
	) {}

	ngOnInit() {
		if (this.prodOrderPosOperationsIds?.length) {
			this.loadData();
		} else {
			this.dataService.orderDetails = [];
		}
	}

	loadData(prodOrderPosOperationsIds?: number[]) {
		try {
			this.isLoading = true;
			const payload = { prodOrderPosOperationIds: prodOrderPosOperationsIds };

			this.machineboardService.post("machine-board/operation-details", payload, false).subscribe({
				next: (response: any) => {
					this.orderDetails = response;
					this.dataService.orderDetails = this.orderDetails;
					
					this.machineboardService.updateOperations(this.orderDetails);

					const isPrevSelectedAvailable = this.orderDetails?.find(
						(order: OrderDetails) => order.id == this.selectedOperations?.id
					);

					this.selectedOperations = isPrevSelectedAvailable || this.orderDetails?.[0];
					this.dataService.selectedOrderDetails =
						this.selectedOperations && this.selectedOperations?.id
							? this.selectedOperations
							: null;
					this.selectedId = this.selectedOperations?.id || 0;

					if (this.selectedOperations?.id) {
						this.changeItem();
						this.selectedOperationEvent.emit(this.selectedOperations);
					}

					if (this.selectedOperations) this.getFormattedOperation();
					this.isLoading = false;
				},
				error: e => {
					this.isLoading = false;
				},
			});
		} catch (error) {
			console.log(error);
			this.isLoading = false;
		}
	}

	selectedOperation(id: number | undefined) {
		if (id) {
			this.selectedId = id;
			this.selectedOperations = this.orderDetails?.find(
				(operation: OrderDetails) => operation.id === id
			);

			this.dataService.selectedOrderDetails = this.selectedOperations
				? this.selectedOperations
				: null;

			this.getFormattedOperation();
			if (this.selectedOperations?.id) {
				this.changeItem();
				this.selectedOperationEvent.emit(this.selectedOperations);
			}
		}
	}

	getFormattedOperation() {
		if (this.selectedOperations && this.selectedOperations?.expectedEndTimeWithCapacity) {
			const expectedDays = calDuration(
				new Date(),
				new Date(this.selectedOperations?.expectedEndTimeWithCapacity)
			);

			if (expectedDays) {
				const splitDate = expectedDays.split(":");
				this.selectedOperations.expectedEndTime = `${splitDate[0]}${this.localizedDay} ${splitDate[1]}:${splitDate[2]}`;
			}
		}
	}

	hasOperation() {
		if (this.orderDetails.length > 0) return true;
		else return false;
	}

	changeItem() {
		this.triggerEvent.emit(this.selectedOperations?.itemImageId);
	}

	onPreviewClick() {
		this.handlePreviewClick.emit(this.orderDetails[0]);
	}

	getButtonStatus(isSelected: boolean) {
		return isSelected ? ButtonDesign.Emphasized : ButtonDesign.Default;
	}

	onMouseEnter() {
		this.showPopOver = false;

		setTimeout(() => {
			this.showPopOver = true;
		}, 5);
	}

	onMouseLeave() {
		this.showPopOver = false;
	}
}

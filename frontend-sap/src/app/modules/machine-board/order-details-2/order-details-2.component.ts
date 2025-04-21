import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import { MachineStateType, MachineStateTypeClass } from "@app/shared/enums/MachineStateType";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { DataService } from "@app/shared/services/data.service";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import { formatNumber } from "@app/shared/utils/number-formatter";

@Component({
	selector: "app-order-details2",
	templateUrl: "./order-details-2.component.html",
	styleUrl: "./order-details-2.component.css",
})
export class OperationDetails2Component {
	@Output() triggerEvent = new EventEmitter<any>();
	@Output() selectedOperationEvent = new EventEmitter<any>();
	prodOrderPosOperation: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({});

	selectedId = 0;
	selectedOperations: OrderDetails | undefined;
	localizedSec = $localize`Sec.`;
	localizedMin = $localize`min`;
	orderDetails: OrderDetails[] = [];
	totalGoodItems: number = 0;
	isLoading: boolean = false;
	isOneId: boolean = false;
	showPopOver: boolean = false;
	machineStateTypeClass= MachineStateTypeClass;
	machineStateType= MachineStateType;
	actualText= $localize`Actual`

	opener = "itemName";
	@Input() machine: Machine | undefined;

	@Input() public set prodOrderPosOperationsIds(dataItem: number[]) {
		this.isOneId = dataItem.length == 1 ? true : false;

		if (dataItem.length) {
			this.orderDetails = [];
			this.loadData(dataItem);
		} else {
			this.orderDetails = [];
			this.selectedOperations = undefined;
			this.dataService.orderDetails = [];
			this.dataService.selectedOrderDetails = null;
			this.triggerEvent.emit(new Item().deserialize({}));
			this.selectedOperationEvent.emit({});
		}
	}

	constructor(
		public machineboardService: MachineboardService,
		private dataService: DataService
	) {
		this.machineboardService.updateOperations([]);
	}

	ngOnInit() {
		if (this.prodOrderPosOperationsIds?.length) this.loadData();
	}

	format(value: any) {
		return formatNumber(Number(value) ?? 0);
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
					this.isLoading = false;

					this.selectedOperations && this.changeItem();
					this.selectedOperationEvent.emit(this.selectedOperations);
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

			this.changeItem();
			this.selectedOperationEvent.emit(this.selectedOperations);
		}
	}

	hasOperation() {
		if (this.orderDetails.length > 0) return true;
		else return false;
	}

	changeItem() {
		if (
			MachineBoardTypeClass.getStateValue(this.machine?.machine_board_type) ==
			MachineBoardType.VIEW_2
		) {
			const item = new Item().deserialize({
				id: this.selectedOperations?.itemPackaging?.id,
				custom_id: this.selectedOperations?.itemPackaging?.custom_id,
			});
			this.triggerEvent.emit(item);
		} else {
			const item = new Item().deserialize({
				id: this.selectedOperations?.itemImageId,
			});
			this.triggerEvent.emit(item);
		}
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

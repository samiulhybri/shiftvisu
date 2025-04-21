import { Component, HostListener, Input, ViewChild } from "@angular/core";
import { MachineBoardStateType, MachineBoardStateTypeClass } from "@app/shared/enums/MachineBoardStateType";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import {MachineboardService} from "@app/modules/machine-board/services/machineboard.service";

@Component({
	selector: "app-machine-board-view-2",
	templateUrl: "./machine-board-view-2.component.html",
	styleUrl: "./machine-board-view-2.component.css",
})
export class MachineBoardView2Component {
	machItem: Item | undefined;
	@Input() machine?: Machine;
	@Input() isBusy: boolean = false;
	@Input() prodOrderPosOperations: any[] = [];
	selectedOperation?: OrderDetails;
	protected readonly machineBoardTypeClass = MachineBoardTypeClass;
	protected readonly MachineBoardType = MachineBoardType;
	protected readonly machineBoardStateTypeClass = MachineBoardStateTypeClass;
	protected readonly machineBoardStateType = MachineBoardStateType;

	graphHeight = "";
	cardHeight = "";
	pageHeight = "";

	ngOnChanges() {
		this.setHeight();
	}

	constructor(
		private machineboardService: MachineboardService,
	) {}

	setHeight() {
		const height = window.innerHeight;
		const width = window.innerWidth;
		this.pageHeight = `${height - 70}px`;
		this.graphHeight = width > 1024 ? `${height/100*30 }px` : "400px";

		if (this.prodOrderPosOperations.length === 0) {
			this.cardHeight = height > 800 ? `${height - 595}px` : "232px";
		}

		if (this.prodOrderPosOperations.length > 0) {
			this.cardHeight = height > 800 ? `${height - 595}px` : "232px";
		}
	}

	@HostListener('window:resize', ['$event'])
    onResize() {
        this.setHeight();
    }

	changeMachItem(item: Item) {
		this.machItem = item;
	}

	onSelectOperation(operation: any) {
		this.selectedOperation = operation;
		this.machineboardService.updateSelectedOperation = this.selectedOperation;
	}
}

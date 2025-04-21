import { Component, HostListener, Input, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { Machine } from "@app/shared/models/machine.model";
import { Item } from "@app/shared/models/item.model";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import {
	MachineBoardStateType,
	MachineBoardStateTypeClass,
} from "@app/shared/enums/MachineBoardStateType";
import {MachineboardService} from "@app/modules/machine-board/services/machineboard.service";

@Component({
	selector: "app-machine-board-view-1",
	templateUrl: "./machine-board-view-1.component.html",
	styleUrl: "./machine-board-view-1.component.css",
})
export class MachineBoardView1Component {
	protected readonly machineBoardTypeClass = MachineBoardTypeClass;
	protected readonly MachineBoardType = MachineBoardType;
	protected readonly machineBoardStateTypeClass = MachineBoardStateTypeClass;
	protected readonly machineBoardStateType = MachineBoardStateType;
	graphHeight: string = "";
	cardHeight: string = "";
	pageHeight: string = "";
	height: number = 0;
	machItem: Item | undefined;
	@Input() machine?: Machine;
	@Input() isBusy = false;
	@Input() prodOrderPosOperations: any[] = [];
	selectedOperation?: OrderDetails;

	constructor(
		private renderer: Renderer2,
		private machineboardService: MachineboardService,
	) {}

	async ngOnInit(): Promise<void> {
		this.renderer.addClass(document.body, "sapUiSizeCozy");
		this.renderer.removeClass(document.body, "sapUiSizeCompact");
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.setHeight();
	}

	setHeight() {
		this.height = window.innerHeight;
		const width = window.innerWidth;

		this.pageHeight = `${this.height - 70}px`;
		this.graphHeight = this.height > 800 ? `${this.height - 627}px` : "415x";

		if (this.prodOrderPosOperations.length === 0) {
			this.cardHeight = this.height > 800 ? `${(this.height - 70)/100*39 }px` : `${(this.height - 70)/100*24 }px`;
		}

		if (this.prodOrderPosOperations.length > 0) {
			this.cardHeight = this.height > 800 ? `${(this.height - 70)/100*39 }px` : `${(this.height - 70)/100*24 }px`;
		}
	}

	@HostListener('window:resize', ['$event'])
    onResize() {
        this.setHeight();
    }

	changeMachItem(id: any) {
		this.machItem = new Item().deserialize({ id: id });
	}

	onSelectOperation(operation: OrderDetails) {
		this.selectedOperation = operation;
		this.machineboardService.updateSelectedOperation = this.selectedOperation;
	}
}
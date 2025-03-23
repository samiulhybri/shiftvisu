import { Component, Input } from "@angular/core";
import { CardView } from "@app/modules/status-board/status-board.component";
import { Machine } from "@app/shared/models/machine.model";
import { StatusBoardCardType, StatusBoardCardTypeClass } from "@app/shared/enums/StatusBoardCardType";
import "@ui5/webcomponents/dist/ProgressIndicator.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents/dist/Label.js";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";

@Component({
	selector: "app-machine-card",
	templateUrl: "./machine-card.component.html",
	styleUrl: "./machine-card.component.css",
})
export class MachineCardComponent {
	@Input() cardType!: MachineStateStateType | ProdOrderPosOperationStatus;
	@Input() selectedCardView!: CardView;
	@Input() machine?: Machine;
	@Input() index!: number;
	card = MachineStateStateType;
	cardView = CardView;
    statusBoardCardType = StatusBoardCardType;
    statusBoardCardTypeClass = StatusBoardCardTypeClass;
	showPopOver = false;
	opener = "";
	popoverText: string = "";
}

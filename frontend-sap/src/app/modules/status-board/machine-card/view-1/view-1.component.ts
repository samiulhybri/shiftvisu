import { Component, Input } from "@angular/core";
import { CardView } from "@app/modules/status-board/status-board.component";
import { Machine } from "@app/shared/models/machine.model";
import { StatusBoardCardType } from "@app/shared/enums/StatusBoardCardType";
import "@ui5/webcomponents/dist/ProgressIndicator.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents/dist/Label.js";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";

@Component({
	selector: "app-view-1",
	templateUrl: "./view-1.component.html",
	styleUrl: "./view-1.component.css",
})
export class View1Component {
	@Input() cardType!: MachineStateStateType | ProdOrderPosOperationStatus;
	@Input() selectedCardView!: CardView;
	@Input() machine?: Machine;
	@Input() index!: number;
	card = MachineStateStateType;
	prodOrderPosOperationStatus = ProdOrderPosOperationStatus;
	cardView = CardView;
	statusBoardCardType = StatusBoardCardType;
	showPopOver = false;
	opener = "";
	popoverText: string = "";

	getItemDisplayText() {			
        const customId = this.machine?.current_operation?.prodOrderPos?.item?.custom_id || "";
        const name = this.machine?.current_operation?.prodOrderPos?.item?.name || "";
        return customId ? `${customId} | ${name}` : name;
    }
}

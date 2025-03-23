import { Component, Input } from "@angular/core";
import { CardView } from "@app/modules/status-board/status-board.component";
import { Machine } from "@app/shared/models/machine.model";
import { StatusBoardCardType } from "@app/shared/enums/StatusBoardCardType";
import "@ui5/webcomponents/dist/ProgressIndicator.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents/dist/Label.js";
import {
	MachineStateStateType,
	MachineStateStateTypeClass,
} from "@app/shared/enums/MachineStateStateType";
import { MachineStateType, MachineStateTypeClass } from "@app/shared/enums/MachineStateType";
import {
	ProdOrderPosOperationStatus,
	ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";
import { DecimalPipe } from "@angular/common";

@Component({
	selector: "app-view-2",
	templateUrl: "./view-2.component.html",
	styleUrl: "./view-2.component.css",
	providers: [DecimalPipe],
})
export class View2Component {
	@Input() cardType!: MachineStateStateType | ProdOrderPosOperationStatus;
	cardTypeText!: MachineStateStateTypeClass | ProdOrderPosOperationStatusClass;
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
	localizedSec = $localize`Sec.`;
	machineStateTypeClass = MachineStateTypeClass;
	machineStateType = MachineStateType;
	currentText = $localize`Current`;
	goodText: string = $localize`Good`;
	reworkText: string = $localize`Rework`;
	scrapText: string = $localize`Scrap`;
	orderText: string = $localize`Order`;
	resQuantityText: string = $localize`Residual Quantity`;

	constructor(private decimalPipe: DecimalPipe) {}

	ngOnInit(): void {
		this.cardTypeText =
			MachineStateStateTypeClass.getStateTranslate(this.cardType) ||
			ProdOrderPosOperationStatusClass.getStateTranslate(this.cardType);
	}

	close() {
		this.showPopOver = false;
		this.popoverText = "";
	}

	onMouseEnterItemID(event: any, i: number) {
		this.showPopOver = false;
		this.opener = `itemId${i}`;
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Item Id`;
		}, 5);
	}

	onMouseEnterScrapText(event: any, i: number) {
		this.showPopOver = false;
		this.opener = `scrapText${i}`;
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Scrap Parts`;
		}, 5);
	}

	onMouseEnterGoodText(event: any, i: number) {
		this.showPopOver = false;
		this.opener = `goodText${i}`;
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Good Parts`;
		}, 5);
	}

	onMouseEnterQuantityText(event: any, i: number) {
		this.showPopOver = false;
		this.opener = `totalQuantityText${i}`;
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Total Quantity`;
		}, 5);
	}

	onMouseEnterProgressBar(event: any, i: number) {
		this.showPopOver = false;
		this.opener = `progressBar${i}`;
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Order Progress`;
		}, 5);
	}

	onMouseOEE(event: any, i: number, value: number) {
		this.showPopOver = false;
		this.opener = `OEE${i}`;

		const formattedValue = this.decimalPipe.transform((value || 0) * 100, "2.0-0");

		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`OEE` + `: ${formattedValue}%`;
		}, 5);
	}

	onMouseEnterMachineUsage(event: any, i: number, value: number) {
		this.showPopOver = false;
		this.opener = `machineUsage${i}`;

		const formattedValue = this.decimalPipe.transform((value || 0) * 100, "2.0-0");

		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Machine Usage` + `: ${formattedValue}%`;
		}, 5);
	}

	onMouseEnterPerformance(event: any, i: number,  value: number) {
		this.showPopOver = false;
		this.opener = `performance${i}`;

		const formattedValue = this.decimalPipe.transform((value || 0) * 100, "2.0-0");

		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Performance` + `: ${formattedValue}%`;
		}, 5);
	}

	onMouseEnterQuality(event: any, i: number,  value: number) {
		this.showPopOver = false;
		this.opener = `quality${i}`;

		const formattedValue = this.decimalPipe.transform((value || 0) * 100, "2.0-0");

		setTimeout(() => {
			this.showPopOver = true;
			this.popoverText = $localize`Quality` + `: ${formattedValue}%`;
		}, 5);
	}

	onMouseLeaveTimeline() {
		this.showPopOver = false;
		this.popoverText = "";
	}
}

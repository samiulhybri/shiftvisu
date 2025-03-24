import { Component, Input } from "@angular/core";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";

@Component({
	selector: "app-legend-card",
	templateUrl: "./legend-card.component.html",
	styleUrl: "./legend-card.component.css",
})
export class LegendCardComponent {
	@Input() cardType!: MachineStateStateType;
	@Input() totalMachines!: number;
	machineStatus = MachineStateStateType;
}

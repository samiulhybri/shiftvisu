import { Component, Input } from "@angular/core";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { StatusBoardSidebarType, StatusBoardSidebarTypeClass } from "@app/shared/enums/StatusBoardSidebarType";
import { Setting } from "@app/shared/models/setting.model";

@Component({
	selector: "app-legend",
	templateUrl: "./legend.component.html",
	styleUrl: "./legend.component.css",
})
export class LegendComponent {
	cardType = MachineStateStateType;
	
	protected readonly statusboardSidebarTypeClass = StatusBoardSidebarTypeClass;
	protected readonly statusboardSidebarType = StatusBoardSidebarType;
	
	@Input() settings: Setting = new Setting().deserialize({});
	@Input() totalInProduction: number = 0;
	@Input() totalInStandStill: number = 0;
	@Input() totalInSetup: number = 0;
	@Input() totalInOFF: number = 0;
	@Input() totalInReady: number = 0;
}

export enum MachineBoardSideBar {
	CLOCK_IN_OUT = "CLOCK_IN_OUT",
	PRODUCTION_PLAN = "PRODUCTION_PLAN",
	MACHINE_STATE = "MACHINE_STATE",
	MACHINE_STATE_HISTORY = "MACHINE_STATE_HISTORY",
	QUANTITY = "QUANTITY",
	MATERIAL_CONSUMPTION = "MATERIAL_CONSUMPTION",
	PACKAGING = "PACKAGING",
	DEFAULT_PACKAGING = "DEFAULT_PACKAGING",
	QUALI_VISU = "QUALI_VISU",
	STATUS_BOARD = "STATUS_BOARD",
	PRINT_HU = "PRINT_HU",
	RESET_PROPOSAL = "RESET_PROPOSAL",
	PAINTING_LINE = "PAINTING_LINE",
	DOC_VISU = "DOC_VISU",
}

export class MachineBoardSideBarClass {
	constructor() {}

	static getStateTranslate(state: any, translationType : 'DEFAULT' | 'BEN' = 'DEFAULT'): string {
        if(translationType == 'BEN') {
            return this.getStateTranslateBen(state);
        }

		switch (state) {
			case MachineBoardSideBar.CLOCK_IN_OUT:
				return $localize`Clock In / Clock Out`;
			case MachineBoardSideBar.PRODUCTION_PLAN:
				return $localize`Production Plan`;
			case MachineBoardSideBar.MACHINE_STATE:
				return $localize`Machine State`;
			case MachineBoardSideBar.MACHINE_STATE_HISTORY:
				return $localize`Machine State History`;
			case MachineBoardSideBar.QUANTITY:
				return $localize`Quantity`;
			case MachineBoardSideBar.MATERIAL_CONSUMPTION:
				return $localize`Material Consumption`;
			case MachineBoardSideBar.PACKAGING:
				return $localize`Packaging`;
			case MachineBoardSideBar.DEFAULT_PACKAGING:
				return $localize`Choose Packaging`;
			case MachineBoardSideBar.QUALI_VISU:
				return $localize`QualiVisu`;
			case MachineBoardSideBar.STATUS_BOARD:
				return $localize`Statusboard`;
			case MachineBoardSideBar.PRINT_HU:
				return $localize`Print HU`;
			case MachineBoardSideBar.RESET_PROPOSAL:
				return $localize`Reset Counter`;
			case MachineBoardSideBar.PAINTING_LINE:
				return $localize`Load/Unload`;
			case MachineBoardSideBar.DOC_VISU:
				return $localize`DocVisu`;
			default:
				return "";
		}
	}

	static getStateTranslateBen(state: any): string {
		switch (state) {
			case MachineBoardSideBar.CLOCK_IN_OUT:
				return $localize`Clock In / Clock Out`;
			case MachineBoardSideBar.PRODUCTION_PLAN:
				return $localize`Order List`;
			case MachineBoardSideBar.MACHINE_STATE:
				return $localize`Machine Stops`;
			case MachineBoardSideBar.MACHINE_STATE_HISTORY:
				return $localize`Machine Stop History`;
			case MachineBoardSideBar.QUANTITY:
				return $localize`Goods Receipt`;
			case MachineBoardSideBar.MATERIAL_CONSUMPTION:
				return $localize`Material Request`;
			case MachineBoardSideBar.PACKAGING:
				return $localize`Packaging`;
			case MachineBoardSideBar.DEFAULT_PACKAGING:
				return $localize`Choose Packaging`;
			case MachineBoardSideBar.QUALI_VISU:
				return $localize`QualiVisu`;
			case MachineBoardSideBar.STATUS_BOARD:
				return $localize`Workplaces`;
			case MachineBoardSideBar.PRINT_HU:
				return $localize`Print HU`;
			case MachineBoardSideBar.RESET_PROPOSAL:
				return $localize`Reset Counter`;
			case MachineBoardSideBar.PAINTING_LINE:
				return $localize`Load/Unload`;
			case MachineBoardSideBar.DOC_VISU:
				return $localize`DocVisu`;
			default:
				return "";
		}
	}
}

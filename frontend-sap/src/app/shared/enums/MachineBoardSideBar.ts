export enum MachineBoardSideBar {
	CLOCK_IN_OUT = "CLOCK_IN_OUT",
	PRODUCTION_PLAN = "PRODUCTION_PLAN",
	MACHINE_STATE = "MACHINE_STATE",
	MACHINE_STATE_HISTORY = "MACHINE_STATE_HISTORY",
	QUANTITY = "QUANTITY",
	MATERIAL_CONSUMTION = "MATERIAL_CONSUMTION",
	PACKAGING = "PACKAGING",
	DEFAULT_PACKAGING = "DEFAULT_PACKAGING",
	RE_PACKAGING = "RE_PACKAGING",
	GOODS_RECEIPT = "GOODS_RECEIPT",
	QUALI_VISU = "QUALI_VISU",
	STATUS_BOARD = "STATUS_BOARD",
	PRINT_HU = "PRINT_HU",
	RESET_PROPOSAL = "RESET_PROPOSAL",
	PAINTING_LINE = "PAINTING_LINE",
	DOC_VISU = "DOC_VISU",
}

export class MachineBoardSideBarClass {
	constructor() {}

	static getStateTranslate(state: any): string {
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
			case MachineBoardSideBar.MATERIAL_CONSUMTION:
				return $localize`Material Consumption`;
			case MachineBoardSideBar.PACKAGING:
				return $localize`Packaging`;
			case MachineBoardSideBar.DEFAULT_PACKAGING:
				return $localize`Next Packaging`;
			case MachineBoardSideBar.RE_PACKAGING:
				return $localize`Re-Packaging`;
			case MachineBoardSideBar.GOODS_RECEIPT:
				return $localize`Goods Receipt`;
			case MachineBoardSideBar.QUALI_VISU:
				return $localize`QualiVisu`;
			case MachineBoardSideBar.STATUS_BOARD:
				return $localize`Statusboard`;
			case MachineBoardSideBar.PRINT_HU:
				return $localize`Print HU`;
			case MachineBoardSideBar.RESET_PROPOSAL:
				return $localize`Reset Proposal`;
			case MachineBoardSideBar.PAINTING_LINE:
				return $localize`Load/Unload`;
			case MachineBoardSideBar.DOC_VISU:
				return $localize`DocVisu`;
			default:
				return "";
		}
	}
}

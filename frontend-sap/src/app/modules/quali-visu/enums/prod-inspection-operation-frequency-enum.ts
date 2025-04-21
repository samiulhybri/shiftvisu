export enum ProdInspectionOperationFrequencyEnum {
	COMPONENT_SCANNED = "COMPONENT_SCANNED",
	OPERATION_IN_SETUP = "OPERATION_IN_SETUP",
	OPERATION_IN_PRODUCTION = "OPERATION_IN_PRODUCTION",
	OPERATION_CLOSED = "OPERATION_CLOSED",
	MACHINE_STATE_QUALITY_RELEVANT = "MACHINE_STATE_QUALITY_RELEVANT",
	CYCLE_FREQUENCY = "CYCLE_FREQUENCY",
	MACHINE_SHIFT = "MACHINE_SHIFT",
	HANDLING_UNIT_CREATED = "HANDLING_UNIT_CREATED",
	TIME_FREQUENCY = "TIME_FREQUENCY",
}

export class ProdInspectionOperationFrequencyClass {
	constructor() {}

	static getTypeTranslate(type: ProdInspectionOperationFrequencyEnum | undefined) {
		switch (type) {
			case ProdInspectionOperationFrequencyEnum.COMPONENT_SCANNED:
				return $localize`Entry accepted`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_IN_SETUP:
				return $localize`Setup`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_IN_PRODUCTION:
				return $localize`Production Start Released`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_CLOSED:
				return $localize`Production End Released`;
			case ProdInspectionOperationFrequencyEnum.MACHINE_STATE_QUALITY_RELEVANT:
				return $localize`Production Restart`;
			case ProdInspectionOperationFrequencyEnum.CYCLE_FREQUENCY:
				return $localize`Cycle Frequency`;
			case ProdInspectionOperationFrequencyEnum.MACHINE_SHIFT:
				return $localize`Shift Change`;
			case ProdInspectionOperationFrequencyEnum.HANDLING_UNIT_CREATED:
				return $localize`Handling unit created`;
			case ProdInspectionOperationFrequencyEnum.TIME_FREQUENCY:
				return $localize`Time Frequency`;
			default:
				return "";
		}
	}
	static getTypeTranslateShortCode(type: ProdInspectionOperationFrequencyEnum | undefined) {
		switch (type) {
			case ProdInspectionOperationFrequencyEnum.COMPONENT_SCANNED:
				return $localize`QAPR`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_IN_SETUP:
				return $localize`QSET`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_IN_PRODUCTION:
				return $localize`QIPR`;
			case ProdInspectionOperationFrequencyEnum.OPERATION_CLOSED:
				return $localize`QFPR`;
			case ProdInspectionOperationFrequencyEnum.MACHINE_STATE_QUALITY_RELEVANT:
				return $localize`QRST`;
			case ProdInspectionOperationFrequencyEnum.CYCLE_FREQUENCY:
				return $localize`QFRQ`;
			case ProdInspectionOperationFrequencyEnum.MACHINE_SHIFT:
				return $localize`QTUR`;
			case ProdInspectionOperationFrequencyEnum.HANDLING_UNIT_CREATED:
				return $localize`QUMV`;
			case ProdInspectionOperationFrequencyEnum.TIME_FREQUENCY:
				return $localize`QFRQ`;
			default:
				return "";
		}
	}
}

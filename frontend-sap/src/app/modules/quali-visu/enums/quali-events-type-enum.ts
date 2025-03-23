export enum QualiEventsTypeEnum {
	COMPONENT_SCANNED = 'COMPONENT_SCANNED',
	OPERATION_SETUP_STARTED = 'OPERATION_SETUP_STARTED',
	OPERATION_PRODUCTION_STARTED = 'OPERATION_PRODUCTION_STARTED',
	OPERATION_CLOSED = 'OPERATION_CLOSED',
	HANDLING_UNIT_CREATED = 'HANDLING_UNIT_CREATED',
	MACHINE_STATE_QUALITY_RELEVANT = 'MACHINE_STATE_QUALITY_RELEVANT'
}

export class QualiEventsTypeClass {
	constructor() {}

	static getTypeTranslate(type : any) {
		switch(type) {
			case QualiEventsTypeEnum.COMPONENT_SCANNED:
				return $localize`Component Scanned`;
			case QualiEventsTypeEnum.OPERATION_SETUP_STARTED:
				return $localize`Operation setup started`;
			case QualiEventsTypeEnum.OPERATION_PRODUCTION_STARTED:
				return $localize`Operation production started`;
			case QualiEventsTypeEnum.OPERATION_CLOSED:
				return $localize`Operation closed`;
			case QualiEventsTypeEnum.HANDLING_UNIT_CREATED:
				return $localize`Handling unit created`;
			case QualiEventsTypeEnum.MACHINE_STATE_QUALITY_RELEVANT:
				return $localize`Machine state quality relevant`;
			default:
				return "";
		}
	}
}
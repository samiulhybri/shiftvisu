export interface OrderDetails {
	id: number;
	prodOrderCustomId: string;
	prodOrderPosOperationPosition: string;
	prodOrderPosOperationName: string;
	itemId: string;
	itemImageId: string;
	itemName: string;
	expectedEndTime: string;
	orderQuantity: string;
	goodItemsCount: number;
	reworkItemsCount: number;
	badItemsCount: number;
	standardCycle: string;
	standardVelocity: string;
	currentCycle: number;
	currentVelocity: number;
	setupTime: number;
	orderProgression: number;
	residualQuantity: number;
	residualQuantityDetails2: number;
	scheduledStartTime: string;
	effectiveStartTime: string;
	scheduledEndTime: string;
	lastProgression: string;
	expectedEndTimeWithCapacity: string;
	expectedEndTimeWithCapacityErrorCode: string;
	unitOfMeasureCustomId: string;
	operationTimeStart: string;
	status: string,
	isLinkedOrder: boolean,
	packagingInstructionId: number | null,
	packagingInstructionId1: number | null,
	packagingInstructionId2: number | null,
	packagingInstructionId3: number | null,
	packagingInstructionId4: number | null,
	itemPackaging: {
		id: number;
		custom_id: string;
	},
	effectiveTime: number;
	loadedQuantities: number;
	itemPlantId: number;
	tearDownTime: any[];
}

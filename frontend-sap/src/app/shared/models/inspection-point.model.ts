import {Deserializable} from "../interfaces/deserializable";
import {InspectionPointCharacteristic} from "@app/shared/models/inspection-point-characteristic.model";

export class InspectionPoint implements Deserializable {
    id?: number;
    inspectionPointCharacteristics: InspectionPointCharacteristic[] = [];

    constructor() {
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        if (input.inspectionPointCharacteristics || input.inspection_point_characteristics) {
            this.inspectionPointCharacteristics = (input.inspectionPointCharacteristics ?? input.inspection_point_characteristics).map(
                (inspectionPointCharacteristic: any) => new InspectionPointCharacteristic().deserialize(inspectionPointCharacteristic)
            );
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            inspectionPointCharacteristics: undefined,
            inspection_point_characteristics: undefined,
        };
    }

    isOpen(): boolean {
        return this.inspectionPointCharacteristics.reduce((result, inspectionPointCharacteristic) => result || (!inspectionPointCharacteristic.value && inspectionPointCharacteristic.inspectionPointCharacteristicOptions.length === 0), false)
    }
}

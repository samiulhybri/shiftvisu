import {Deserializable} from "../interfaces/deserializable";
import {InspectionPointCharacteristicOption} from "@app/shared/models/inspection-point-characteristic-option.model";
import {InspectionOperationChateristic} from "@app/shared/models/inspection-operation-characteristic.model";

export class InspectionPointCharacteristic implements Deserializable {
    id?: number;
    inspectionPointCharacteristicOptions: InspectionPointCharacteristicOption[] = [];
    value: number | undefined;

    constructor() {
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        if (input.inspectionPointCharacteristicOptions || input.inspection_point_characteristic_options) {
            this.inspectionPointCharacteristicOptions = (input.inspectionPointCharacteristicOptions ?? input.inspection_point_characteristic_options).map(
                (inspectionPointCharacteristicOption: any) => new InspectionPointCharacteristicOption().deserialize(inspectionPointCharacteristicOption)
            );
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            inspectionPointCharacteristicOptions: undefined,
            inspection_point_characteristic_options: undefined,
        };
    }
}

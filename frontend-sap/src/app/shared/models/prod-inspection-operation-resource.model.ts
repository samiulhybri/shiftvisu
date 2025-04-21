import {Deserializable} from "../interfaces/deserializable";
import {InspectionOperationResourceType} from "@app/modules/quali-visu/enums/inspection-operation-resource-type-enum";
import {Equipment} from "@app/shared/models/equipment.model";

export class ProdInspectionOperationResource implements Deserializable {
    id?: number;
    type: InspectionOperationResourceType = InspectionOperationResourceType.EQUIPMENT;
    equipment: Equipment | undefined;

    constructor() {
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            equipment: undefined,
        };
    }
}

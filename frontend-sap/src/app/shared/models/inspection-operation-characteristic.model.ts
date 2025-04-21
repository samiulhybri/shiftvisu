import {Deserializable} from "../interfaces/deserializable";
import {UnitOfMeasure} from "@app/shared/models/unit-of-measures.model";

export class InspectionOperationChateristic implements Deserializable {
    id?: number;
    name: string = '';
    is_required: boolean = true;
    is_quantitative: boolean = true;
    value_lower_limit: number | undefined;
    value_upper_limit: number | undefined;
    unitOfMeasure: UnitOfMeasure | undefined;

    constructor() {
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
        };
    }
}

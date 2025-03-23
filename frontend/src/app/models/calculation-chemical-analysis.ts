import { Deserializable } from "../interfaces/deserializable";

export class CalculationChemicalAnalysis implements Deserializable {
    id?: number;
    name: string = '';
    unit?: string = '';
    min?: number;
    max?: number;
    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
    toOdata(): Object {
        return {
            ...this,
            id : undefined
        };
    }
}

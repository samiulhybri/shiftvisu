import { Deserializable } from "../interfaces/deserializable";
import { HweQsSamplesProdOrderPos } from "./hew-qs-samples-prod-order-pos";

export class SampleNumber implements Deserializable {
    id: number = 0;
    custom_id?: string;
    date?: Date | null;
    samplesProdOrderPos?: HweQsSamplesProdOrderPos;

    deserialize(input: any) {
        Object.assign(this, input);

        if(input.date) this.date = new Date(input.date);

        if (input.samplesProdOrderPos) {
            this.samplesProdOrderPos = new HweQsSamplesProdOrderPos().deserialize(input.samplesProdOrderPos)
        }

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            samplesProdOrderPos: undefined,
            testing_scope_attestation: undefined,
            heat_treatment_type: undefined,
            quenching_medium_type: undefined,
            attestation_entities: undefined,
            yield_strength: undefined,
            tensile_test: undefined,
            expansion: undefined,
            constriction: undefined,
            impact_work: undefined,
            impact_test_temperature: undefined,
            quenching_medium: undefined,
            melt: undefined,
        };
    }
}

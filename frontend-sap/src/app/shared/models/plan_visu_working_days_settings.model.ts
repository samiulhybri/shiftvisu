import { Deserializable } from "@app/shared/interfaces/deserializable";

export class PlanVisuWorkingDaysSettings implements Deserializable {
    id?: number;
    day!: string;
    is_working_day!: boolean;

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata() {
        return {
            ...this,
        };
    }
}
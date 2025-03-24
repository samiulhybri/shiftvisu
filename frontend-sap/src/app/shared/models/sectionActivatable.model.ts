import { Deserializable } from "@app/shared/interfaces/deserializable";
import { SectionActivatableTypes } from "@app/shared/enums/SectionActivatableTypes";

export class SectionActivatable implements Deserializable{
    id?: number;
    activatable_type?: string;
    activatable_id?: number;
    section?: SectionActivatableTypes;
    is_active?: boolean;

    constructor(){}

    deserialize(input: any): this {
        Object.assign(this, input);

        return this;
    }

    toOdata():object{
        return {
            ...this,
        }
    }
}
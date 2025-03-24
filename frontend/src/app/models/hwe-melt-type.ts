
import {Deserializable} from "@app/interfaces/deserializable";
import {HweMeltType as HweMeltTypeEnum, HweMeltTypeClass as HweMeltTypeEnumClass} from "@app/modules/hwe-qs/enums/HweMeltType";
export class HweMeltType implements Deserializable {
    id?: number;
    melt_type?: HweMeltTypeEnum;
    hwe_melt_analysis_id?:number
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.melt_type ? HweMeltTypeEnumClass.getStateTranslate(input.melt_type) : '';
        this.value = input.melt_type

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            value: undefined,
            text: undefined,
        };
    }
}

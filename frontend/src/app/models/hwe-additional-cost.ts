import { HweCostCalcType } from "@app/modules/hwe-kalk/enums/HweCostCalcType";
import { Deserializable } from "../interfaces/deserializable";
import { HweAdditionalCostTrigger } from "./hwe-additional-costTrigger";


export class HweAdditionalCost implements Deserializable {
    id?: number;
    hwe_cost_type?: string = '';
    price: number = 0;
    lead_time_days: number = 0;
    valid_from?: Date | null;
    valid_to?: Date | null;
    cost_calc_type?: HweCostCalcType
    
    hweAdditionalCostTriggers!: HweAdditionalCostTrigger[];
    deserialize(input: any): this {
        Object.assign(this, input);

        if (input.hweAdditionalCostTriggers) {
            this.hweAdditionalCostTriggers = [];
            input.hweAdditionalCostTriggers.forEach((data: HweAdditionalCostTrigger) => {
                this.hweAdditionalCostTriggers?.push(new HweAdditionalCostTrigger().deserialize(data));
            });
        }

        this.valid_from = input?.valid_from ? new Date(input.valid_from) : null;
        this.valid_to = input?.valid_to ? new Date(input.valid_to) : null;

        return this;
    }

    toOdata(): any {
        return {
            ...this,
            hweAdditionalCostTriggers: this.getArrData('trigger', this.hweAdditionalCostTriggers) ?? undefined,
            unitOfMeasure: undefined,
            cost_calc_type: this.cost_calc_type ?? null
        };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal;
    }
}

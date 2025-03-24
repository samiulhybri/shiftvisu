import {Deserializable} from "../interfaces/deserializable";
import {HweWorkPlanHeatTreatment} from "@app/models/hwe-work-plan-heat-treatment";
import {HweWorkPlanAdditionalHeatTreatment} from "@app/models/hwe-work-plan-additional-heat-treatment";

export class HweWorkPlan implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    heatTreatments: HweWorkPlanHeatTreatment[] = [];
    additionalHeatTreatments: HweWorkPlanAdditionalHeatTreatment[] = [];

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.heatTreatments) {
            this.heatTreatments = [];

            input.heatTreatments.forEach((item: HweWorkPlanHeatTreatment) => {
                this.heatTreatments?.push(new HweWorkPlanHeatTreatment().deserialize(item))
            });
        }

        if (input.additionalHeatTreatments) {
            this.additionalHeatTreatments = [];

            input.additionalHeatTreatments.forEach((item: HweWorkPlanAdditionalHeatTreatment) => {
                this.additionalHeatTreatments?.push(new HweWorkPlanAdditionalHeatTreatment().deserialize(item))
            });
        }
        return this;
    }

    toOdata(isNew = true): Object {
        return {
            ...this,
            heatTreatments: isNew ? this.getHeatTreatments() : undefined,
            additionalHeatTreatments: isNew ? this.getAdditionalHeatTreatments() : undefined
        }
    }

    getHeatTreatments() {
        return this.heatTreatments
            .filter((value: HweWorkPlanHeatTreatment) => !value.isDeleted)
            .map((value: HweWorkPlanHeatTreatment) => value.toOdata());

    }

    getAdditionalHeatTreatments() {
        return this.additionalHeatTreatments
            .filter((value: HweWorkPlanAdditionalHeatTreatment) => !value.isDeleted)
            .map((value: HweWorkPlanAdditionalHeatTreatment) => value.toOdata());
    }
}

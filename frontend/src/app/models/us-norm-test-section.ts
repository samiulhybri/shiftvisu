
import { UsNormOperator } from "@app/modules/hwe-qs/enums/UsNormOperator";
import { Deserializable } from "../interfaces/deserializable";
import { UsNorm } from "./us-norm";
import { HweUsTestSection } from "@app/modules/hwe-kalk/enums/HweUsTestSection";


export class UsNormTestSection implements Deserializable {
    id?: number;
    usNorm?: UsNorm;
    test_section?: HweUsTestSection;
    registration_threshold?: number;
    reporting_threshold?: number;
    decision_threshold?: number;
    allowed_threshold?: number;
    expansion_with?: number;
    expansion_without?: number;
    scrap_limit?: number;
    scrap_limit_operator?: UsNormOperator;
    registration_threshold_operator?: UsNormOperator;
    reporting_threshold_operator?: UsNormOperator;
    decision_threshold_operator?: UsNormOperator;
    allowed_threshold_operator?: UsNormOperator;
    expansion_with_operator?: UsNormOperator;
    expansion_without_operator?: UsNormOperator;

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            test_section: this.test_section ?? '',
            registration_threshold_operator: this.registration_threshold_operator ?? '',
            reporting_threshold_operator: this.reporting_threshold_operator ?? '',
            decision_threshold_operator: this.decision_threshold_operator ?? '',
            allowed_threshold_operator: this.allowed_threshold_operator ?? '',
            expansion_with_operator: this.expansion_with_operator ?? '',
            expansion_without_operator: this.expansion_without_operator ?? '',
            us_norm_id: this.usNorm?.id,
            usNorm: undefined,
        };
    }
}

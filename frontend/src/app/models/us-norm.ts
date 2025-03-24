
import { Deserializable } from "../interfaces/deserializable";
import { UsNormAdjustment } from "./us-norm-adjustments";
import { UsNormTestScope } from "./us-norm-test-scope";
import { UsNormTestSection } from "./us-norm-test-section";
import { UsNormRating } from "./us-norms-rating";
import { HweUsTestingDevice } from "@app/modules/hwe-kalk/enums/HweUsTestingDevice";
import { HweUsShim } from "@app/modules/hwe-kalk/enums/HweUsShim";
import { UsNormCoupling } from "@app/modules/hwe-qs/enums/UsNormCoupling";
import { UsNormOperator } from "@app/modules/hwe-qs/enums/UsNormOperator";


export class UsNorm implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    specification: string = '';
    issue: string = '';
    quality_class: string = '';
    surface_finish: string = '';
    coupling: UsNormCoupling = UsNormCoupling.PASTE;
    amplification: string = '';
    note: string = '';
    detection_threshold?: number;
    residual_magnetism?: number;
    detection_threshold_operator?: UsNormOperator;
    testing_device?: HweUsTestingDevice;
    shim?: HweUsShim;
    adjustments!: UsNormAdjustment[];
    usNormTestScopes?: UsNormTestScope[] = [];
    usNormTestSections?: UsNormTestSection[] = [];
    usNormRatings?: UsNormRating[] = [];
    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);

        if (input.adjustments) {
            this.adjustments = [];
            input.adjustments.forEach((data: any) => {
                this.adjustments?.push(new UsNormAdjustment().deserialize(data));
            });
        }
        if (input.usNormTestScope) {
            this.usNormTestScopes = [];
            input.usNormTestScope.forEach((data: UsNormTestScope) => {
                this.usNormTestScopes?.push(new UsNormTestScope().deserialize(data));
            });
        }
        if (input.usNormTestSections) {
            this.usNormTestSections = [];
            input.usNormTestSections.forEach((data: UsNormTestSection) => {
                this.usNormTestSections?.push(new UsNormTestSection().deserialize(data));
            });
        }
        if (input.usNormRatings) {
            this.usNormRatings = [];
            input.usNormRatings.forEach((data: UsNormRating) => {
                this.usNormRatings?.push(new UsNormRating().deserialize(data));
            });
        }

        return this;
    }

    toOdata(isUpdate: boolean = false): Object {
        return {
            ...this,
            surface_finish: this.surface_finish ?? '',
            testing_device: this.testing_device ?? '',
            shim: this.shim ?? '',
            detection_threshold_operator: this.detection_threshold_operator ?? '',
            adjustments: this.getArrData('adjustment', this.adjustments) ?? undefined,
            usNormTestScopes: isUpdate ? undefined : this.usNormTestScopes,
            usNormTestSections: isUpdate ? undefined : this.usNormTestSections,
            usNormRatings: isUpdate ? undefined : this.usNormRatings

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

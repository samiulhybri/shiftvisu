
import { Deserializable } from "../interfaces/deserializable";
import { VtNormTestTechnique } from "./vt-norm-test-technique";
import { VtNormAuxiliaryMean } from "./vt-norm-auxiliary-mean";

export class VtNorm implements Deserializable {
    id?: number;
    custom_id: string = '';
    name: string = '';
    specification: string = '';
    revision: string = '';
    quality_class: string = '';
    test_scope: string = '';
    lux_meter: string = '';
    comments: string = '';
    Illuminance: string = '';
    registration_limit: string = '';
    surface_quality: string = '';
    auxiliaryMeans!: VtNormAuxiliaryMean[];
    testTechniques!: VtNormTestTechnique[];

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);

        if (input.testTechniques) {
            this.testTechniques = [];
            input.testTechniques.forEach((data: any) => {
                this.testTechniques?.push(new VtNormTestTechnique().deserialize(data));
            });
        }
        if (input.auxiliaryMeans) {
            this.auxiliaryMeans = [];
            input.auxiliaryMeans.forEach((data: any) => {
                this.auxiliaryMeans.push(new VtNormAuxiliaryMean().deserialize(data));
            });
        }

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            registration_limit: this.registration_limit ?? '',
            test_scope: this.test_scope ?? '',
            lux_meter: this.lux_meter ?? '',
            Illuminance: this.Illuminance ?? '',
            testTechniques: this.getArrData('test_technique', this.testTechniques) ?? undefined,
            auxiliaryMeans: this.getArrData('auxiliary_mean', this.auxiliaryMeans) ?? undefined
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

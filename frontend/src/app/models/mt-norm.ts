
import { Deserializable } from "../interfaces/deserializable";

export class MtNorm implements Deserializable {
    id?: number;
    custom_id: string = '';
    specification: string = '';
    revision: string = '';
    test_class: string = '';
    testing_facility: string = '';
    test_equipment: string = '';
    uv_lamp: string = '';
    test_range: string = '';
    current_type: string = '';
    illuminance: string = '';
    irradiance: string = '';
    magnetization: string = '';
    control_unit: string = '';
    comments: string = '';
    registration_limit: string = '';
    lux_meter: string = '';
    field_strength_meter: string = '';
    uv_meter: string = '';
    residual_magnetism: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            test_range: this.test_range ?? '',
            testing_facility: this.testing_facility ?? '',
            test_equipment: this.test_equipment ?? '',
            uv_lamp: this.uv_lamp ?? '',
            lux_meter: this.lux_meter ?? '',
            field_strength_meter: this.field_strength_meter ?? '',
            uv_meter: this.uv_meter ?? '',
            magnetization: this.magnetization ?? '',
            current_type: this.current_type ?? '',
            control_unit: this.control_unit ?? '',
            registration_limit: this.registration_limit ?? '',
            illuminance: this.illuminance ?? '',
            irradiance: this.irradiance ?? '',
            residual_magnetism: this.residual_magnetism ?? ''
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

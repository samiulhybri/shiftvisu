import {Deserializable} from "../interfaces/deserializable";
import { SampleNumber } from "@app/models/sample-number";
import { HweCertificate } from "@app/models/hwe-certificate";

export class HweCertificateHweQsSample implements Deserializable {
    id?: number;
    hweQsSample?:SampleNumber;
    hwe_certificate_id?:Number;
    note_qs_sample: string= ''

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            hwe_certificate_id :undefined,
            hweQsSamples:undefined,
            hweCertificate:undefined,
        };
    }
}

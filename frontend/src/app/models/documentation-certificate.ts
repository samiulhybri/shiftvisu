import { Deserializable } from "../interfaces/deserializable";
import { DocumentationCertificateClass, DocumentationCertificate as DocumentationCertificateEnum } from "@app/modules/hwe-kalk/enums/DocumentationCertificate";


export class DocumentationCertificate implements Deserializable {
    id?: number;
    certificate?:DocumentationCertificateEnum;
    documentation_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.certificate ? DocumentationCertificateClass.getStateTranslate(input.certificate) : '';
        this.value = input.certificate

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
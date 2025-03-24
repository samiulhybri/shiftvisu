export enum DocumentationCertificate {
    DE,
    ENG,
    FR
}

export class DocumentationCertificateClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "DE":
                return $localize`DE`;
            case "ENG":
                return $localize`ENG`;
            case "FR":
                return $localize`FR`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(DocumentationCertificate);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
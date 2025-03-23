export enum HweRustProtectionType {
    COMPONENT = 'COMPONENT',
    STAMP_FACE = 'STAMP_FACE',
    HOLE = 'HOLE'
}

export class HweRustProtectionTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweRustProtectionType.COMPONENT:
                return $localize`Component`;
            case HweRustProtectionType.STAMP_FACE:
                return $localize`Stamp Face`;
            case HweRustProtectionType.HOLE:
                return $localize`Hole`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweRustProtectionType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
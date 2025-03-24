export enum HweUsTestSection {
    GEAR = 'GEAR',
    BORDER = 'BORDER',
    CORE = 'CORE',
    REST = 'REST',
    FUNCTIONAL = 'FUNCTIONAL',
    ZONE_1 = 'ZONE_1',
    ZONE_2 = 'ZONE_2',
    ZONE_3 = 'ZONE_3',
    ZONE_4 = 'ZONE_4',
}

export class HweUsTestSectionClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweUsTestSection.GEAR:
                return $localize`Gear`;
            case HweUsTestSection.BORDER:
                return $localize`Border`;
            case HweUsTestSection.CORE:
                return $localize`Core`;
            case HweUsTestSection.REST:
                return $localize`Rest`;
            case HweUsTestSection.FUNCTIONAL:
                return $localize`Functional`;
            case HweUsTestSection.ZONE_1:
                return $localize`Zone 1`;
            case HweUsTestSection.ZONE_2:
                return $localize`Zone 2`;
            case HweUsTestSection.ZONE_3:
                return $localize`Zone 3`;
            case HweUsTestSection.ZONE_4:
                return $localize`Zone 4`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elements = Object.keys(HweUsTestSection);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
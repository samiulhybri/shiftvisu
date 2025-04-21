export enum MachineQualificationImportType {
    NONE = "NONE",
    MACHINE_QUALIFICATION = "MACHINE_QUALIFICATION",
    MACHINE_ITEM_QUALIFICATION = "MACHINE_ITEM_QUALIFICATION",
}

export class MachineQualificationImportTypeClass {
    constructor() {}

    static getStateTranslate(state: any): string {
        switch (state) {
            case MachineQualificationImportType.NONE:
                return $localize`None`;
            case MachineQualificationImportType.MACHINE_QUALIFICATION:
                return $localize`Machine Qualification`;
            case MachineQualificationImportType.MACHINE_ITEM_QUALIFICATION:
                return $localize`Machine Item Qualification`;
            default:
                return state;
        }
    }

    static getStateValue(value: any): string {
        switch (value) {
            case $localize`None`:
                return MachineQualificationImportType.NONE;
            case $localize`Machine Qualification`:
                return MachineQualificationImportType.MACHINE_QUALIFICATION;
            case $localize`Machine Item Qualification`:
                return MachineQualificationImportType.MACHINE_ITEM_QUALIFICATION;
            default:
                return "";
        }
    }

    static getEnumArray() {
        const enum_arr: any = [];
        const elements = Object.keys(MachineQualificationImportType);
        elements.forEach(elm => {
            if (isNaN(Number(elm))) {
                enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return enum_arr;
    }
}

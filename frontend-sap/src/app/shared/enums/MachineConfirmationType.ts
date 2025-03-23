export enum MachineConfirmationType {
    MANUAL = "MANUAL",
    PROPOSE_IIOT = "PROPOSE_IIOT",
    AUTOMATIC = "AUTOMATIC"
}

export class MachineConfirmationTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case MachineConfirmationType.MANUAL:
                return $localize`Manual`;
            case MachineConfirmationType.PROPOSE_IIOT:
                return $localize`Propose IIOT`;
            case MachineConfirmationType.AUTOMATIC:
                return $localize`Automatic`;
            default:
                return state;
        }
    }

    static getStateValue(value: any): string {
        switch (value) {
            case $localize`Manual`:
                return MachineConfirmationType.MANUAL;
            case $localize`Propose IIOT`:
                return MachineConfirmationType.PROPOSE_IIOT;
            case $localize`Automatic`:
                return MachineConfirmationType.AUTOMATIC;
            default:
                return "";
        }
    }

    static getEnumArray() {
        const enum_arr: any = [];
        const elements = Object.keys(MachineConfirmationType);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return enum_arr;

    }
}

export enum SpecimenLocation {
    TRANSVERSE,
    LONGITUDINAL,
    TANGENTIAL,
    TENSION_TRANSVERSE_KBZ_LONGITUDINAL,
    TENSION_TANGENTIAL_KBZ_LONGITUDINAL,
    Axial,
    Nach_Zeichnung,
    Nach_Probenlageplan,
    Nach_Spezifikation
}

export class SpecimenLocationClass {
    constructor() {
    }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "TRANSVERSE":
                return $localize`Transverse`;
            case "LONGITUDINAL":
                return $localize`Longitudinal`;
            case "TANGENTIAL":
                return $localize`Tangential`;
            case "TENSION_TRANSVERSE_KBZ_LONGITUDINAL":
                return $localize`Tension = Transverse and KBZ = Longitudinal`;
            case "TENSION_TANGENTIAL_KBZ_LONGITUDINAL":
                return $localize`Tension = Tangential and KBZ = Longitudinal`;
            case "Axial":
                return $localize`Axial`;
            case "Nach_Zeichnung":
                return $localize`Nach Zeichnung`;
            case "Nach_Probenlageplan":
                return $localize`Nach Probenlageplan`;
            case "Nach_Spezifikation":
                return $localize`Nach Spezifikation`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(SpecimenLocation);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;
    }
}
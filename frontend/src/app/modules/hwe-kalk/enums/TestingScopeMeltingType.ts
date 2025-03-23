export enum TestingScopeMeltingType {
    ELECTRIC_STEEL="ELECTRIC_STEEL",
    VACUUM_DEGASSING="VACUUM_DEGASSING",
    Casting_BEAM_SHIELDING="Casting_BEAM_SHIELDING",
    DEOXIDIZED="DEOXIDIZED",
    SOOTHED="SOOTHED",
    ESU_STEEL="ESU_STEEL",
    VOD="VOD",
    AOD="AOD",
    FULLY_SOOTHED="FULLY_SOOTHED"
}

export class TestingScopeMeltingTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case TestingScopeMeltingType.ELECTRIC_STEEL:
                return $localize`Electric Steel`;
            case TestingScopeMeltingType.VACUUM_DEGASSING:
                return $localize`Vacuum Degassing`;
            case TestingScopeMeltingType.Casting_BEAM_SHIELDING:
                return $localize`Casting Beam Shielding`;
            case TestingScopeMeltingType.DEOXIDIZED:
                return $localize`Deoxidized`;
            case TestingScopeMeltingType.SOOTHED:
                return $localize`Soothed`;
            case TestingScopeMeltingType.ESU_STEEL:
                return $localize`ESU Steel`;
            case TestingScopeMeltingType.VOD:
                return $localize`VOD`;
            case TestingScopeMeltingType.AOD:
                return $localize`AOD`;
            case TestingScopeMeltingType.FULLY_SOOTHED:
                return $localize`Fully Soothed`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(TestingScopeMeltingType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
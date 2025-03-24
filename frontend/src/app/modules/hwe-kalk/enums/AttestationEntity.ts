export enum AttestationEntity {
    ABS = 'ABS',
    BV = 'BV',
    BWB = 'BWB',
    CCS = 'CCS',
    CR = 'CR',
    DNV = 'DNV',
    DNV_INDUSTRIE = 'DNV_INDUSTRIE',
    IRS = 'IRS',
    KI = 'KI',
    KUNDE = 'KUNDE',
    KR = 'KR',
    LR = 'LR',
    NKK = 'NKK',
    RINA = 'RINA',
    RINA_N = 'RINA_N',
    RINA_MIL = 'RINA_MIL',
    RS = 'RS',
    TL = 'TL',
    TUV = 'TUV'
}

export class AttestationEntityClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case AttestationEntity.ABS:
                return $localize`ABS`;
            case AttestationEntity.BV:
                return $localize`BV`;
            case AttestationEntity.BWB:
                return $localize`BWB`;
            case AttestationEntity.CCS:
                return $localize`CCS`;
            case AttestationEntity.CR:
                return $localize`CR`;
            case AttestationEntity.DNV:
                return $localize`DNV`;
            case AttestationEntity.DNV_INDUSTRIE:
                return $localize`DNV INDUSTRIE`;
            case AttestationEntity.IRS:
                return $localize`IRS`;
            case AttestationEntity.KI:
                return $localize`KI`;
            case AttestationEntity.KUNDE:
                return $localize`Kunde`;
            case AttestationEntity.KR:
                return $localize`KR`;
            case AttestationEntity.LR:
                return $localize`LR`;
            case AttestationEntity.NKK:
                return $localize`NKK`;
            case AttestationEntity.RINA:
                return $localize`RINA`;
            case AttestationEntity.RINA_N:
                return $localize`RINA N`;
            case AttestationEntity.RINA_MIL:
                return $localize`RINA MIL`;
            case AttestationEntity.RS:
                return $localize`RS`;
            case AttestationEntity.TL:
                return $localize`TL`;
            case AttestationEntity.TUV:
                return $localize`TÜV`;

            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(AttestationEntity);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;
    }
}
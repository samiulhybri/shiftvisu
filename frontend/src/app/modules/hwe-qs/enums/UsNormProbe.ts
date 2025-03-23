export enum UsNormProbe {
    S24W4 = 'S24W4',
    B4S = 'B4S',
    S24W2 = 'S24W2',
    B2S = 'B2S',
    B5S = 'B5S',
    B1S = 'B1S',
    SEB4 = 'SEB4',
    SEB40 = 'SEB40',
    MSEB4 = 'MSEB4',
    SE18 = 'SE18',
    US40PB4 = 'US40PB4',
    S10W4C = 'S10W4C',
    S10W2C = 'S10W2C',
    MB4S = 'MB4S',
    MB2S = 'MB2S',
    WK45PB4 = 'WK45PB4',
    WK35PB4 = 'WK35PB4',
    WK60PB4 = 'WK60PB4',
    WK70PB4 = 'WK70PB4',
    SWM45PB2C = 'SWM45PB2C',
    SWB452 = 'SWB452',
    S24W4_PLUS_WEDGE_ATTACHMENT = 'S24W4_PLUS_WEDGE_ATTACHMENT',
    S24W2_PLUS_WEDGE_ATTACHMENT = 'S24W2_PLUS_WEDGE_ATTACHMENT',
    S10W4C_PLUS_WEDGE_ATTACHMENT = 'S10W4C_PLUS_WEDGE_ATTACHMENT',
    S10W2C_PLUS_WEDGE_ATTACHMENT = 'S10W2C_PLUS_WEDGE_ATTACHMENT',
    WSE56 = 'WSE56',
    US46PB4 = 'US46PB4',
    US70PB4 = 'US70PB4',
    WS45 = 'WS45',
    WS60 = 'WS60',
    WS70 = 'WS70',
}

export class UsNormProbeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case UsNormProbe.S24W4:
                return $localize`S24W4`;
            case UsNormProbe.B4S:
                return $localize`B4S`;
            case UsNormProbe.S24W2:
                return $localize`S24W2`;
            case UsNormProbe.B2S:
                return $localize`B2S`;
            case UsNormProbe.B5S:
                return $localize`B5S`;
            case UsNormProbe.B1S:
                return $localize`B1S`;
            case UsNormProbe.SEB4:
                return $localize`SEB4`;
            case UsNormProbe.SEB40:
                return $localize`SEB4-0°`;
            case UsNormProbe.MSEB4:
                return $localize`MSEB4`;
            case UsNormProbe.SE18:
                return $localize`SE18`;
            case UsNormProbe.US40PB4:
                return $localize`40PB4`;
            case UsNormProbe.S10W4C:
                return $localize`S10W4C`;
            case UsNormProbe.S10W2C:
                return $localize`S10W2C`;
            case UsNormProbe.MB4S:
                return $localize`MB4S`;
            case UsNormProbe.MB2S:
                return $localize`MB2S`;
            case UsNormProbe.WK45PB4:
                return $localize`WK45PB4`;
            case UsNormProbe.WK35PB4:
                return $localize`WK35PB4`;
            case UsNormProbe.WK60PB4:
                return $localize`WK60PB4`;
            case UsNormProbe.WK70PB4:
                return $localize`WK70PB4`;
            case UsNormProbe.SWM45PB2C:
                return $localize`SWM45PB2C`;
            case UsNormProbe.SWB452:
                return $localize`SWB45-2`;
            case UsNormProbe.S24W4_PLUS_WEDGE_ATTACHMENT:
                return $localize`S24W4  WEDGE PLUS ATTACHMENT`;
            case UsNormProbe.S24W2_PLUS_WEDGE_ATTACHMENT:
                return $localize`S24W2WEDGE PLUS ATTACHMENT`;
            case UsNormProbe.S10W4C_PLUS_WEDGE_ATTACHMENT:
                return $localize`S10W4C WEDGE PLUS ATTACHMENT`;
            case UsNormProbe.S10W2C_PLUS_WEDGE_ATTACHMENT:
                return $localize`S10W2C WEDGE PLUS ATTACHMENT`;
            case UsNormProbe.WSE56:
                return $localize`WSE56`;
            case UsNormProbe.US46PB4:
                return $localize`46PB4`;
            case UsNormProbe.US70PB4:
                return $localize`70PB4`;
            case UsNormProbe.WS45:
                return $localize`WS45`;
            case UsNormProbe.WS60:
                return $localize`WS60`;
            case UsNormProbe.WS70:
                return $localize`WS70`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormProbe);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

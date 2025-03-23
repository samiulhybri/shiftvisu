export enum TestScope {
    SURFACE_WITH_HOLE = "SURFACE_WITH_HOLE",
    SURFACE_WITHOUT_HOLE = "SURFACE_WITHOUT_HOLE",
    OUTER_SURFACE = "OUTER_SURFACE"
}

export class TestScopeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case TestScope.SURFACE_WITH_HOLE:
                return $localize`100% of surface with hole`;
            case TestScope.SURFACE_WITHOUT_HOLE:
                return $localize`100% of surface without hole`;
            case TestScope.OUTER_SURFACE:
                return $localize`Outer surface`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(TestScope);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
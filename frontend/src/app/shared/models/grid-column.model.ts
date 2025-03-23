export interface GridColumn {
    name: string;
    title: string;
    filterType?: string;
    filterable?: boolean;
    sortable?: boolean;
    dropdownList?: [];
    dropdownFilterableList?: [];
    isDateColumn?: boolean;
    isCustomCell?: boolean;
    booleanValue?: boolean;
    sub_field?: string[];
    dateFormat?: string;
    isRelation?: boolean;
    template?: boolean;
    key?: any[];
    hideColumnMenu?: boolean;
    width?: number | string; // 300 or '300px'
    textAlign?: GridItemAlign | string;
}


export enum GridItemAlign {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center"
}
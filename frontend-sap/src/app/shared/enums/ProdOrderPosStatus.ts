export enum ProdOrderPosStatus {
  PLANNED = "PLANNED",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  IN_PRODUCTION = "IN_PRODUCTION",
  CLOSED = "CLOSED",
  DELETED = "DELETED",
}
export class ProdOrderPosStatusClass {
  constructor() {
  }

  static getStateTranslate(state: any): string {
    switch (state) {
      case ProdOrderPosStatus.PLANNED:
        return $localize`Planned`;
      case ProdOrderPosStatus.IN_PRODUCTION:
        return $localize`In Production`;
      case ProdOrderPosStatus.IN_MAINTENANCE:
        return $localize`In Maintenance`;
      case ProdOrderPosStatus.CLOSED:
        return $localize`Closed`;
      case ProdOrderPosStatus.DELETED:
        return $localize`Deleted`;

      default:
        return "";
    }
  }

  static getStateValue(value: any): string {
    switch (value) {
      case $localize`PLANNED`:
        return ProdOrderPosStatus.PLANNED;
      case $localize`IN_PRODUCTION`:
        return ProdOrderPosStatus.IN_PRODUCTION;
      case $localize`CLOSED`:
        return ProdOrderPosStatus.CLOSED;
      case $localize`IN_MAINTENANCE`:
        return ProdOrderPosStatus.IN_MAINTENANCE;
      case $localize`DELETED`:
        return ProdOrderPosStatus.DELETED;
      default:
        return "";
    }
  }

  static getEnumArray() {
    const enum_arr: any = [];
    const elements = Object.keys(ProdOrderPosStatus);
    elements.forEach(elm => {
      if (isNaN(Number(elm))) {
        enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
      }
    });
    return enum_arr;
  }
}
export enum MaterialDatabaseTemperature {
    RT
}
export class MaterialDatabaseTemperatureClass{
    constructor(){}

    getStateTranslate(state: any): String {
        switch (state) {
          case "RT":
            return $localize`RT`;
          default:
            return "";
        }
      }
    
      getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(MaterialDatabaseTemperature);
        elemetns.forEach((elm) => {
          if (isNaN(Number(elm))) {
            res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
          }
        });
        return res_arr;
      }

}
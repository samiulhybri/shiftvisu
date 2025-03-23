export enum MpPfPmType {
    PF,
    PF_PM
}


export class MpPfPmTypeClass{
    
    constructor(){}

	getStateTranslate(state: any): String{
		switch(state){
			case 'PF':
				return $localize`Solo parte fissa`;
			case 'PF_PM':
				return $localize`Parte fissa e parte mobile`;
			default:
				return "";
		}	
	}

	getEnumArray(){
		var res_arr: any = [];
		var elemetns = Object.keys(MpPfPmType);
		elemetns.forEach(elm => {
			if(isNaN(Number(elm))){
				res_arr.push({"value":elm, "text": this.getStateTranslate(elm)});
			}
		});
		return res_arr;
	}
}

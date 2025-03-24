export enum MpOfferType {
    INTERNAL,
    EXTERNAL
}


export class MpOfferTypeClass{
    constructor(){
       
    }

    getStateTranslate(state: any): String{
		switch(state){
			case 'INTERNAL':
				return $localize`INTERNAL`;
			case 'EXTERNAL':
				return $localize`EXTERNAL`;
			default:
				return "";
		}
	
	}

	getEnumArray(){
		var res_arr: any = [];
		var elemetns = Object.keys(MpOfferType);
		elemetns.forEach(elm => {
			if(isNaN(Number(elm))){
				res_arr.push({"value":elm, "text": this.getStateTranslate(elm)});
			}
		});
		return res_arr;
	}
}

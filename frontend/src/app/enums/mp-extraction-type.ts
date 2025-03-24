export enum MPExtractionType {
    MECHANIC,
    HYDRAULIC,
    MACHANIC_HYDRAULIC
    
}

export class MPExtractionTypeClass{
    constructor(){
       
    }

    getStateTranslate(state: any): String{
		switch(state){
			case 'MECHANIC':
				return $localize`MECHANIC`;
			case 'HYDRAULIC':
				return $localize`HYDRAULIC`;
			case 'MACHANIC_HYDRAULIC':
				return $localize`MACHANIC_HYDRAULIC`;
			default:
				return "";
		}
	
	}

	getEnumArray(){
		var res_arr: any = [];
		var elemetns = Object.keys(MPExtractionType);
		elemetns.forEach(elm => {
			if(isNaN(Number(elm))){
				res_arr.push({"value":elm, "text": this.getStateTranslate(elm)});
			}
		});
		return res_arr;
	}
}

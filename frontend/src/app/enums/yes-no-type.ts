export enum YesNoType {
    YES,
    NO
}


export class YesNoTypeClass{
    constructor(){
       
    }

    getStateTranslate(state: any): String{
		switch(state){
			case 'YES':
				return $localize`YES`;
			case 'NO':
				return $localize`NO`;
			default:
				return "";
		}	
	}

    getValueNumber(state:any): Boolean{
        switch(state){
			case 'YES':
				return true;
			case 'NO':
				return false;
			default:
				return false;
		}	
    }

	getEnumArray(){
		var res_arr: any = [];
		var elemetns = Object.keys(YesNoType);
		elemetns.forEach(elm => {
			if(isNaN(Number(elm))){
				res_arr.push({"value":this.getValueNumber(elm), "text": this.getStateTranslate(elm)});
			}
		});
		return res_arr;
	}
}

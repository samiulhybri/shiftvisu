export enum MaterialGroupType {
    TYPE_1,
    TYPE_2,
    TYPE_3,
    TYPE_4,
    TYPE_5,
}

export class MaterialGroupTypeClass{
    constructor(){ }

    getStateTranslate(state: any): String{
		switch(state){
			case 'TYPE_1':
				return $localize`1`;
			case 'TYPE_2':
				return $localize`2`;
			case 'TYPE_3':
				return $localize`3`;
            case 'TYPE_4':
                return $localize`4`;
            case 'TYPE_5':
                return $localize`5`;
			default:
				return "";
		}
	
	}

	getEnumArray(){
		let res_arr: any = [];
		var elemetns = Object.keys(MaterialGroupType);
		elemetns.forEach(elm => {
			if(isNaN(Number(elm))){
				res_arr.push({"value":elm, "text": this.getStateTranslate(elm)});
			}
		});
		return res_arr;
	}
}

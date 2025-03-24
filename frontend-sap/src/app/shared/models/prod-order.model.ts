import { Deserializable } from "../interfaces/deserializable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
export class ProdOrder implements Deserializable {
    id?: number;
    custom_id?: string;
    assembly?: string;
    order_type?: string;
    prodOrderPos?: ProdOrderPos[] = [];
    is_closed?: boolean = false;
    call_off_id?: number;
    private _isSelected?: boolean = true;   // internal use only

    constructor() { }

    get isSelected(){
        return this._isSelected!;
    }
    set isSelected(isSelected: boolean){
        this._isSelected = isSelected;
    }

    deserialize(input: any): this {
        Object.assign(this, input);
       if(input.prodOrderPos){
        this.prodOrderPos = input.prodOrderPos.map(
            (pos: any) =>
                new ProdOrderPos().deserialize(
                    pos
                )
        );
       }
        return this;
    }

    toOdata(): Object {
        return {
			...this,
            prodOrderPos:undefined,
			_isSelected:undefined
		};
    }
}

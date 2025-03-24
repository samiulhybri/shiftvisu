import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { Item } from "./item";
import { Machine } from "./machine";
import { MarkerRecipePos } from "./marker-recipe-pos";

export class MarkerRecipe implements ODatable, Deserializable {
    id?: number;
    custom_id?: string = '';
    name?: string = '';
    is_active?: boolean = false;
    machine?: Machine;
    item?: Item;
    markerRecipePos?: MarkerRecipePos;
    delay?: number = 0;
    zaxis?: boolean = false;

    constructor() {}

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.machine) this.machine = new Machine().deserialize(input.machine);
        if (input.item) this.item = new Item().deserialize(input.item);
        if (input.markerRecipePos) this.markerRecipePos = new MarkerRecipePos().deserialize(input.markerRecipePos);

        return this;
    }

    toOdata(): Object {
        return { 
            ...this, 
            is_active: this.is_active ?? false, 
            zaxis: this.zaxis ?? false, 
            machine_id:  this.machine ? this.machine?.id : null, 
            machine: undefined, 
            item_id:  this.item ? this.item?.id : null, 
            item: undefined, 
            markerRecipePos: undefined 
        };
    }
}


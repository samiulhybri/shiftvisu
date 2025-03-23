import { MarkerRecipeBlockType } from "@app/enums/marker-recipe-block-type";
import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { MarkerRecipePos } from "./marker-recipe-pos";

export class MarkerRecipePosBlock implements ODatable, Deserializable {
    id?: number;
    order?: number = 1;
    marker_block_type?: MarkerRecipeBlockType;
    date_time_format_string?: string = '';
    text?: string = '';
    ascii_dec?: number = 0;
    shot_counter_length?: number = 1;
    notes: string = '';
    markerRecipePos?: MarkerRecipePos

    constructor() {}

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.markerRecipePos) this.markerRecipePos = new MarkerRecipePos().deserialize(input.markerRecipePos);
        if(input.text) this.text = decodeURIComponent(input.text.replace(/\+/g, ' '));

        return this;
    }

    toOdata(): Object {
        return { ...this, marker_recipe_pos_id: this.markerRecipePos!.id, markerRecipePos: undefined, text: this.text ? encodeURIComponent(this.text) : '' };
    }
}


import { MarkerRecipePosType, MarkerRecipePosTypeClass } from "@app/enums/marker-recipe-pos-type";
import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { MarkerRecipe } from "./marker-recipe";
import { MarkerRecipePosBlock } from "./marker-recipe-pos-block";

export class MarkerRecipePos implements ODatable, Deserializable {
    id?: number;
    pos?: number = 1;
    marker_pos_type?: MarkerRecipePosType;
    font_height?: number = 1;
    pos_x?: number = 0;
    pos_y?: number = 0;
    pos_z?: number = 0;
    angle?: number = 0;
    should_touch_probe?: boolean = false;
    markerRecipe?: MarkerRecipe;
    markerRecipePosBlock?: MarkerRecipePosBlock

    constructor() {}

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.markerRecipe) this.markerRecipe = new MarkerRecipe().deserialize(input.markerRecipe);
        if (input.markerRecipePosBlock) this.markerRecipePosBlock = new MarkerRecipePosBlock().deserialize(input.markerRecipePosBlock);

        return this;
    }

    toOdata(): Object {
        return { ...this, marker_recipe_id: this.markerRecipe!.id, markerRecipe: undefined, markerRecipePosBlock: undefined };
    }
}


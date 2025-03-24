import { BackendModelType } from "@app/shared/enums/BackendModelType";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import PackagingInstruction from "@app/shared/models/packaging-instruction.model";
import { Item } from "@app/shared/models/item.model";

export default class PackagingInstructionPos implements Deserializable {

    id?: number;
    packaging_instruction_id?: number;
    pos?: string;
    packable_type?: BackendModelType;
    packable_id ?: number;
    target_quantity?: number;
    unit_of_measure_id?: number;
    is_container: boolean = false;
    is_active: boolean = true;
    packagingInstruction: PackagingInstruction = new PackagingInstruction().deserialize({});
    item: Item | null = null // internal use only

    deserialize(input: any): this {
		Object.assign(this, input);
        if (input.packagingInstruction) {
			this.packagingInstruction = new PackagingInstruction().deserialize(input.packagingInstruction);
        }
        if (input.item) {
			this.item = new Item().deserialize(input.item);
        }
        return this;
    }

    toOdata(): Object {
        return {
			...this,
            packagingInstruction: undefined,
            item: undefined
        }
    }
}
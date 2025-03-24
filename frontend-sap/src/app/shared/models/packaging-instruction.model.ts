import { Deserializable } from "@app/shared/interfaces/deserializable";
import PackagingInstructionPos from "@app/shared/models/packaging-instruction-pos.model";

export default class PackagingInstruction implements Deserializable {

    id!: number;
	custom_id?: string;
    is_active: boolean = true;
    uuid: string | null = null;
    packagingInstructionPos: PackagingInstructionPos[] = [];
    targetQuantity: number = 0; // internal use only


    deserialize(input: any): this {
		Object.assign(this, input);
        if (input.packagingInstructionPos) {
            this.packagingInstructionPos = input.packagingInstructionPos.map((el: any)=> new PackagingInstructionPos().deserialize(el));
        }
        return this;
    }

    toOdata(): Object {
        return {
			...this,
            packagingInstructionPos: undefined,
            targetQuantity: undefined
        }
    }
}
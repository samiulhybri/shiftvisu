import { Deserializable } from "@app/shared/interfaces/deserializable";

export default class ItemStateGroup implements Deserializable {
	id!: number;
	name?: string = "";
	custom_id?: string;
	is_active?: boolean = true;
	isUsed: boolean = false;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topItemState) {
			this.isUsed = true;
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isUsed: undefined,
		};
	}
}

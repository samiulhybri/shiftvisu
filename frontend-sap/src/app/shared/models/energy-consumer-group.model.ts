import { Deserializable } from "@app/shared/interfaces/deserializable";

export class EnergyConsumerGroup implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_active?: boolean = true;
	is_imported_from_erp: boolean = false;
	isUsed: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topEnergyConsumer) {
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

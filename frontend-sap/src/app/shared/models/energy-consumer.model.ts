import { Deserializable } from "../interfaces/deserializable";
import { EnergyConsumerGroup } from "./energy-consumer-group.model";

export class EnergyConsumer implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_imported_from_erp: boolean = false;
	energyConsumerGroups?: EnergyConsumerGroup = new EnergyConsumerGroup().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		this.energyConsumerGroups = new EnergyConsumerGroup().deserialize(
			input.energyConsumerGroups ?? {}
		);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			energy_consumer_group_id: this.energyConsumerGroups?.id,
			energyConsumerGroups: undefined,
		};
	}
}

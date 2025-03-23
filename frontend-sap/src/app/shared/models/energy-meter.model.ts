import { EnergyType, EnergyTypeClass } from "@app/shared/enums/energy-type.enum";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { EnergyConsumer } from "@app/shared/models/energy-consumer.model";

export class EnergyMeter implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string = "";
    is_active?: boolean = true;
    isSelected?: boolean = true; //internal use only
    energyConsumer: EnergyConsumer = new EnergyConsumer().deserialize({});
    energy_type: string = EnergyTypeClass.getStateTranslate(EnergyType.GAS);

    deserialize(input: any): this {
        Object.assign(this, input);
        if (input.energyConsumer)
            this.energyConsumer = new EnergyConsumer().deserialize(input.energyConsumer);
        if (input.energy_type) {
            this.energy_type = EnergyTypeClass.getStateTranslate(input.energy_type);
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            energy_type: EnergyTypeClass.getStateValue(this.energy_type),
            energy_consumer_id: this.energyConsumer?.id,
            energyConsumer: undefined,
            isSelected: undefined,
        };
    }

}

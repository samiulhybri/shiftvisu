import { ItemStateType, ItemStateTypeClass } from "@app/shared/enums/ItemStateType";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Machine } from "@app/shared/models/machine.model";
import ItemStateGroup from "@app/shared/models/item-state-group.model";

export default class ItemState implements Deserializable {
	id!: number;
	name?: string = "";
	item_state_type: string = ItemStateTypeClass.getStateTranslate(ItemStateType.GOOD);
	custom_id?: string;
	is_active?: boolean = true;
	machines: Machine[] = [];
	machineList: string = "";
	is_imported_from_erp: boolean = false;
	isSelected?: boolean = false; //internal use only
	itemStateGroup?: ItemStateGroup = new ItemStateGroup().deserialize({});

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.machine) {
			this.machineList = "";
			this.machines = input.machine.map((machine: Machine, i: number) => {
				this.machineList += machine.name;

				if (input.machine.length !== i + 1) this.machineList += " , ";

				return new Machine().deserialize(machine);
			});
		}
		if (input.item_state_type) {
			this.item_state_type = ItemStateTypeClass.getStateTranslate(
				input.item_state_type
			);
		}

		this.itemStateGroup = new ItemStateGroup().deserialize(input.itemStateGroup || {});
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			machines: undefined,
			machineList: undefined,
			isSelected: undefined,
			item_state_group_id: this.itemStateGroup?.id,
			item_state_type: ItemStateTypeClass.getStateValue(this.item_state_type),
			itemStateGroup: undefined,
		};
	}

	// Pivot table's values
	toJSONData(selectedMachines: (number | undefined)[]): Object {
		return {
			id: this.id,
			machinesIds: selectedMachines,
			isSelected: undefined,
		};
	}
}

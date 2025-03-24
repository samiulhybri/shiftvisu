import {
	MachineStateStateType,
	MachineStateStateTypeClass,
} from "@app/shared/enums/MachineStateStateType";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { MachineStateGroup } from "@app/shared/models/machine-state-group.model";
import { Machine } from "@app/shared/models/machine.model";
import { Color } from "@app/shared/enums/Color";

export default class MachineState implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_active?: boolean = true;
	color?: string = Color.BLACK;
	is_imported_from_erp: boolean = false;
	machineStateGroup: MachineStateGroup = new MachineStateGroup().deserialize({});
	machines: Machine[] = [];
	machineList: string = "";
	isSelected?: boolean = false;
	is_quality_relevant: boolean = false;
	microstop_duration: number = 0;
	state_type: string = MachineStateStateTypeClass.getStateTranslate(
		MachineStateStateType.STANDSTILL
	);

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.machineStateGroup)
			this.machineStateGroup = new MachineStateGroup().deserialize(input.machineStateGroup);
		if (input.machine_state_group)
			this.machineStateGroup = new MachineStateGroup().deserialize(input.machine_state_group);

		if (input.machines) {
			this.machineList = "";
			this.machines = input.machines.map((machine: Machine, i: number) => {
				this.machineList += machine.name;

				if (input.machines.length !== i + 1) this.machineList += " , ";

				return new Machine().deserialize(machine);
			});
		}

		if (input.state_type) {
			this.state_type = MachineStateStateTypeClass.getStateTranslate(input.state_type);
		}

		return this;
	}
	toOdata(): Object {
		return {
			...this,
			machine_state_group_id: this.machineStateGroup?.id,
			machineStateGroup: undefined,
			machine_state_group: undefined,
			machines: undefined,
			machineList: undefined,
			isSelected: undefined,
			state_type: MachineStateStateTypeClass.getStateValue(this.state_type),
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

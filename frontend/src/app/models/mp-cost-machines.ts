import {Deserializable} from "../interfaces/deserializable";
import { Machine } from "./machine";

export class MPCostMachines implements Deserializable {
    id?: number;
    mp_cost_id?: number;
    machine_id?: number;
    machine?: Machine;

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.machine)
            this.machine = new Machine().deserialize(input.machine);
        return this;
    }
}
import { Deserializable } from "src/app/interfaces/deserializable";

// Models
import { Item } from "./item";
import { User } from "./user";
import { Machine } from "./machine";

export class MaterialConsumption implements Deserializable {
  id?: number = 0;
  item_id?: number = 0;
  furnace_id?: number = 0;
  user_id?: number | null;
  quantity?: number = 0;
  created_at?: Date;
  updated_at?: Date;
  item?: Item;
  furnace?: Machine;
  user?: User;
  machines?: Machine[];
  machineConsumptions?: any | number[];

  deserialize(input: any) {
    Object.assign(this, input);
    if (this.item) this.item = new Item().deserialize(input.item);
    if (this.furnace) this.furnace = new Machine().deserialize(input.item);
    if (this.user) this.user = new User().deserialize(input.item);

    if (this.machines)
      input.machines.forEach((machine: any) => {
        this.machines?.push(new Machine().deserialize(machine));
    });

    return this;
  }
}

import { OfferPosWorkPlanName } from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";
import { Deserializable } from "src/app/interfaces/deserializable";
import { Machine } from "./machine";

export class HweOfferPosWorkPlanLeadTime implements Deserializable {
  id?: number;
  name?: OfferPosWorkPlanName;
  machine?:Machine;
  lead_time_days:number = 0;

  deserialize(input: any): this {
    Object.assign(this, input);
    this.machine = input.machine ? new Machine().deserialize(input.machine) : new Machine();
    return this;
  }
  toOdata(){
    return {
      ...this,
      machine_id: this.machine?.id,
      machine: undefined,
    }
  }
}

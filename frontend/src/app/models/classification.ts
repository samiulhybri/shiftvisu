import { Base } from "./base";
import {Deserializable} from "@app/interfaces/deserializable";
import {CostCenter} from "@app/models/cost-center";

export class Classification implements Deserializable {
  model_type?: string;
  model_id?: number;
  class?: string;
  attribute?: string;
  value_string?: string;
  value_double?: number;


  deserialize(input: any) {
    Object.assign(this, input);

    return this;
  }

  toOdata(){
    return {
      ...this
    }
  }
}

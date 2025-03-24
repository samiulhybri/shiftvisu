import {Deserializable} from "../interfaces/deserializable";

import { ProdOrderPos } from "./prod-order-pos";
import { SampleNumber } from "./sample-number";

export class HweQsSamplesProdOrderPos implements Deserializable {
  id?: number;
  sample_number?: SampleNumber;
  hweQsSample?: SampleNumber;
  prod_order_pos?: ProdOrderPos;
  created_at?: string;
  updated_at?: string;

  deserialize(input: any) {
    Object.assign(this, input);

    if (input.sample_number) {
      this.sample_number = new SampleNumber().deserialize(input.sample_number);
    }

    if (input.prod_order_pos) {
      this.prod_order_pos = new ProdOrderPos().deserialize(input.prod_order_pos);
    }

    return this;
  }

  toOdata(): Object {
    return {
      ...this,
      hwe_qs_sample_id: this.sample_number?.id,
      prod_order_pos_id: this.prod_order_pos?.id,
      sample_number: undefined,
      prod_order_pos: undefined,
      sampleNumber: undefined,
    };
  }
}

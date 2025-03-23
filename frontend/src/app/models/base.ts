import { Deserializable } from "src/app/interfaces/deserializable";

export class Base implements Deserializable {
  id?: number | null;
  name?: string;
  created_at?: Date;
  updated_at?: Date;

  deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }
}

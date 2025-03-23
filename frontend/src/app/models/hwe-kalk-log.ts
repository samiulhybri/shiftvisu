import { User } from "./user";


export class HweKalkLog {
  id?: number;
  loggable_id?: number;
  entity?: string;
  event?: string;
  created_at?: string;
  description?: string;
  user?: User;
  changing_remark:string = '';

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

  toOdata(): Object {
    return {
      ...this,
      user_id: this.user?.id,
      user: undefined,
      created_at: undefined,
    };
  }
}

import { User as KendoUser } from "@progress/kendo-angular-conversational-ui";
import { ODatable } from "@app/interfaces/odatable";
import { Base } from "./base";

export class User extends Base implements ODatable, KendoUser {
  email?: string;
  email_verified_at: string | any;
  custom_id?: number | any;
  override id!: number;
  permissions?:string[];

  static SERVICE_USER: User = Object.assign(new User(), {
    name: "Service",
    id: 0,
  });

  toOdata(): Object {
    return { ...this };
  }
}

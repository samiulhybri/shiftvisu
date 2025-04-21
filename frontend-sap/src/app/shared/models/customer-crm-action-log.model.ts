import { Deserializable } from "@app/shared/interfaces/deserializable";
import { CrmAction } from "@app/shared/models/crm-action.model";
import { User } from "@app/shared/models/user.model";
import { Contact } from "@app/shared/models/contact.model";

export class CustomerCrmActionLog implements Deserializable {
    id?: number;
    crm_action_id ?: number;
    log_date ?: Date | string = new Date();
    user_id ?: number;
    customer_id ?: number;
    note?: string = "";
    contact?: Contact = new Contact().deserialize({});

    crmAction?: CrmAction = new CrmAction().deserialize({});

    user?: User = new User().deserialize({});

    constructor() {}
     convertToUTC(dateStr: any): any {
        // Extract date and time parts
        const [datePart, timePart] = dateStr.split(', ');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
      
        // Create a Date object in local time
        const localDate = new Date(year, month - 1, day, hour, minute);
      
        // Convert to UTC and return ISO format
        return localDate.toISOString();
      }

    deserialize(input: any): this {
        Object.assign(this, input);
        this.crmAction = new CrmAction().deserialize(input.crmAction || {});
        input?.note ? this.note = input.note : this.note = "";
        this.contact = new Contact().deserialize(input.contact || {});
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            log_date: this.convertToUTC(this.log_date),
            crm_action_id: this.crmAction?.id,
            contact_id: this.contact?.id,
            contact:undefined,
            crmAction: undefined,
            user: undefined
        };
    }
}
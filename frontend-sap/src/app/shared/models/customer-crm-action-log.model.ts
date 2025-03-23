import { Deserializable } from "@app/shared/interfaces/deserializable";
import { CrmAction } from "@app/shared/models/crm-action.model";
import { User } from "@app/shared/models/user.model";
import { Contact } from "@app/shared/models/contact.model";

export class CustomerCrmActionLog implements Deserializable {
    id?: number;
    crm_action_id ?: number;
    log_date ?: Date = new Date();
    user_id ?: number;
    customer_id ?: number;
    note?: string = "";
    contact?: Contact = new Contact().deserialize({});

    crmAction?: CrmAction = new CrmAction().deserialize({});

    user?: User = new User().deserialize({});

    constructor() {}

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
            crm_action_id: this.crmAction?.id,
            contact_id: this.contact?.id,
            contact:undefined,
            crmAction: undefined,
            user: undefined
        };
    }
}
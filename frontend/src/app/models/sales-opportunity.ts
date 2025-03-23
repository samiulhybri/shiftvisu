
import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { Customer } from "./customer";
import { Offer } from "./offer";
import {SalesArea} from "@app/models/sales-area.model";
import {SalesGroup} from "@app/models/sales-group.model";
import {DeliveryTerm} from "@app/models/delivery-term";
import {Country} from "@app/models/country";

export class SalesOpportunity implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    customer_id?: number;
    customer?: Customer;
    contact_person: string = '';
    salesArea?: SalesArea;
    salesGroup?: SalesGroup;
    deliveryTerm?: DeliveryTerm;
    country?: Country;
    postal_code: string = '';
    destination: string = '';
    request_date?: Date;
    offer_until_date?: Date;
    customer_reference: string = '';
    type: string = '';
    additional_info: string = '';
    changes: string = '';
    is_short_offer: boolean = false;
    offer?: Offer;
    is_specification_necessary: boolean = false;
    version?: number;
    phase: string = '';
    status: string = '';
    crm_id?: string;
    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);
        this.customer = input.customer ? new Customer().deserialize(input.customer) : new Customer();
        this.salesArea = input.salesArea ? new SalesArea().deserialize(input.salesArea) : new SalesArea();
        this.salesGroup = input.salesGroup ? new SalesGroup().deserialize(input.salesGroup) : new SalesGroup();
        this.deliveryTerm = input.deliveryTerm ? new DeliveryTerm().deserialize(input.deliveryTerm) : new DeliveryTerm();
        this.country = input.country ? new Country().deserialize(input.country) : new Country();
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            customer_id: this.customer?.id ?? null,
            sales_area_id: this.salesArea?.id ?? null,
            sales_group_id: this.salesGroup?.id ?? null,
            delivery_term_id: this.deliveryTerm?.id ?? null,
            country_id: this.country?.id ?? null,
            offer: undefined,
            customer: undefined,
            salesArea: undefined,
            salesGroup: undefined,
            deliveryTerm: undefined,
            country: undefined,
        };
    }
}

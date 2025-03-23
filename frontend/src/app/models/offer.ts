

import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { Country } from "./country";
import { Customer } from "./customer";
import { DeliveryTerm } from "./delivery-term";
import { HweKalkLog } from "./hwe-kalk-log";
import { OfferPos } from "./offer-pos";
import { SalesOpportunity } from "./sales-opportunity";
import { User } from "./user";
import {SalesArea} from "@app/models/sales-area.model";
import {SalesGroup} from "@app/models/sales-group.model";

export class Offer implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    customer?: Customer;
    sales_opportunity_id?: number;
    salesOpportunity?: SalesOpportunity;
    customer_id?: number;
    contact_person: string = '';
    salesArea?: SalesArea;
    salesGroup?: SalesGroup;
    request_date?: Date | null;
    offer_until_date?: Date | null;
    customer_reference: string = '';
    type: string = '';
    additional_info: string = '';
    changes: string = '';
    deliveryTerm?: DeliveryTerm;
    country?: Country;
    postal_code: string = '';
    destination: string = '';
    is_short_offer: boolean = false;
    is_specification_necessary: boolean = false;
    offerPos: OfferPos[] = [];
    status: string = '';
    phase: string = '';
    logs: HweKalkLog[] = [];
    crm_id?: string;
    user!: User;
    updated_by?: number;
    is_package_price: boolean = false;
    sales_note: string = '';
    version: string = '';
    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.offerPos) {
            this.offerPos = [];

            input.offerPos.forEach((offerPosValue: any) => {
                const pos = new OfferPos().deserialize(offerPosValue);
                pos.offer = this;
                this.offerPos?.push(pos);
            });
        }
        if (input.logs) {
            this.logs = [];
            input.logs.forEach((logs: HweKalkLog) => {
                this.logs?.push(new HweKalkLog().deserialize(logs))
            });
        }

        this.customer = input.customer ? new Customer().deserialize(input.customer) : new Customer();
        this.salesArea = input.salesArea ? new SalesArea().deserialize(input.salesArea) : (input.sales_area ? new SalesArea().deserialize(input.sales_area) : new SalesArea());
        this.salesGroup = input.salesGroup ? new SalesGroup().deserialize(input.salesGroup) : (input.sales_group ? new SalesGroup().deserialize(input.sales_group) : new SalesGroup());
        this.user = input.user ? new User().deserialize(input.user) : new User();
        this.salesOpportunity = input.salesOpportunity ? new SalesOpportunity().deserialize(input.salesOpportunity) : new SalesOpportunity();
        this.request_date = input?.request_date ? new Date(input.request_date) : null;
        this.offer_until_date = input?.offer_until_date ? new Date(input.offer_until_date) : null;
        this.deliveryTerm = input.deliveryTerm ? new DeliveryTerm().deserialize(input.deliveryTerm) : (input.delivery_term ? new DeliveryTerm().deserialize(input.delivery_term) : new DeliveryTerm());
        this.country = input.country ? new Country().deserialize(input.country) : new Country();
        
        return this;
    }

    toOdata(isNewCreate: boolean = false, currentUser?:User): Offer {
        return  {
            ...this,
            id: undefined,
            customer_id: this.customer?.id ?? null,
            sales_area_id: this.salesArea?.id ?? null,
            sales_group_id: this.salesGroup?.id ?? null,
            sales_opportunity_id: this.salesOpportunity?.id ?? null,
            delivery_term_id: this.deliveryTerm?.id ?? null,
            country_id: this.country?.id ?? null,
            salesOpportunity: undefined,
            customer: undefined,
            salesArea: undefined,
            salesGroup: undefined,
            sales_area: undefined,
            sales_group: undefined,
            delivery_term: undefined,
            deliveryTerm: undefined,
            country: undefined,
            offerPos: isNewCreate ? this.getOfferPos() : undefined,
            version: undefined,
            crm_id: undefined,
            offer: undefined,
            user: undefined,
            logs: undefined, 
           '@context': undefined,
            updated_by: currentUser?.id || undefined
        };
    }

    getOfferPos() {
        let offerPosData:any = [];
        this.offerPos.forEach((data: OfferPos) => {
            offerPosData.push(data.toOdata());
        })
        return offerPosData;
    }
}

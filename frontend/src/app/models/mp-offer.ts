import {Customer} from "./customer";
import {MPOfferPos} from "./mp-offer-pos";
import {Deserializable} from "../interfaces/deserializable";
import {ODatable} from "../interfaces/odatable";
import {MPCostGroup} from "../enums/mp-cost-group";
import { MPCostSubGroup } from "../enums/mp-cost-sub-group";
import { User } from "./user";

export class MPOffer implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;
    date?: Date;
    user_id?:number;
    version?: string;
    surplus_material?: number;
    surplus_external?: number;
    surplus_internal?: number;
    surplus_total?: number;
    customer?: Customer;
    finalCustomer?: Customer;
    mpOfferPos?:  MPOfferPos[];
    note?:string;
    project_nr?:string;
    user?:User;
    is_closed?:boolean;
    mp_offer_type?: string;
    tool_type?: string;
    construction_type?: string;
    is_cloned?:boolean;
    is_saved?:boolean;
    surplus_internal_personnel?: number;
    surplus_internal_machine?: number;
    parentOffer?: MPOffer;

    constructor() {}

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.customer)
            this.customer = new Customer().deserialize(input.customer);

        if (input.finalCustomer)
            this.finalCustomer = new Customer().deserialize(input.finalCustomer);

        if (input.user)
            this.user = new User().deserialize(input.user);

        if(input.date)
            this.date = new Date(input.date);

        if (input.parentOffer)
            this.parentOffer = new MPOffer().deserialize(input.parentOffer);

        if (input.mpOfferPos) {
            this.mpOfferPos = [];

            input.mpOfferPos.forEach((mpOfferPos: any) => {
                this.mpOfferPos?.push(new MPOfferPos().deserialize(mpOfferPos))
            });
        }

        return this;
    }

    toOdata(): Object {
        return { ...this, customer_id: this.customer?.id, final_customer_id: this.finalCustomer?.id, 
            user_id:this.user?.id, parent_offer_id:this.parentOffer?.id, customer: undefined, finalCustomer: undefined, mpOfferPos: undefined, 
            user:undefined, parentOffer: undefined };
    }

    getTotal(): number {
        return +(this.getTotalCostGroup(MPCostGroup.MATERIAL) + this.getTotalCostGroup(MPCostGroup.EXTERNAL) 
        + this.getTotalCostGroup(MPCostGroup.INTERNAL)).toFixed(2);
    }

    updateSurplusValues(page: string = '', value:any):number{
        if(value && page != '') return value;
        else if(value && page == '') return value / 100;
        else return 0;
    }

    getTotalSurplus(page: string = ''): number {
        return +(this.getTotalCostGroup(MPCostGroup.MATERIAL) * (1 + (this.updateSurplusValues(page, this.surplus_material))) +
            this.getTotalCostGroup(MPCostGroup.EXTERNAL) * (1 + (this.updateSurplusValues(page, this.surplus_external))) +
            this.getTotalCostGroup(MPCostGroup.INTERNAL) * (1 + (this.updateSurplusValues(page, this.surplus_internal)))).toFixed(2);
    }

    getTotalSurplusPercentage(): number {
        return Math.round(((this.getTotalSurplus() / this.getTotal() - 1))*100);
    }

    getTotalSalesPrice(page: string = ''): number {
        return +(this.getTotalSurplus(page) * (1 + (this.updateSurplusValues(page, this.surplus_total)))).toFixed(2);
    }

    getMargin(): number {
        return +(this.getTotalSalesPrice() - this.getTotal()).toFixed(2);
    }

    getMarginPercentage(): number {
        return +((this.getTotalSalesPrice() / this.getTotal() - 1)*100).toFixed(2);
    }

    getTotalCostGroup(costGroup:MPCostGroup) {
        let total = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_group == costGroup).forEach((offerPos) => total+= offerPos.getTotal());
        
        return +total.toFixed(2);
    }

    getTotalCostSubGroup(costSubGroup:MPCostSubGroup) {
        let total = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_sub_group == costSubGroup).forEach((offerPos) => total+= offerPos.getTotal());
        return total.toFixed(2);
    }

    getTotalPersonHours(costSubGroup:MPCostSubGroup) {
        let total = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_sub_group == costSubGroup).forEach((offerPos) => total+= offerPos.getPersonHours());
        return total.toFixed(0);
    }

    getTotalMachineHours(costSubGroup:MPCostSubGroup){
        let total = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_sub_group == costSubGroup).forEach((offerPos) => total+= offerPos.getMachineHours());
        return total.toFixed(0);
    }

    getTotalSubGroupHours(costSubGroup:MPCostSubGroup){
        let total = 0;
        total = parseFloat(this.getTotalMachineHours(costSubGroup)) + parseFloat(this.getTotalPersonHours(costSubGroup));
        return total.toFixed(0);
    }

    getTotalInternalHours(type: string = '') { 
        let total: number = 0;
        switch(type) {
            case 'personnel': 
                this.mpOfferPos?.filter((offerPos) => offerPos.cost_group == MPCostGroup.INTERNAL).forEach((offerPos) => total+= offerPos.getPersonHours());
                return total.toFixed(0);
            case 'machine':
                this.mpOfferPos?.filter((offerPos) => offerPos.cost_group == MPCostGroup.INTERNAL).forEach((offerPos) => total+= offerPos.getPersonHours());
                this.mpOfferPos?.filter((offerPos) => offerPos.cost_group == MPCostGroup.INTERNAL).forEach((offerPos) => total+= offerPos.getMachineHours());
                return total.toFixed(0);
            default:
                total =  parseInt(this.getTotalInternalHours('personnel')) + parseInt(this.getTotalInternalHours('machine'));
                return total.toFixed(0);
        } 
    }

    getTotalInternal(type: string) {
        switch(type) {
            case 'personnel':
                return +(this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_TECH_OFFICE) + this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_MACHINING) + this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_ASSEMBLY) + this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_EROSION) + this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_QUALITY) + this.getTotalPersonCosts(MPCostSubGroup.INTERNAL_SAMPLING));
            case 'machine':
                return +(this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_TECH_OFFICE) + this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_MACHINING) + this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_ASSEMBLY) + this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_EROSION) + this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_QUALITY) + this.getTotalMachineCosts(MPCostSubGroup.INTERNAL_SAMPLING));
            default:
                return 0;
        }
    }

    getTotalPersonCosts(costSubGroup: MPCostSubGroup) {
        let total: number = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_sub_group == costSubGroup).forEach((offerPos) => total+= offerPos.getPersonTotal());
        return +total.toFixed(2);
    }

    getTotalMachineCosts(costSubGroup: MPCostSubGroup) {
        let total = 0;
        this.mpOfferPos?.filter((offerPos) => offerPos.cost_sub_group == costSubGroup).forEach((offerPos) => total+= offerPos.getMachineTotal());
        return +total.toFixed(2);
    }

    getInternalSurplus() {
        var internal_ratio: number = 0;
        var per_cost = this.getTotalInternal('personnel');
        var mach_cost = this.getTotalInternal('machine');
        var per_sur_total = per_cost + (per_cost * this.updateSurplusValues('', this.surplus_internal_personnel));
        var mach_sur_total = mach_cost + (mach_cost * this.updateSurplusValues('', this.surplus_internal_machine));
        var internal_total = this.getTotalCostGroup(MPCostGroup.INTERNAL);
        internal_ratio = (((per_sur_total + mach_sur_total) - internal_total) / internal_total) * 100; 
        return internal_ratio;
     }
}
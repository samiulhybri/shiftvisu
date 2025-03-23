import {MPCostGroup} from "../enums/mp-cost-group";
import {MPCostSubGroup} from "../enums/mp-cost-sub-group";
import {MPCostType} from "../enums/mp-cost-type";
import {Deserializable} from "../interfaces/deserializable";
import {ODatable} from "../interfaces/odatable";
import { Machine } from "./machine";
import { MPCost } from "./mp-cost";
import { MPMaterial } from "./mp-materials";
import { Supplier } from "./supplier";

export class MPOfferPos implements Deserializable, ODatable {
    id?: number;
    name?: string;
    cost_group?: MPCostGroup;
    cost_sub_group?: MPCostSubGroup;
    cost_type?: MPCostType;
    length?: number;
    width?: number;
    height?: number;
    total?: number;
    quantity?: number;
    price?: number;
    density?: number;
    machine_quantity?: number;
    machine_price?: number;
    personnel_quantity?: number;
    personnel_price?: number;
    mp_material_id? : number;
    mpMaterial?:  MPMaterial;
    supplier?: Supplier;
    supplier_id?:number;
    machine?:Machine;
    mpCost?:MPCost;
    machine_id?:number;    

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.mpMaterial) {
            this.mpMaterial = new MPMaterial().deserialize(input.mpMaterial);
        }

        if(input.supplier){
            this.supplier = new Supplier().deserialize(input.supplier);
        }

        if(input.machine){
            this.machine = new Machine().deserialize(input.machine);
        }

        if(input.mpCost){
            this.mpCost = new MPCost().deserialize(input.mpCost);
        }

        return this;
    }

    toOdata(): Object {
        return { ...this, mpMaterial: undefined, supplier:undefined, machine:undefined,  mpCost:undefined, supplier_id:this.supplier?.id, machine_id:this.machine?.id};
    }
    
    rowIsShow() {
        return !((this.name === 'Campionatura funzionale (< 30 pezzi)' || this.name === 'Stampaggio') && (!this.getTotal() || this.getTotal() === 0));
    }

    getDensity = () =>  {
        if(this.mpMaterial){
            return this.mpMaterial.density;
        }
        return 1;
    }

    getPrice(){
        if(this.mpMaterial){
            return this.mpMaterial.price;
        }
        return 1;
    }

    getMachineHours(){
        if(this.machine_quantity){
            return this.machine_quantity;
        }
        return 0;
    }

    getPersonHours(){
        if(this.personnel_quantity){
            return this.personnel_quantity;
        }
        return 0;
    }

    getTotal() : number {
        switch (this.cost_type) {
            case MPCostType.DIMENSION:
                this.total =+  Number(((this.length?? 0) * (this.height?? 0)  * (this.width?? 0) * (this.getPrice()??0) * (this.getDensity()??0) / 1000000)).toFixed(2);
                return this.total ?? 0;
            case MPCostType.OFFER:
                return (this.total?? 0);
            case MPCostType.FIXED:
                return (this.total?? 0);
            case MPCostType.FIXED_NAME:
                return (this.total?? 0);
            case MPCostType.WEIGHT:
                this.total = +((this.quantity?? 0) * (this.price ?? 0)).toFixed(2);
                return this.total ?? 0;
            case MPCostType.PIECES:
                this.total= +((this.quantity?? 0) * (this.price ?? 0)).toFixed(2);
                return this.total ?? 0;
            case MPCostType.HOURS:
                this.total= +(((this.machine_quantity?? 0) + (this.personnel_quantity?? 0)) * (this.machine_price?? 0) +
                    (this.personnel_quantity?? 0) * (this.personnel_price?? 0)).toFixed(2);
                return this.total ?? 0;
            case MPCostType.HOURS_FIXED:
                this.total= +(((this.personnel_quantity?? 0)) * (this.machine_price?? 0) +
                (this.personnel_quantity?? 0) * (this.personnel_price?? 0)).toFixed(2);
                return this.total ?? 0;
            case MPCostType.PF_PM:
                return (this.total?? 0);
            case MPCostType.MOULDFLOW:
                return (this.total?? 0);
            case MPCostType.FIXED_WEIGHT:
                this.total = +((this.quantity?? 0) * (this.price ?? 0)).toFixed(2);
                return this.total ?? 0;
            default:
                return 0;
        }
    }

    getPersonTotal(): number {
        let total: number = 0;
        if(this.cost_type == MPCostType.HOURS || this.cost_type == MPCostType.HOURS_FIXED) {
            total= +((this.personnel_quantity ?? 0) * (this.personnel_price ?? 0)).toFixed(2);
            return total;
        } 
        return total;
    }

    getMachineTotal(): number {
        let total: number = 0;
        if(this.cost_type == MPCostType.HOURS || this.cost_type == MPCostType.HOURS_FIXED) {
            total= +(((this.personnel_quantity ?? 0) * (this.machine_price ?? 0)) + ((this.machine_quantity ?? 0) * (this.machine_price ?? 0))).toFixed(2);
            return total;
        } 
        return total;
    }
}

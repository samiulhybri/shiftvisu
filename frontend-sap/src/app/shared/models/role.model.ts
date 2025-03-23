import { DatePipe } from "@angular/common";
import { Permission } from "./permission.model";

export class Role {
    id?: number;
    name?: string;
    permissions: Permission[] = [];

    created_at?: string;
    updated_at?: string;

    //internal use only
    permissionString?: string;
    isSelected?:boolean = false;
    createdDate?: string;

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.permissions) {
            this.permissionString = input.permissions.map((el: Permission)=> el.name).join(', ')
        }
        if(input.created_at) {
            const datePipe = new DatePipe('en-US');
            this.createdDate = datePipe.transform(input.created_at, 'dd/MM/yyyy')!;
        }
        return this;
    }

    toJSON() {
        return {
            ...this, 
            permissions: this.permissions?.map(el=> el.name),
            isSelected:undefined,
            permissionString: undefined,
            createdDate: undefined
        };
    }

    toOdata(): Object {
        return {
            ...this,
            isSelected:undefined,
            permissions:undefined,
            permissionString: undefined,
            createdDate: undefined
        };
    }
}
import { DatePipe } from "@angular/common";

export class Permission {
    id?: number;
    name?: string;
    created_at?: string;
    updated_at?: string;

    createdDate?: string; //internal use only

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);
        if(input.created_at) {
            const datePipe = new DatePipe('en-US');
            this.createdDate = datePipe.transform(input.created_at, 'dd/MM/yyyy')!;
        }
        return this;
    }

    toJSON() {
        return {
            ...this,
            createdDate: undefined
        };
    }

    toOdata() {
        return {
            ...this,
            createdDate: undefined
        };
    }
}
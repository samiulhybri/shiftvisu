export class AbsenceTypes{
   
    id?: number;
    custom_id: string = '';

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}


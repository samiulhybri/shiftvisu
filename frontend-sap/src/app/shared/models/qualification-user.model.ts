import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Qualification } from "@app/shared/models/qualification.model";
import { User } from "@app/shared/models/user.model";

export class QualificationUser implements Deserializable {
	id?: number;
	user?: User;
	qualification?: Qualification;
	is_prequalified: boolean = false;
	is_suspended: boolean = false;
	total_hours?:number = 0;
	total_operations?: number = 0;
	operations_imported?: number = 0;
	hours_imported?: number = 0;
	note?: string = '';

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.user) this.user = new User().deserialize(input.user);
		if (input.qualification)
			this.qualification = new Qualification().deserialize(input.qualification);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			user_id: this.user?.id,
			qualification_id: this.qualification?.id,
			user: undefined,
			qualification: undefined,
		};
	}
}

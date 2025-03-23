import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Contact } from "@app/shared/models/contact.model";

export class Contactable implements Deserializable {
	id?: number;
	contactable_type?: string;
	contactable_id?: number;
	contact?: Contact;

	deserialize(input: any) {
		Object.assign(this, input);

		this.contact = new Contact().deserialize(input.contact ?? {})
		
		return this;
	}

	toOdata() {
		return {
			...this,
			contact_id: this.contact?.id,
			contact: undefined,
		};
	}
}

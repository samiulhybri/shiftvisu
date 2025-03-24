import { Deserializable } from "@app/shared/interfaces/deserializable";

export class Media implements Deserializable {
    id?: number;
    model_type?: string;
    model_id?: number;
    uuid?: string;
    collection_name?: string;
    name?: string;
    file_name?: string;
    mime_type?: string;
    disk?: string;
    conversions_disk?: string;
    size?: number;
    manipulations?: string;
    custom_properties?: string;
    generated_conversions?: string;
    responsive_images?: string;
    original_url?: string;
    order_column?: number;
    created_at?: Date;
    updated_at?: Date;
    is_selected?: boolean;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
		};
	}
}

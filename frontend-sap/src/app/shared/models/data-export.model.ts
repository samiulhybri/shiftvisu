import { Deserializable } from "@app/shared/interfaces/deserializable";
import { formatDate } from "@app/shared/utils/date-time-formatter";

export default class DataExport implements Deserializable {
	id?: number;
	data: any;
	name: string = "";
	is_exported: boolean = false;
	is_exporting: boolean = false;
	last_exported_at?: string = "";
	created_at?: string = "";
	result_message: string = "";
	http_method: string = "";
	http_url: string = "";
	http_payload: string = "";

	isSelected?: boolean = false;

	deserialize(input: any): this {
		Object.assign(this, input);

		this.last_exported_at = input?.last_exported_at
			? (formatDate(input.last_exported_at, false) ?? "")
			: "";
		this.created_at = input?.created_at ? (formatDate(input.created_at, false) ?? "") : "";

		this.http_method ??= "";
		this.http_url ??= "";

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isSelected: undefined,
		};
	}
}

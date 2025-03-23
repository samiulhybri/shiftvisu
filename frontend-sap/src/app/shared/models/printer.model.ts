import { Protocol, ProtocolClass } from "@app/shared/enums/Protocol";
import { RequestType, RequestTypeClass } from "@app/shared/enums/RequestType";
import { PrinterLanguage, PrinterLanguageClass } from "@app/shared/enums/PrinterLanguage";
import { Deserializable } from "@app/shared/interfaces/deserializable";

export class Printer implements Deserializable {
	id?: number;
	name?: string = "";
	brand?: string = "";
	model?: string = "";
	ip_address?: string = "";
	port?: number;
	request_type:string = RequestTypeClass.getStateTranslate(RequestType.HTTP);
	protocol:string = ProtocolClass.getStateTranslate(Protocol.TCP);
	language :string= PrinterLanguageClass.getStateTranslate(PrinterLanguage.EPL);
	isSelected?: boolean = false; //for internal use 

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.request_type) {
			this.request_type = RequestTypeClass.getStateTranslate(input.request_type);
		}
		if (input.protocol) {
			this.protocol = ProtocolClass.getStateTranslate(input.protocol);
		}
		if (input.language) {
			this.language = PrinterLanguageClass.getStateTranslate(input.language);
		}
		
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			request_type: RequestTypeClass.getStateValue(this.request_type),
			protocol: ProtocolClass.getStateValue(this.protocol),
			language: PrinterLanguageClass.getStateValue(this.language),
			isSelected: undefined,
		};
	}
}

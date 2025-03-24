import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Message } from "@app/shared/models/message.model";

export class Chat implements Deserializable {
	id?: number;
	name?: string = "";
	is_group_chat: boolean = false;
	is_managed_chat: boolean = false;
	associated_module?: string;
	messages: Message[] = [];

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.messages)
			this.messages = input.messages.map((message: Message) =>
				new Message().deserialize(message)
			);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			messages: undefined,
		};
	}
}

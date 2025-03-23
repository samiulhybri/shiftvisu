import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Chat } from "@app/shared/models/chat.model";
import { User } from "@app/shared/models/user.model";
import { Media } from "@app/shared/models/media.model";

export class Message implements Deserializable {
	id?: number;
	content?: string = "";
	read_by_all: boolean = false;
	chat: Chat | undefined;
	media?: Media;
	sender: User | undefined;
    created_at: Date = new Date();

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.chat = new Chat().deserialize(input.chat || { id: input.chat_id });
		this.sender = new User().deserialize(input.sender || { id: input.sender_user_id });

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			chat_id: this.chat?.id,
			sender_user_id: this.sender?.id,
			chat: undefined,
			sender: undefined,
			read_by: undefined,
			message: undefined,
			media: undefined,
			chat_action: undefined,
		};
	}
}
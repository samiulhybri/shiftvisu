import { Deserializable } from "@app/shared/interfaces/deserializable";
import NotificationGroup from "@app/shared/models/notification-group.model";

export default class NotificationGroupEmailAddress implements Deserializable {
	id?: number;
	email_address: string = "";
	notificationGroup: NotificationGroup = new NotificationGroup().deserialize({});

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.notificationGroup)
			this.notificationGroup = new NotificationGroup().deserialize(input.notificationGroup);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			notification_group_id: this.notificationGroup?.id,
			notificationGroup: undefined,
		};
	}
}

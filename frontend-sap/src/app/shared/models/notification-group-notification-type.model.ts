import { Deserializable } from "@app/shared/interfaces/deserializable";
import NotificationGroup from "@app/shared/models/notification-group-notification-type.model";

export default class NotificationGroupNotificationType implements Deserializable {
	id?: number;
	notification_type?: string = "";
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
			notificationGroup: undefined,
		};
	}
}

import { Deserializable } from "@app/shared/interfaces/deserializable";
import NotificationGroupUser from "@app/shared/models/notification-group-user.model";
import NotificationGroupEmailAddress from "@app/shared/models/notification-group-email-address.model";
import NotificationGroupNotificationType from "@app/shared/models/notification-group-notification-type.model";

export default class NotificationGroup implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	notificationGroupUsers: NotificationGroupUser[] = [];
	notificationGroupEmailAddresses: NotificationGroupEmailAddress[] = [];
	notificationGroupNotificationTypes: NotificationGroupNotificationType[] = [];

	deserialize(input: any): this {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			notificationGroupUsers: undefined,
			notificationGroupEmailAddresses: undefined,
			notificationGroupNotificationTypes: undefined,
		};
	}
}

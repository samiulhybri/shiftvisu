import { Deserializable } from "@app/shared/interfaces/deserializable";
import NotificationGroup from "@app/shared/models/notification-group.model";
import { User } from "@app/shared/models/user.model";

export default class NotificationGroupUser implements Deserializable {
	id?: number;
	notificationGroup: NotificationGroup = new NotificationGroup().deserialize({});
	user: User = new User().deserialize({});

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.notificationGroup)
			this.notificationGroup = new NotificationGroup().deserialize(input.notificationGroup);
		
		if (input.user)
			this.user = new User().deserialize(input.user);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
		};
	}
}
